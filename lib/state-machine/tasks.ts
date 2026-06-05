import { CaseType, CaseStatus, TaskStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/db"

const TASK_TYPE_MAP: Record<CaseStatus, { type: string; assignRole?: Role }> = {
  DRAFT: { type: "MEMBER_REVIEW" },
  SUBMITTED: { type: "ROUTE" },
  PENDING_EMPLOYER: { type: "EMPLOYER_REVIEW", assignRole: Role.EMPLOYER },
  EMPLOYER_APPROVED: { type: "ROUTE_TO_PSSF" },
  EMPLOYER_REJECTED: { type: "REJECTION_NOTIFICATION" },
  UNDER_REVIEW: { type: "PSSF_REVIEW", assignRole: Role.PSSF_OFFICER },
  MORE_INFO_REQUIRED: { type: "MEMBER_RESPOND", assignRole: Role.MEMBER },
  UNDER_VERIFICATION: { type: "PSSF_VERIFY", assignRole: Role.PSSF_OFFICER },
  AWAITING_TRUSTEE: { type: "TRUSTEE_DECIDE", assignRole: Role.PSSF_SUPERVISOR },
  APPROVED: { type: "PAYMENT_SETUP" },
  PAYMENT_PROCESSING: { type: "MONITOR_PAYMENT" },
  COMPLETED: { type: "CLOSE_CASE" },
  REJECTED: { type: "REJECTION_NOTIFICATION" },
  CLOSED: { type: "ARCHIVED" },
}

export async function generateTask(
  caseId: string,
  status: CaseStatus
): Promise<void> {
  const taskDef = TASK_TYPE_MAP[status]
  if (!taskDef) return

  await prisma.task.create({
    data: {
      case_id: caseId,
      task_type: taskDef.type,
      assigned_role: taskDef.assignRole ?? null,
      status: TaskStatus.PENDING,
    },
  })
}
