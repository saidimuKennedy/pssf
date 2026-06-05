"use server"

import { prisma } from "@/lib/db"
import { hashOtp } from "@/auth"
import { RequestOtpSchema } from "@/lib/validations/auth"

const OTP_EXPIRY_SECONDS = 300

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function dispatchOtp(identifier: string, code: string, isEmail: boolean): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log(`[MOCK OTP resend] ${isEmail ? "email" : "phone"}=${identifier} code=${code}`)
    return
  }
  await fetch(`${process.env.CHATNATION_CRM_URL}/api/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CHATNATION_CRM_API_KEY}`,
    },
    body: JSON.stringify({ [isEmail ? "email" : "phone"]: identifier, code }),
  })
}

export async function resendOtpAction(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string | null
  const email = formData.get("email") as string | null
  const identifier = phone ?? email

  if (!identifier) return { error: "Missing identifier." }

  const isEmail = !!email
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const where = isEmail ? { email: identifier } : { phone: identifier }

  const recentCount = await prisma.otpRequest.count({
    where: { ...where, created_at: { gt: oneHourAgo } },
  })
  if (recentCount >= 5) return { error: "Too many requests. Try again in an hour." }

  const user = isEmail
    ? await prisma.user.findUnique({ where: { email: identifier } })
    : await prisma.user.findUnique({ where: { phone: identifier } })

  if (!user) return { error: "Account not found." }

  const code = generateOtp()
  await prisma.otpRequest.create({
    data: {
      user_id: user.id,
      ...(isEmail ? { email: identifier } : { phone: identifier }),
      code: hashOtp(code),
      expires_at: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    },
  })
  await dispatchOtp(identifier, code, isEmail)

  return { success: true, expires_in: OTP_EXPIRY_SECONDS }
}
