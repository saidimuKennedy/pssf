import { CaseStatus, CaseType, Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { transition } from "@/lib/state-machine/transitions"
import { AuthError } from "@/lib/state-machine/guards"

export async function routeToVerification(caseId: string, actorId: string, actorRole: Role) {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })
  if (caseRecord.status !== CaseStatus.UNDER_REVIEW) {
    throw new AuthError("INVALID_OPERATION", "Case must be under review")
  }
  await transition({
    caseId,
    action: "ROUTE_TO_VERIFICATION",
    actorId,
    actorRole,
    nextStatus: CaseStatus.UNDER_VERIFICATION,
  })
}

export async function routeToTrustee(caseId: string, actorId: string, actorRole: Role) {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })
  if (caseRecord.type !== CaseType.DEATH_BENEFITS_CLAIM) {
    throw new AuthError("INVALID_OPERATION", "Trustee routing only applies to death benefits claims")
  }
  if (caseRecord.status !== CaseStatus.UNDER_VERIFICATION) {
    throw new AuthError("INVALID_OPERATION", "Case must be under verification")
  }
  await transition({
    caseId,
    action: "ROUTE_TO_TRUSTEE",
    actorId,
    actorRole,
    nextStatus: CaseStatus.AWAITING_TRUSTEE,
  })
}

export async function markPaymentProcessing(caseId: string, actorId: string, actorRole: Role) {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })
  if (caseRecord.status !== CaseStatus.APPROVED) {
    throw new AuthError("INVALID_OPERATION", "Case must be approved")
  }
  await transition({
    caseId,
    action: "MARK_PAYMENT_PROCESSING",
    actorId,
    actorRole,
    nextStatus: CaseStatus.PAYMENT_PROCESSING,
  })
}

export async function markPaid(caseId: string, actorId: string, actorRole: Role) {
  const caseRecord = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })
  if (caseRecord.status !== CaseStatus.PAYMENT_PROCESSING) {
    throw new AuthError("INVALID_OPERATION", "Case must be in payment processing")
  }
  await transition({
    caseId,
    action: "MARK_PAID",
    actorId,
    actorRole,
    nextStatus: CaseStatus.COMPLETED,
  })
}

export async function assignCase(caseId: string, assigneeId: string) {
  await prisma.case.update({
    where: { id: caseId },
    data: { assigned_to: assigneeId },
  })
}
