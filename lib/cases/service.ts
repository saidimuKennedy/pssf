import { CaseType, Role, CaseStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { generateCaseReference } from "./reference"
import { transition } from "@/lib/state-machine/transitions"
import { getInitialRoute } from "@/lib/state-machine/routing"
import { AuthError } from "@/lib/state-machine/guards"
import { validateSubmissionDocuments } from "@/lib/documents/service"
import { validateAllocation } from "@/lib/beneficiaries/service"

async function getMemberIdForUser(userId: string): Promise<string | null> {
  const member = await prisma.member.findFirst({
    where: { user_id: userId },
    select: { id: true },
  })
  return member?.id ?? null
}

async function getEmployerIdForUser(userId: string): Promise<string | null> {
  const officer = await prisma.employerOfficer.findFirst({
    where: { user_id: userId },
    select: { employer_id: true },
  })
  return officer?.employer_id ?? null
}

export interface CreateCaseInput {
  type: CaseType
  memberId?: string
  employerId?: string
  claimantName?: string
  formData: Record<string, unknown>
}

export async function createCase(input: CreateCaseInput, actorId: string): Promise<string> {
  const reference = await generateCaseReference(input.type)

  const caseRecord = await (prisma.case.create as any)({
    data: {
      reference,
      type: input.type,
      status: CaseStatus.DRAFT,
      member_id: input.memberId,
      employer_id: input.employerId,
      claimant_name: input.claimantName,
      form_data: input.formData,
    },
  })

  return caseRecord.id
}

export async function getCase(
  caseId: string,
  actorId: string,
  actorRole: Role
): Promise<unknown> {
  const caseRecord = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
    include: {
      member: true,
      employer: true,
      documents: { orderBy: { created_at: "asc" } },
      status_history: { orderBy: { created_at: "desc" } },
      tasks: true,
      approvals: true,
      beneficiaries: true,
      notes: { orderBy: { created_at: "desc" } },
      notifications: { orderBy: { created_at: "desc" } },
    },
  })

  if (actorRole === Role.MEMBER) {
    const memberId = await getMemberIdForUser(actorId)
    if (!memberId || caseRecord.member_id !== memberId) {
      throw new AuthError("NOT_FOUND", "Case not found or access denied")
    }
  } else if (actorRole === Role.CLAIMANT) {
    const fd = (caseRecord.form_data as Record<string, unknown>) ?? {}
    if (fd.claimant_user_id !== actorId) {
      throw new AuthError("NOT_FOUND", "Case not found or access denied")
    }
  } else if (actorRole === Role.EMPLOYER) {
    const employerId = await getEmployerIdForUser(actorId)
    if (!employerId || caseRecord.employer_id !== employerId) {
      throw new AuthError("NOT_FOUND", "Case not found or access denied")
    }
  }

  return caseRecord
}

export interface ListCasesFilters {
  status?: CaseStatus
  type?: CaseType
  page?: number
  limit?: number
  search?: string
}

export async function listCases(
  actorId: string,
  actorRole: Role,
  filters?: ListCasesFilters
): Promise<{ total: number; page: number; limit: number; data: unknown[] }> {
  const where: Record<string, unknown> = {}
  const page = filters?.page ?? 1
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 20))

  if (actorRole === Role.MEMBER) {
    const memberId = await getMemberIdForUser(actorId)
    if (!memberId) return { total: 0, page, limit, data: [] }
    where.member_id = memberId
  } else if (actorRole === Role.CLAIMANT) {
    where.type = CaseType.DEATH_BENEFITS_CLAIM
    where.form_data = { path: ["claimant_user_id"], equals: actorId }
  } else if (actorRole === Role.EMPLOYER) {
    const employerId = await getEmployerIdForUser(actorId)
    if (!employerId) return { total: 0, page, limit, data: [] }
    where.employer_id = employerId
  }

  if (filters?.status) where.status = filters.status
  if (filters?.type) where.type = filters.type
  if (filters?.search) {
    where.reference = { contains: filters.search, mode: "insensitive" }
  }

  const [total, data] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      include: {
        member: { select: { full_name: true } },
        employer: { select: { name: true } },
        status_history: { orderBy: { created_at: "desc" }, take: 1 },
      },
      orderBy: { updated_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return { total, page, limit, data }
}

