import { TaskStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { AuthError } from "@/lib/state-machine/guards"

export async function getTasksForActor(
  actorId: string,
  actorRole: Role,
  filters?: { status?: TaskStatus; limit?: number }
): Promise<unknown[]> {
  const where: Record<string, unknown> = {}

  if (actorRole === Role.MEMBER || actorRole === Role.CLAIMANT) {
    where.assigned_to = actorId
  } else if (actorRole === Role.EMPLOYER) {
    where.assigned_to = actorId
  } else if (actorRole === Role.PSSF_OFFICER) {
    where.assigned_to = actorId
  } else if (actorRole === Role.PSSF_SUPERVISOR) {
    // Supervisors see all tasks
    where.assigned_role = { in: [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR] }
  }

  if (filters?.status) {
    where.status = filters.status
  }

  return await prisma.task.findMany({
    where,
    include: { case: true },
    orderBy: { created_at: "desc" },
    take: filters?.limit ?? 100,
  })
}

export async function completeTask(taskId: string, actorId: string): Promise<void> {
  const task = await prisma.task.findUniqueOrThrow({
    where: { id: taskId },
  })

  if (task.assigned_to !== actorId) {
    throw new AuthError("FORBIDDEN", "Cannot complete a task not assigned to you")
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.COMPLETED,
      completed_at: new Date(),
    },
  })
}
