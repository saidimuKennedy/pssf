import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { submitCase } from "@/lib/cases/service"
import { SubmitCaseSchema } from "@/lib/validations/cases"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = SubmitCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (!parsed.data.declarationAccepted || !parsed.data.otpVerified) {
    return NextResponse.json(
      { error: "Declaration and OTP verification required" },
      { status: 400 }
    )
  }

  try {
    const ipAddress = req.headers.get("x-forwarded-for") ?? "unknown"
    await submitCase(id, session.user.id, session.user.role, ipAddress)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to submit case" }, { status: 500 })
  }
}
