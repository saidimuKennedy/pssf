"use server"

import { prisma } from "@/lib/db"
import { SignUpSchema } from "@/lib/validations/auth"
import { hashOtp } from "@/auth"
import { Role } from "@prisma/client"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export type ValidateMemberResult =
  | null
  | { success?: boolean; member?: Record<string, string>; error?: { fieldErrors?: Record<string, string[]> } | string }

export type SendOtpResult =
  | null
  | { success?: boolean; expires_in?: number; error?: string }

export type ActivateResult =
  | null
  | { error?: string }

const OTP_EXPIRY_SECONDS = 300

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function dispatchOtp(phone: string, code: string): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log(`[MOCK OTP sign-up] phone=${phone} code=${code}`)
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

// Step 1 — validate national ID and DOB against seed data (mocked in Phase 1)
export async function validateMemberAction(prevState: unknown, formData: FormData) {
  const parsed = SignUpSchema.safeParse({
    national_id: formData.get("national_id"),
    date_of_birth: formData.get("date_of_birth"),
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  const { national_id, date_of_birth } = parsed.data

  // Check if already registered
  const existing = await prisma.user.findFirst({
    include: { member: true } as Record<string, boolean>,
    where: { member: { national_id } } as Record<string, unknown>,
  }).catch(() => null)

  if (existing) {
    return { error: { fieldErrors: { national_id: ["An account already exists for this National ID."] } } }
  }

  // Phase 1 mock — return prefilled data for any valid lookup
  return {
    success: true,
    member: {
      national_id,
      date_of_birth,
      full_name: "[From PSSF records]",
      employer_name: "[From PSSF records]",
      member_number: "[From PSSF records]",
    },
  }
}

// Step 3 — send OTP to confirm phone ownership before account creation
export async function sendSignUpOtpAction(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string
  if (!phone) return { error: "Phone number is required." }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCount = await prisma.otpRequest.count({
    where: { phone, created_at: { gt: oneHourAgo } },
  })
  if (recentCount >= 5) return { error: "Too many requests. Try again in an hour." }

  const code = generateOtp()
  await prisma.otpRequest.create({
    data: {
      phone,
      code: hashOtp(code),
      expires_at: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    },
  })
  await dispatchOtp(phone, code)

  return { success: true, expires_in: OTP_EXPIRY_SECONDS }
}

// Step 4 — verify OTP, create user + member skeleton, start session
export async function activateAccountAction(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string
  const code = formData.get("code") as string
  const national_id = formData.get("national_id") as string
  const full_name = formData.get("full_name") as string
  const email = formData.get("email") as string | null

  if (!phone || !code || !national_id || !full_name) {
    return { error: "Missing required fields." }
  }

  const otp = await prisma.otpRequest.findFirst({
    where: {
      phone,
      verified: false,
      expires_at: { gt: new Date() },
      attempts: { lt: 3 },
    },
    orderBy: { created_at: "desc" },
  })

  if (!otp) return { error: "OTP expired. Please request a new one." }
  if (otp.code !== hashOtp(code)) {
    await prisma.otpRequest.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    })
    return { error: "Invalid OTP." }
  }

  await prisma.otpRequest.update({ where: { id: otp.id }, data: { verified: true } })

  // Create user record (Member model added in Phase 2 with full schema)
  await prisma.user.create({
    data: {
      phone,
      email: email || null,
      role: Role.MEMBER,
      is_active: true,
    },
  }).catch(() => null)

  try {
    await signIn("otp", { phone, code, redirect: false })
  } catch (e) {
    if (e instanceof AuthError) {
      redirect("/login?activated=true")
    }
    throw e
  }

  redirect("/member/dashboard")
}
