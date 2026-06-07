"use server"

import { signIn } from "@/auth"
import { LoginSchema, RequestOtpSchema } from "@/lib/validations/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { generateOtpCode, hashOtp } from "@/auth"
import { Role } from "@prisma/client"

const STAFF_ROLES: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR, Role.ADMIN, Role.EMPLOYER]
const OTP_EXPIRY_SECONDS = 300

async function sendOtpEmail(to: string, code: string): Promise<void> {
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const MAX_ATTEMPTS = 3
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@pssf.go.ke",
        to,
        subject: "Your PSSF Verification Code",
        html: `<p>Your PSSF verification code is <strong>${code}</strong>. It expires in 5 minutes. Do not share this code with anyone.</p>`,
      })
      if (error) throw new Error(`Resend error: ${error.message}`)
      console.log(`[OTP] Email sent id=${data?.id} to=${to} (attempt ${attempt})`)
      return
    } catch (err) {
      lastErr = err
      console.warn(`[OTP] Email attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err instanceof Error ? err.message : err}`)
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 500 * attempt))
    }
  }
  // In dev, the code is always 123456 — log it so the developer can proceed even
  // when Resend can't deliver to the recipient's address (e.g. unverified sender domain).
  if (process.env.NODE_ENV === "development") {
    console.warn(`[OTP] Dev mode: email delivery failed but code is known. code=${code} to=${to}`)
    return
  }
  throw lastErr
}

async function dispatchOtp(identifier: string, code: string, isEmail: boolean, fallbackEmail?: string | null): Promise<void> {
  if (process.env.PSSF_MOCK_NOTIFICATIONS === "true") {
    console.log(`[MOCK OTP] ${isEmail ? "email" : "phone"}=${identifier} code=${code}`)
    return
  }
  if (isEmail) {
    await sendOtpEmail(identifier, code)
  } else {
    try {
      const { sendWhatsApp } = await import("@/lib/notifications/channels/whatsapp")
      await sendWhatsApp({
        recipient_phone: identifier,
        template_ref: "tpl_otp_wa",
        variables: { otp_code: code },
      })
    } catch (err) {
      if (fallbackEmail) {
        console.warn(`[OTP] WhatsApp send failed, falling back to email: ${err instanceof Error ? err.message : err}`)
        await sendOtpEmail(fallbackEmail, code)
      } else {
        throw err
      }
    }
  }
}

export async function requestOtpAction(prevState: unknown, formData: FormData) {
  const parsed = RequestOtpSchema.safeParse({ phone: formData.get("phone") })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.phone?.[0] ?? "Invalid phone number" }
  }

  const { phone } = parsed.data
  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) return { error: "No account found for this phone number. Please sign up first." }
  if (!user.is_active) return { error: "Account is disabled. Contact support." }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCount = await prisma.otpRequest.count({
    where: { phone, created_at: { gt: oneHourAgo } },
  })
  if (recentCount >= 5) return { error: "Too many requests. Try again in an hour." }

  const code = generateOtpCode()
  const otpRequest = await prisma.otpRequest.create({
    data: {
      user_id: user.id,
      phone,
      code: hashOtp(code),
      expires_at: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    },
  })

  // Roll back the request row if delivery fails, so failed sends don't burn the rate limit.
  try {
    await dispatchOtp(phone, code, false, user.email)
  } catch (err) {
    await prisma.otpRequest.delete({ where: { id: otpRequest.id } }).catch(() => {})
    console.error(`[OTP] dispatch failed for ${phone}: ${err instanceof Error ? err.message : err}`)
    return { error: "Could not send your verification code. Please try again." }
  }

  return { success: true, phone, expires_in: OTP_EXPIRY_SECONDS }
}

export async function otpLoginAction(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string
  const code = formData.get("code") as string

  try {
    await signIn("otp", { phone, code, redirect: false })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid or expired OTP. Please try again." }
    }
    throw e
  }

  const user = await prisma.user.findUnique({ where: { phone: phone ?? undefined } })
  const role = user?.role
  const home = getRoleHome(role)
  redirect(home)
}

export async function passwordLoginAction(prevState: unknown, formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: "Invalid email or password." }
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.password_hash || !user.is_active) {
    return { error: "Invalid credentials." }
  }
  if (!STAFF_ROLES.includes(user.role)) {
    return { error: "Invalid credentials." }
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash)
  if (!passwordOk) return { error: "Invalid credentials." }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentCount = await prisma.otpRequest.count({
    where: { email, created_at: { gt: oneHourAgo } },
  })
  if (recentCount >= 5) return { error: "Too many OTP requests. Try again in an hour." }

  const code = generateOtpCode()
  const otpRequest = await prisma.otpRequest.create({
    data: {
      user_id: user.id,
      email,
      code: hashOtp(code),
      expires_at: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    },
  })

  // Roll back the request row if delivery fails, so failed sends don't burn the rate limit.
  try {
    await dispatchOtp(email, code, true)
  } catch (err) {
    await prisma.otpRequest.delete({ where: { id: otpRequest.id } }).catch(() => {})
    console.error(`[OTP] dispatch failed for ${email}: ${err instanceof Error ? err.message : err}`)
    return { error: "Could not send your verification code. Please try again." }
  }

  return { success: true, email, requires_otp: true, expires_in: OTP_EXPIRY_SECONDS }
}

export async function passwordOtpLoginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const code = formData.get("code") as string

  try {
    await signIn("password", { email, password, code, redirect: false })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid or expired OTP. Please try again." }
    }
    throw e
  }

  const user = await prisma.user.findUnique({ where: { email: email ?? undefined } })
  const home = getRoleHome(user?.role)
  redirect(home)
}

function getRoleHome(role?: Role | null): string {
  switch (role) {
    case Role.MEMBER:
    case Role.CLAIMANT:
      return "/member/dashboard"
    case Role.EMPLOYER:
      return "/employer/dashboard"
    case Role.PSSF_OFFICER:
    case Role.PSSF_SUPERVISOR:
      return "/staff/dashboard"
    case Role.ADMIN:
      return "/admin/dashboard"
    default:
      return "/login"
  }
}
