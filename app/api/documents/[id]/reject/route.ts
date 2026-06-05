import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { rejectDocument } from "@/lib/documents/service"
import { RejectDocumentSchema } from "@/lib/validations/documents"
import { AuthError } from "@/lib/state-machine/guards"
import { Role } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const allowedRoles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!(allowedRoles as Role[]).includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = RejectDocumentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  try {
    await rejectDocument(id, parsed.data.reason, session.user.id, session.user.role)
    return NextResponse.json({ status: "REJECTED", rejection_reason: parsed.data.reason })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message, code: err.name }, { status: 403 })
    }
    console.error(err)
    return NextResponse.json(
      { error: "Failed to reject document", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
