import { CaseType, Role, CaseStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { generateCaseReference } from "./reference"
import { transition, TransitionContext } from "@/lib/state-machine/transitions"
import { getInitialRoute } from "@/lib/state-machine/routing"
import { AuthError } from "@/lib/state-machine/guards"

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
      status_history: { orderBy: { created_at: "asc" } },
      tasks: true,
      approvals: true,
      beneficiaries: true,
      notes: { orderBy: { created_at: "desc" } },
    },
  })

  // Enforce scoping
  if (actorRole === Role.MEMBER || actorRole === Role.CLAIMANT) {
    if (caseRecord.member_id !== actorId) {
      throw new AuthError("FORBIDDEN", "Cannot access this case")
    }
  } else if (actorRole === Role.EMPLOYER) {
    if (caseRecord.employer_id !== actorId) {
      throw new AuthError("FORBIDDEN", "Cannot access this case")
    }
  }

  return caseRecord
}

export async function listCases(
  actorId: string,
  actorRole: Role,
  filters?: Record<string, unknown>
): Promise<unknown[]> {
  let where: Record<string, unknown> = {}

  if (actorRole === Role.MEMBER || actorRole === Role.CLAIMANT) {
    where.member_id = actorId
  } else if (actorRole === Role.EMPLOYER) {
    where.employer_id = actorId
  }

  return await prisma.case.findMany({
    where,
    include: { status_history: true },
    orderBy: { created_at: "desc" },
    take: filters?.limit ? (filters.limit as number) : 100,
  })
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
  await prisma.case.update({
    where: { id: caseId },
    data: { assigned_to: newAssigneeId },
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
