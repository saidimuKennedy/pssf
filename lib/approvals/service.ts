import { ApprovalType, ApprovalDecision, CaseStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { transition } from "@/lib/state-machine/transitions"
import { dispatchForCaseEvent } from "@/lib/notifications/dispatch"
import { AuthError } from "@/lib/state-machine/guards"

export interface RecordApprovalInput {
  caseId: string
  decision: ApprovalDecision
  reason?: string
  comments?: string
  actorId: string
  actorName: string
  actorRole: Role
  actorOrg?: string
}

export async function recordEmployerApproval(
  input: RecordApprovalInput
): Promise<void> {
  const caseRecord = await prisma.case.findUniqueOrThrow({
    where: { id: input.caseId },
  })

  if (caseRecord.status !== CaseStatus.PENDING_EMPLOYER) {
    throw new AuthError(
      "INVALID_STATUS",
      "Case is not awaiting employer approval"
    )
  }

  // Record approval
  await prisma.approval.create({
    data: {
      case_id: input.caseId,
      type: ApprovalType.EMPLOYER,
      decision: input.decision,
      actor_id: input.actorId,
      actor_name: input.actorName,
      actor_role: input.actorRole.toString(),
      actor_org: input.actorOrg,
      reason: input.reason,
      comments: input.comments,
    },
  })

  if (input.decision === ApprovalDecision.REQUEST_CORRECTION) {
    if (!input.reason?.trim()) {
      throw new AuthError("VALIDATION_ERROR", "Correction reason is required")
    }
    await transition({
      caseId: input.caseId,
      action: "EMPLOYER_REQUEST_CORRECTION",
      actorId: input.actorId,
      actorRole: input.actorRole,
      nextStatus: CaseStatus.DRAFT,
      reason: input.reason,
      metadata: { decision: input.decision, correction_reason: input.reason },
    })
    await dispatchForCaseEvent(input.caseId, "MORE_INFO_REQUIRED", {
      info_requested: input.reason,
      case_type_label: caseRecord.type.replace(/_/g, " "),
    })
    return
  }

  const nextStatus =
    input.decision === ApprovalDecision.APPROVED
      ? CaseStatus.EMPLOYER_APPROVED
      : CaseStatus.EMPLOYER_REJECTED

  await transition({
    caseId: input.caseId,
    action: "EMPLOYER_DECIDE",
    actorId: input.actorId,
    actorRole: input.actorRole,
    nextStatus,
    reason: input.reason,
    metadata: { decision: input.decision },
  })
}

export async function recordPssfApproval(
  input: RecordApprovalInput
): Promise<void> {
  const caseRecord = await prisma.case.findUniqueOrThrow({
    where: { id: input.caseId },
  })

  // PSSF can approve from multiple statuses
  const approvableStatuses: CaseStatus[] = [
    CaseStatus.UNDER_REVIEW,
    CaseStatus.UNDER_VERIFICATION,
  ]
  if (!approvableStatuses.includes(caseRecord.status)) {
    throw new AuthError(
      "INVALID_STATUS",
      `Case status ${caseRecord.status} cannot be approved by PSSF`
    )
  }

  await prisma.approval.create({
    data: {
      case_id: input.caseId,
      type: ApprovalType.PSSF,
      decision: input.decision,
      actor_id: input.actorId,
      actor_name: input.actorName,
      actor_role: input.actorRole.toString(),
      actor_org: "PSSF",
      reason: input.reason,
      comments: input.comments,
    },
  })

  // Determine next status based on current status and decision
  let nextStatus: CaseStatus
  if (input.decision === ApprovalDecision.APPROVED) {
    nextStatus = CaseStatus.APPROVED
  } else if (input.decision === ApprovalDecision.REQUEST_MORE_INFO) {
    nextStatus = CaseStatus.MORE_INFO_REQUIRED
  } else {
    nextStatus = CaseStatus.REJECTED
  }

  await transition({
    caseId: input.caseId,
    action: "PSSF_DECIDE",
    actorId: input.actorId,
    actorRole: input.actorRole,
    nextStatus,
    reason: input.reason,
    metadata: { decision: input.decision },
  })
}

export async function recordTrusteeDecision(
  input: RecordApprovalInput
): Promise<void> {
  if (input.actorRole !== Role.PSSF_SUPERVISOR) {
    throw new AuthError(
      "FORBIDDEN",
      "Only PSSF_SUPERVISOR can record trustee decisions"
    )
  }

  const caseRecord = await prisma.case.findUniqueOrThrow({
    where: { id: input.caseId },
  })

  if (caseRecord.status !== CaseStatus.AWAITING_TRUSTEE) {
    throw new AuthError(
      "INVALID_STATUS",
      "Case is not awaiting trustee decision"
    )
  }

  await prisma.approval.create({
    data: {
      case_id: input.caseId,
      type: ApprovalType.TRUSTEE,
      decision: input.decision,
      actor_id: input.actorId,
      actor_name: input.actorName,
      actor_role: input.actorRole.toString(),
      actor_org: "PSSF",
      reason: input.reason,
      comments: input.comments,
    },
  })

  const nextStatus =
    input.decision === ApprovalDecision.APPROVED
      ? CaseStatus.APPROVED
      : CaseStatus.REJECTED

  await transition({
    caseId: input.caseId,
    action: "TRUSTEE_DECIDE",
    actorId: input.actorId,
    actorRole: input.actorRole,
    nextStatus,
    reason: input.reason,
    metadata: { decision: input.decision },
  })
}
