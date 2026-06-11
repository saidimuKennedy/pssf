import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { VerifyOtpSchema } from "@/lib/validations/auth"
import { validateOTP } from "@/lib/kra/otp"

export async function POST(req: NextRequest) {
  const session = await auth()

  const body = await req.json().catch(() => null)
  const parsed = VerifyOtpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 })
  }

  const { identifier, code } = parsed.data

  const result = await validateOTP(identifier, code)

  if (!result.success) {
    return NextResponse.json({ error: "OTP_INVALID" }, { status: 400 })
  }

  const userId = session?.user?.id
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { otp_verified_at: new Date() },
    })
  }

  return NextResponse.json({ success: true, message: "OTP verified" })
}
