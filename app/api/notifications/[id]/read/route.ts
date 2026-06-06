import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const { id } = await params

  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification) {
    return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
  }
  if (notification.recipient_id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }
  if (notification.is_read) {
    return NextResponse.json({ read: true })
  }

  await prisma.notification.update({
    where: { id },
    data: { is_read: true, read_at: new Date() },
  })

  return NextResponse.json({ read: true })
}
