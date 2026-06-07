import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allowed: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!(allowed as Role[]).includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const officers = await prisma.user.findMany({
    where: {
      role: { in: [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR] },
      is_active: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
    orderBy: { email: "asc" },
  })

  return NextResponse.json({ officers })
}
