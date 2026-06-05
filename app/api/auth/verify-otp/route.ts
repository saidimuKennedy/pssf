import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { VerifyOtpSchema } from "@/lib/validations/auth"
import { hashOtp } from "@/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = VerifyOtpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 })
  }

  const { identifier, code } = parsed.data
  const isEmail = identifier.includes("@")

  const otp = await prisma.otpRequest.findFirst({
    where: {
      ...(isEmail ? { email: identifier } : { phone: identifier }),
      verified: false,
      expires_at: { gt: new Date() },
      attempts: { lt: 3 },
    },
    orderBy: { created_at: "desc" },
  })

  if (!otp) {
    return NextResponse.json({ error: "OTP_EXPIRED" }, { status: 400 })
  }

  if (otp.code !== hashOtp(code)) {
    await prisma.otpRequest.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })
    const remaining = 2 - otp.attempts
    return NextResponse.json(
      { error: "OTP_INVALID", attempts_remaining: Math.max(0, remaining) },
      { status: 400 }
    )
  }

  await prisma.otpRequest.update({
    where: { id: otp.id },
    data: { verified: true },
  })

  return NextResponse.json({ success: true, message: "OTP verified" })
}
