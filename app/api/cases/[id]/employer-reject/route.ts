import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role, CaseStatus } from "@prisma/client"
import { transition } from "@/lib/state-machine/transitions"
import { prisma } from "@/lib/db"
import { z } from "zod"

const Schema = z.object({ reason: z.string().min(10, "Reason must be at least 10 characters") })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== Role.EMPLOYER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const caseRecord = await prisma.case.findUnique({ where: { id } })
  if (!caseRecord) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (caseRecord.employer_id !== session.user.employer_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await transition({
      caseId: id,
      action: "EMPLOYER_REJECT",
      actorId: session.user.id,
      actorRole: Role.EMPLOYER,
      nextStatus: CaseStatus.EMPLOYER_REJECTED,
      reason: parsed.data.reason,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to reject case" }, { status: 500 })
  }
}
