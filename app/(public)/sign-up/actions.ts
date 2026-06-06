"use server"

import { prisma } from "@/lib/db"
import { SignUpSchema } from "@/lib/validations/auth"
import { generateOtpCode, hashOtp } from "@/auth"
import { Role } from "@prisma/client"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { validateMember } from "@/lib/members/service"

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

async function dispatchOtp(phone: string, code: string): Promise<void> {
  if (process.env.PSSF_MOCK_NOTIFICATIONS === "true") {
    console.log(`[MOCK OTP sign-up] phone=${phone} code=${code}`)
    return
  }
  const { sendWhatsApp } = await import("@/lib/notifications/channels/whatsapp")
  await sendWhatsApp({
    recipient_phone: phone,
    template_ref: "tpl_otp_wa",
    variables: { otp_code: code },
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

  const result = await validateMember(national_id, date_of_birth)
  if (!result.matched) {
    return {
      error: {
        fieldErrors: {
          national_id: ["We could not verify your identity. Check your National ID and date of birth."],
        },
      },
    }
  }

  const memberRecord = await prisma.member.findUnique({ where: { national_id } })
  if (memberRecord?.user_id) {
    const linked = await prisma.user.findUnique({ where: { id: memberRecord.user_id } })
    if (linked?.phone) {
      return {
        error: {
          fieldErrors: {
            national_id: ["An account already exists for this National ID. Sign in instead."],
          },
        },
      }
    }
  }

  return {
    success: true,
    member: result.member,
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

  const code = generateOtpCode()
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

  const member = await prisma.member.findUnique({ where: { national_id } })

  if (member?.user_id) {
    await prisma.user.update({
      where: { id: member.user_id },
      data: {
        phone,
        email: email || member.email || undefined,
        is_active: true,
      },
    })
  } else {
    const user = await prisma.user.create({
      data: {
        phone,
        email: email || null,
        role: Role.MEMBER,
        is_active: true,
      },
    })
    if (member) {
      await prisma.member.update({
        where: { id: member.id },
        data: { user_id: user.id, is_verified: true },
      })
    }
  }

  if (member) {
    await prisma.member.update({
      where: { id: member.id },
      data: { is_verified: true, mobile_number: phone },
    })
  }

  // signIn must run before OTP is marked verified (auth provider requires verified: false)
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
