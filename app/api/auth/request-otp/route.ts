import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { RequestOtpSchema } from "@/lib/validations/auth"
import { generateOTP } from "@/lib/kra/otp"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = RequestOtpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 })
  }

  const { phone } = parsed.data

  const user = await prisma.user.findFirst({ where: { phone } })

  if (!user) {
    return NextResponse.json({ matched: false, error: "USER_NOT_FOUND" }, { status: 404 })
  }
  if (!user.is_active) {
    return NextResponse.json({ error: "ACCOUNT_DISABLED" }, { status: 403 })
  }

  const result = await generateOTP(phone!)
  if (!result.success) {
    return NextResponse.json({ error: "OTP_DISPATCH_FAILED" }, { status: 500 })
  }

  return NextResponse.json({ message: "OTP sent" })
}
