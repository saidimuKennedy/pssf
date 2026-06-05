import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { RequestOtpSchema } from "@/lib/validations/auth"
import { hashOtp } from "@/auth"

const OTP_EXPIRY_SECONDS = 300
const MAX_REQUESTS_PER_HOUR = 5

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function dispatchOtp(phone: string, code: string): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log(`[MOCK WhatsApp OTP] phone=${phone} code=${code}`)
    return
  }
  await fetch(`${process.env.CHATNATION_CRM_URL}/api/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CHATNATION_CRM_API_KEY}`,
    },
    body: JSON.stringify({ phone, code }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = RequestOtpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", details: parsed.error.flatten() }, { status: 400 })
  }

  const { phone } = parsed.data

  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    return NextResponse.json({ matched: false, error: "USER_NOT_FOUND" }, { status: 404 })
  }
  if (!user.is_active) {
    return NextResponse.json({ error: "ACCOUNT_DISABLED" }, { status: 403 })
  }

  // Rate limit: max 5 requests per phone per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCount = await prisma.otpRequest.count({
    where: { phone, created_at: { gt: oneHourAgo } },
  })
  if (recentCount >= MAX_REQUESTS_PER_HOUR) {
    return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 })
  }

  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000)

  await prisma.otpRequest.create({
    data: {
      user_id: user.id,
      phone,
      code: hashOtp(code),
      expires_at: expiresAt,
    },
  })

  await dispatchOtp(phone, code)

  return NextResponse.json({ message: "OTP sent", expires_in: OTP_EXPIRY_SECONDS })
}