export async function updateFormData(
  caseId: string,
  formData: Record<string, unknown>,
  actorId: string
): Promise<void> {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })

  if (caseRecord.status !== CaseStatus.DRAFT) {
    throw new AuthError(
      "INVALID_OPERATION",
      "Can only edit form data on DRAFT cases"
    )
  }

  await (prisma.case.update as any)({
    where: { id: caseId },
    data: { form_data: formData },
  })
}

export async function submitCase(
  caseId: string,
  actorId: string,
  actorRole: Role,
  ipAddress?: string
): Promise<void> {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })

  if (caseRecord.status !== CaseStatus.DRAFT) {
    throw new AuthError("INVALID_OPERATION", "Can only submit DRAFT cases")
  }

  const formData = (caseRecord.form_data as Record<string, unknown>) ?? {}

  if (caseRecord.type === CaseType.BENEFITS_CLAIM) {
    if (!formData.payment_confirmed || !formData.preview_payment_confirmed) {
      throw new AuthError(
        "VALIDATION_ERROR",
        "Payment details must be confirmed on both the payment and preview steps before submission."
      )
    }
  }

  if (caseRecord.type === CaseType.BENEFICIARY_NOMINATION) {
    const { valid, total } = await validateAllocation(caseId)
    if (!valid) {
      throw new AuthError(
        "ALLOCATION_INVALID",
        `Beneficiary allocations must total exactly 100%. Current total: ${total}%.`,
        { total }
      )
    }
  }

  const { valid, missing } = await validateSubmissionDocuments(caseId, caseRecord.type, formData)
  if (!valid) {
    throw new AuthError(
      "DOCUMENT_REQUIRED",
      `Missing required documents: ${missing.join(", ")}`,
      { missing }
    )
  }

  // Transition to SUBMITTED
  await transition({
    caseId,
    action: "SUBMIT",
    actorId,
    actorRole,
    nextStatus: CaseStatus.SUBMITTED,
    ipAddress,
  })

  // Get initial route and transition to it
  const initialRoute = getInitialRoute(caseRecord.type, caseRecord.form_data as Record<string, unknown>)
  await transition({
    caseId,
    action: "ROUTE",
    nextStatus: initialRoute,
    ipAddress,
  })
}

export async function submitAdditionalInfo(
  caseId: string,
  response: Record<string, unknown>,
  actorId: string
): Promise<void> {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })

  if (caseRecord.status !== CaseStatus.MORE_INFO_REQUIRED) {
    throw new AuthError(
      "INVALID_OPERATION",
      "Case is not in MORE_INFO_REQUIRED status"
    )
  }

  // Merge additional info into form_data
  const existingData = (caseRecord.form_data as Record<string, unknown>) ?? {}
  const updatedFormData = {
    ...existingData,
    additional_info: response,
  }

  await (prisma.case.update as any)({
    where: { id: caseId },
    data: { form_data: updatedFormData },
  })

  // Transition back to UNDER_REVIEW
  await transition({
    caseId,
    action: "SUBMIT_ADDITIONAL_INFO",
    actorId,
    actorRole: Role.MEMBER,
    nextStatus: CaseStatus.UNDER_REVIEW,
  })
}

export async function addNote(
  caseId: string,
  content: string,
  actorId: string
): Promise<void> {
  await prisma.caseNote.create({
    data: {
      case_id: caseId,
      author_id: actorId,
      content,
      is_internal: true,
    },
  })
}

export async function reassignCase(
  caseId: string,
  newAssigneeId: string,
  actorId: string
): Promise<void> {
  const caseRecord = await prisma.case.findUniqueOrThrow({
    where: { id: caseId },
    select: { reference: true, type: true },
  })

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { email: true },
  })

  await prisma.case.update({
    where: { id: caseId },
    data: { assigned_to: newAssigneeId },
  })

  const { dispatch } = await import("@/lib/notifications/dispatch")
  await dispatch({
    case_id: caseId,
    recipient_id: newAssigneeId,
    recipient_type: "PSSF_STAFF",
    trigger_event: "CASE_REASSIGNED",
    variables: {
      case_reference: caseRecord.reference,
      case_type_label: caseRecord.type.replace(/_/g, " "),
      reassigned_by: actor?.email ?? actorId,
    },
  })
}

export async function closeCase(
  caseId: string,
  actorId: string
): Promise<void> {
  await transition({
    caseId,
    action: "CLOSE_CASE",
    actorId,
    actorRole: Role.PSSF_SUPERVISOR,
    nextStatus: CaseStatus.CLOSED,
  })
}
