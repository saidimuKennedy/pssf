import { CaseStatus, CaseType, Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { AuthError } from "@/lib/state-machine/guards"
import { logAuditEvent } from "@/lib/audit/log"
import type { BeneficiaryInput } from "@/lib/validations/beneficiaries"

async function getMemberIdForUser(userId: string): Promise<string | null> {
  const member = await prisma.member.findFirst({
    where: { user_id: userId },
    select: { id: true },
  })
  return member?.id ?? null
}

async function assertCaseAccess(
  caseId: string,
  actorId: string,
  actorRole: Role
): Promise<{ id: string; status: CaseStatus; type: CaseType; form_data: unknown }> {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })

  if (actorRole === Role.MEMBER || actorRole === Role.CLAIMANT) {
    const memberId = await getMemberIdForUser(actorId)
    if (!memberId || caseRecord.member_id !== memberId) {
      throw new AuthError("NOT_FOUND", "Case not found or access denied")
    }
  } else if (actorRole === Role.EMPLOYER) {
    const officer = await prisma.employerOfficer.findFirst({
      where: { user_id: actorId },
      select: { employer_id: true },
    })
    if (!officer || caseRecord.employer_id !== officer.employer_id) {
      throw new AuthError("NOT_FOUND", "Case not found or access denied")
    }
  }

  return caseRecord
}

function relationshipLabel(data: BeneficiaryInput): string {
  return data.relationship === "Other"
    ? (data.relationship_other ?? "Other")
    : data.relationship
}

async function syncMinorFlag(caseId: string): Promise<void> {
  const minors = await prisma.beneficiary.count({
    where: { case_id: caseId, is_minor: true },
  })
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })
  const formData = (caseRecord.form_data as Record<string, unknown>) ?? {}

  await (prisma.case.update as any)({
    where: { id: caseId },
    data: {
      form_data: {
        ...formData,
        has_minor_beneficiary: minors > 0,
      },
    },
  })
}

export async function getBeneficiaries(
  caseId: string,
  actorId: string,
  actorRole: Role
) {
  await assertCaseAccess(caseId, actorId, actorRole)

  return prisma.beneficiary.findMany({
    where: { case_id: caseId },
    orderBy: { created_at: "asc" },
  })
}

export async function addBeneficiary(
  caseId: string,
  data: BeneficiaryInput,
  actorId: string,
  actorRole: Role
) {
  const caseRecord = await assertCaseAccess(caseId, actorId, actorRole)

  if (caseRecord.status !== CaseStatus.DRAFT) {
    throw new AuthError("CASE_NOT_EDITABLE", "Can only add beneficiaries on DRAFT cases")
  }
  if (caseRecord.type !== CaseType.BENEFICIARY_NOMINATION) {
    throw new AuthError("INVALID_OPERATION", "Beneficiaries can only be added to nomination cases")
  }

  const beneficiary = await prisma.beneficiary.create({
    data: {
      case_id: caseId,
      surname: data.surname,
      first_name: data.first_name,
      middle_name: data.middle_name,
      relationship: relationshipLabel(data),
      national_id: data.is_minor ? null : data.national_id ?? null,
      birth_cert_number: data.birth_cert_number ?? null,
      date_of_birth: new Date(data.date_of_birth),
      mobile_number: data.mobile_number ?? null,
      allocation_percent: data.allocation_percent,
      is_minor: data.is_minor,
    },
  })

  await syncMinorFlag(caseId)

  await logAuditEvent({
    case_id: caseId,
    action: "BENEFICIARY_ADDED",
    actor_id: actorId,
    actor_role: actorRole,
    metadata: { beneficiary_id: beneficiary.id },
  })

  return beneficiary
}

export async function updateBeneficiary(
  beneficiaryId: string,
  data: Partial<BeneficiaryInput>,
  actorId: string,
  actorRole: Role
) {
  const existing = await prisma.beneficiary.findUniqueOrThrow({
    where: { id: beneficiaryId },
    include: { case: true },
  })

  await assertCaseAccess(existing.case_id, actorId, actorRole)

  if (existing.case.status !== CaseStatus.DRAFT) {
    throw new AuthError("CASE_NOT_EDITABLE", "Can only update beneficiaries on DRAFT cases")
  }

  const isMinor = data.is_minor ?? existing.is_minor
  const relationship =
    data.relationship !== undefined
      ? data.relationship === "Other"
        ? (data.relationship_other ?? "Other")
        : data.relationship
      : existing.relationship

  const updated = await prisma.beneficiary.update({
    where: { id: beneficiaryId },
    data: {
      surname: data.surname,
      first_name: data.first_name,
      middle_name: data.middle_name,
      relationship,
      national_id: isMinor ? null : (data.national_id ?? existing.national_id),
      birth_cert_number: data.birth_cert_number ?? existing.birth_cert_number,
      date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      mobile_number: data.mobile_number ?? existing.mobile_number,
      allocation_percent: data.allocation_percent,
      is_minor: data.is_minor,
    },
  })

  await syncMinorFlag(existing.case_id)

  await logAuditEvent({
    case_id: existing.case_id,
    action: "BENEFICIARY_UPDATED",
    actor_id: actorId,
    actor_role: actorRole,
    metadata: { beneficiary_id: beneficiaryId },
  })

  return updated
}

export async function removeBeneficiary(
  beneficiaryId: string,
  caseId: string,
  actorId: string,
  actorRole: Role
) {
  const existing = await prisma.beneficiary.findFirstOrThrow({
    where: { id: beneficiaryId, case_id: caseId },
    include: { case: true },
  })

  await assertCaseAccess(caseId, actorId, actorRole)

  if (existing.case.status !== CaseStatus.DRAFT) {
    throw new AuthError("CASE_NOT_EDITABLE", "Can only remove beneficiaries on DRAFT cases")
  }

  await prisma.beneficiary.delete({ where: { id: beneficiaryId } })
  await syncMinorFlag(caseId)

  await logAuditEvent({
    case_id: caseId,
    action: "BENEFICIARY_REMOVED",
    actor_id: actorId,
    actor_role: actorRole,
    metadata: { beneficiary_id: beneficiaryId },
  })
}

export async function validateAllocation(
  caseId: string
): Promise<{ valid: boolean; total: number }> {
  const beneficiaries = await prisma.beneficiary.findMany({
    where: { case_id: caseId },
    select: { allocation_percent: true },
  })

  const total = beneficiaries.reduce(
    (sum, b) => sum + Number(b.allocation_percent),
    0
  )

  return {
    valid: Math.abs(total - 100) < 0.01,
    total: Math.round(total * 100) / 100,
  }
}
