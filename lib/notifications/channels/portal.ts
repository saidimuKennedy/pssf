import { prisma } from "@/lib/db"
import { NotificationChannel, NotificationStatus } from "@prisma/client"

export async function sendPortal(
  recipientId: string,
  message: string,
  caseId?: string
): Promise<void> {
  if (!recipientId) return

  await (prisma.notification.create as any)({
    data: {
      case_id: caseId ?? null,
      recipient_id: recipientId,
      channel: NotificationChannel.PORTAL,
      template_ref: "portal",
      payload: { message },
      status: NotificationStatus.SENT,
      sent_at: new Date(),
    },
  })
}
