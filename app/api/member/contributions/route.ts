import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import {
  getMemberContributions,
  type ContributionPeriod,
} from "@/lib/contributions/service"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const allowed: Role[] = [Role.MEMBER, Role.CLAIMANT]
  if (!allowed.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const member = await prisma.member.findFirst({
    where: { user_id: session.user.id },
    select: { id: true },
  })
  if (!member) {
    return NextResponse.json({ error: "Member not found", code: "NOT_FOUND" }, { status: 404 })
  }

  const { searchParams } = req.nextUrl
  const period = (searchParams.get("period") ?? "FULL") as ContributionPeriod
  const from = searchParams.get("from") ?? undefined
  const to = searchParams.get("to") ?? undefined

  try {
    const data = await getMemberContributions(member.id, period, from, to)
    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch contributions", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
