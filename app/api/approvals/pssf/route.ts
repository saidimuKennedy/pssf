import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { recordPssfApproval } from "@/lib/approvals/service"
import { PssfApprovalSchema } from "@/lib/validations/cases"
import { ApprovalDecision, Role } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const validRoles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!validRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = PssfApprovalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { caseId } = body
  if (!caseId) {
    return NextResponse.json({ error: "caseId is required" }, { status: 400 })
  }

  try {
    await recordPssfApproval({
      caseId,
      decision: parsed.data.decision as ApprovalDecision,
      reason: parsed.data.reason,
      comments: parsed.data.comments,
      actorId: session.user.id,
      actorName: session.user.name || "Unknown",
      actorRole: session.user.role,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to record approval" }, { status: 500 })
  }
}
