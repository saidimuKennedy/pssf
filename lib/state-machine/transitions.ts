import { CaseStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { assertValidTransition, assertRoleCanPerformAction } from "./guards"
import { generateTask } from "./tasks"
import { logAuditEvent } from "@/lib/audit/log"

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
    assertValidTransition(currentStatus, nextStatus)
  }

  // Validate actor permission
  assertRoleCanPerformAction(actorRole, context.action)

  // Execute atomic transaction
  return await prisma.$transaction(async (tx) => {
    // Update case status
    await (tx as typeof prisma).case.update({
      where: { id: context.caseId },
      data: {
        status: nextStatus,
        updated_at: new Date(),
        submitted_at: context.action === "SUBMIT" ? new Date() : undefined,
      },
    })

    // Record status history
    await (tx as typeof prisma).caseStatusHistory.create({
      data: {
        case_id: context.caseId,
        from_status: currentStatus,
        to_status: nextStatus,
        changed_by: context.actorId,
        reason: context.reason,
      },
    })

    // Generate task for new status
    if (nextStatus !== currentStatus) {
      await generateTask(context.caseId, nextStatus)
    }

    // Log audit event
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

    return nextStatus
  })
}
