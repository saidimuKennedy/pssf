"use server"

import { signIn } from "@/auth"
import { LoginSchema, RequestOtpSchema } from "@/lib/validations/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { generateOTP } from "@/lib/kra/otp"
import { Role } from "@prisma/client"

const STAFF_ROLES: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR, Role.ADMIN, Role.EMPLOYER]

export async function requestOtpAction(prevState: unknown, formData: FormData) {
  const parsed = RequestOtpSchema.safeParse({ phone: formData.get("phone") })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.phone?.[0] ?? "Invalid phone number" }
  }

  const phone = parsed.data.phone
  if (!phone) {
    return { error: "Phone number is required." }
  }

  const user = await prisma.user.findUnique({ where: { phone } })
  if (!user) return { error: "No account found for this phone number. Please sign up first." }
  if (!user.is_active) return { error: "Account is disabled. Contact support." }

  const result = await generateOTP(phone)
  if (!result.success) {
    return { error: "Could not send your verification code. Please try again." }
  }

  return { success: true, phone }
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

  if (!user.phone) {
    return { error: "No phone number on account. Contact your administrator." }
  }

  const result = await generateOTP(user.phone)
  if (!result.success) {
    return { error: "Could not send your verification code. Please try again." }
  }

  return { success: true, email, requires_otp: true }
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
