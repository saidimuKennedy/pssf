import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { markPaymentProcessing } from "@/lib/cases/staff-actions"
import { AuthError } from "@/lib/state-machine/guards"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!roles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  try {
    await markPaymentProcessing(id, session.user.id, session.user.role)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message, code: error.name }, { status: 422 })
    }
    console.error(error)
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 })
  }
}
