import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { submitCase } from "@/lib/cases/service"
import { SubmitCaseSchema } from "@/lib/validations/cases"
import { prisma } from "@/lib/db"
import { AuthError } from "@/lib/state-machine/guards"

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
    const caseRecord = await prisma.case.findUnique({
      where: { id },
      select: { reference: true, status: true },
    })
    return NextResponse.json({
      success: true,
      reference: caseRecord?.reference,
      status: caseRecord?.status,
      message: "Your case has been submitted successfully.",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      const status =
        error.name === "NOT_FOUND" ? 404 : error.name === "FORBIDDEN" ? 403 : 422
      return NextResponse.json(
        { error: error.message, code: error.name, details: error.details },
        { status }
      )
    }
    console.error(error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
