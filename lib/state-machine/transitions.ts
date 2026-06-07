import { CaseStatus, CaseType, DocumentStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { assertValidTransition, assertRoleCanPerformAction } from "./guards"
import { generateTask } from "./tasks"
import { logAuditEvent } from "@/lib/audit/log"
import { dispatchForCaseEvent } from "@/lib/notifications/dispatch"

const STATUS_TO_TRIGGER: Partial<Record<CaseStatus, string>> = {
  [CaseStatus.SUBMITTED]: "CASE_SUBMITTED",
  [CaseStatus.PENDING_EMPLOYER]: "PENDING_EMPLOYER",
  [CaseStatus.EMPLOYER_APPROVED]: "EMPLOYER_APPROVED",
  [CaseStatus.EMPLOYER_REJECTED]: "EMPLOYER_REJECTED",
  [CaseStatus.MORE_INFO_REQUIRED]: "MORE_INFO_REQUIRED",
  [CaseStatus.APPROVED]: "CASE_APPROVED",
  [CaseStatus.REJECTED]: "CASE_REJECTED",
  [CaseStatus.PAYMENT_PROCESSING]: "PAYMENT_PROCESSING",
  [CaseStatus.COMPLETED]: "CASE_COMPLETED",
}

const CASE_TYPE_LABELS: Record<CaseType, string> = {
  MEMBER_ENROLMENT: "Member Enrolment",
  BENEFICIARY_NOMINATION: "Beneficiary Nomination",
  AVC: "Additional Voluntary Contribution",
  BENEFITS_CLAIM: "Benefits Claim",
  DEATH_BENEFITS_CLAIM: "Death Benefits Claim",
  MISSING_CONTRIBUTION: "Missing Contribution",
  DISCREPANCY: "Discrepancy",
}

export interface TransitionContext {
  caseId: string
  action: string
  actorId?: string
  actorRole?: Role
  reason?: string
  nextStatus?: CaseStatus
  metadata?: Record<string, unknown>
  ipAddress?: string
}

export async function transition(context: TransitionContext): Promise<CaseStatus> {
  const caseRecord = await prisma.case.findUniqueOrThrow({
    where: { id: context.caseId },
  })

  const currentStatus = caseRecord.status
  const nextStatus = context.nextStatus || currentStatus
  const actorRole = context.actorRole || Role.ADMIN

  // Validate transition legality
  if (nextStatus !== currentStatus) {
    assertValidTransition(currentStatus, nextStatus, caseRecord.type)
  }

  // Validate actor permission
  assertRoleCanPerformAction(actorRole, context.action)

  await prisma.$transaction(async (tx) => {
    await tx.case.update({
      where: { id: context.caseId },
      data: {
        status: nextStatus,
        updated_at: new Date(),
        submitted_at: context.action === "SUBMIT" ? new Date() : undefined,
      },
    })
    await tx.caseStatusHistory.create({
      data: {
        case_id: context.caseId,
        from_status: currentStatus,
        to_status: nextStatus,
        changed_by: context.actorId,
        reason: context.reason,
      },
    })
    if (nextStatus === CaseStatus.UNDER_REVIEW && currentStatus !== CaseStatus.UNDER_REVIEW) {
      await tx.document.updateMany({
        where: {
          case_id: context.caseId,
          status: DocumentStatus.UPLOADED,
        },
        data: { status: DocumentStatus.UNDER_REVIEW },
      })
    }
  })

  const result = nextStatus

  // Post-commit side-effects — not atomic, failures don't roll back the status change
  if (nextStatus !== currentStatus) {
    await generateTask(context.caseId, nextStatus).catch((err) =>
      console.error("[Tasks] generateTask failed:", err)
    )
  }

  await logAuditEvent({
    case_id: context.caseId,
    action: context.action,
    actor_id: context.actorId,
    actor_role: context.actorRole?.toString(),
    from_status: currentStatus,
    to_status: nextStatus,
    metadata: context.metadata,
    ip_address: context.ipAddress,
  })

  // Fire-and-forget dispatch after transaction commits — never blocks transition
  const triggerEvent = STATUS_TO_TRIGGER[result]
  if (triggerEvent) {
    dispatchForCaseEvent(context.caseId, triggerEvent, {
      case_reference: caseRecord.reference,
      case_type_label: CASE_TYPE_LABELS[caseRecord.type] ?? caseRecord.type,
      rejection_reason: context.reason ?? "",
      info_requested: context.reason ?? "",
      ...((context.metadata as Record<string, string>) ?? {}),
    }).catch((err) => console.error("[Notification] Post-transition dispatch:", err))
  }

  return result
}
