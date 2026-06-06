import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const rules = await prisma.notificationRule.findMany({
    orderBy: [{ trigger_event: "asc" }, { channel: "asc" }],
  })
  return NextResponse.json({ data: rules })
}
