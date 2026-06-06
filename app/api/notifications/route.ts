import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NotificationChannel } from "@prisma/client"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const unread = searchParams.get("unread") === "true"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))

  const where = {
    recipient_id: session.user.id,
    channel: NotificationChannel.PORTAL,
    ...(unread ? { is_read: false } : {}),
  }

  const [total, rows] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        payload: true,
        is_read: true,
        created_at: true,
        case_id: true,
      },
    }),
  ])

  const data = rows.map((n) => ({
    id: n.id,
    message: (n.payload as Record<string, unknown>)?.message ?? "",
    read: n.is_read,
    case_id: n.case_id,
    created_at: n.created_at,
  }))

  return NextResponse.json({ total, page, limit, data })
}
