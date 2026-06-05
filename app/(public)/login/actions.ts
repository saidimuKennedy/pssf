"use server"

import { signIn } from "@/auth"
import { LoginSchema, RequestOtpSchema } from "@/lib/validations/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { hashOtp } from "@/auth"
import { Role } from "@prisma/client"

const STAFF_ROLES: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR, Role.ADMIN, Role.EMPLOYER]
const OTP_EXPIRY_SECONDS = 300

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function dispatchOtp(identifier: string, code: string, isEmail: boolean): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log(`[MOCK OTP] ${isEmail ? "email" : "phone"}=${identifier} code=${code}`)
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

  const code = generateOtp()
  await prisma.otpRequest.create({
    data: {
      user_id: user.id,
      phone,
      code: hashOtp(code),
      expires_at: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    },
  })
  await dispatchOtp(phone, code, false)

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

  const code = generateOtp()
  await prisma.otpRequest.create({
    data: {
      user_id: user.id,
      email,
      code: hashOtp(code),
      expires_at: new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000),
    },
  })
  await dispatchOtp(email, code, true)

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
