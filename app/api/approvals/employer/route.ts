import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { recordEmployerApproval } from "@/lib/approvals/service"
import { EmployerApprovalSchema } from "@/lib/validations/cases"
import { ApprovalDecision, Role } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (session.user.role !== Role.EMPLOYER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = EmployerApprovalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { caseId } = body
  if (!caseId) {
    return NextResponse.json({ error: "caseId is required" }, { status: 400 })
  }

  try {
    await recordEmployerApproval({
      caseId,
      decision: parsed.data.decision as ApprovalDecision,
      reason: parsed.data.reason,
      comments: parsed.data.comments,
      actorId: session.user.id,
      actorName: session.user.name || "Unknown",
      actorRole: session.user.role,
      actorOrg: session.user.employer_id ?? undefined,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to record approval" }, { status: 500 })
  }
}
