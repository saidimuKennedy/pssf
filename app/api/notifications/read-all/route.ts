import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NotificationChannel } from "@prisma/client"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: {
      recipient_id: session.user.id,
      channel: NotificationChannel.PORTAL,
      is_read: false,
    },
    data: { is_read: true, read_at: new Date() },
  })

  return NextResponse.json({ success: true })
}
