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

function normalizePhone(raw: string): string {
  let n = raw.trim().replace(/[^\d+]/g, "")
  if (n.startsWith("0")) n = "+254" + n.slice(1)
  else if (n.startsWith("254") && !n.startsWith("+")) n = "+" + n
  return n
}

export async function requestOtpAction(prevState: unknown, formData: FormData) {
  // Normalise first (e.g. 0726898688 → +254726898688), THEN validate — otherwise
  // a perfectly valid local-format number is rejected before we ever fix it up.
  const phone = normalizePhone((formData.get("phone") as string) ?? "")
  const parsed = RequestOtpSchema.safeParse({ phone })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.phone?.[0] ?? "Invalid phone number" }
  }

  const user = await prisma.user.findFirst({ where: { phone, role: { in: [Role.MEMBER, Role.CLAIMANT] } } })
  // New member: don't dead-end on login — send them to activation with the
  // number prefilled. The page redirects on this flag.
  if (!user) return { notRegistered: true, phone }
  if (!user.is_active) return { error: "Account is disabled. Contact support." }

  return { success: true, phone }
}

export async function verifyIdentityAction(prevState: unknown, formData: FormData) {
  const phone = normalizePhone((formData.get("phone") as string) ?? "")
  const nationalId = (formData.get("national_id") as string)?.trim()
  const yearOfBirth = (formData.get("year_of_birth") as string)?.trim()

  if (!nationalId || !yearOfBirth) {
    return { error: "National ID and year of birth are required." }
  }
  if (!/^\d{4}$/.test(yearOfBirth)) {
    return { error: "Enter a valid 4-digit year of birth." }
  }

  // Verify identity with KRA — same pattern as member enrollment
  const { lookupById } = await import("@/lib/kra/members")
  const kra = await lookupById(nationalId, phone, yearOfBirth)
  if (!kra.success) {
    return { error: kra.error ?? "We could not verify your identity. Please check your details." }
  }

  // KRA confirmed identity — find their PSSF account
  const user = await prisma.user.findFirst({
    where: { phone, role: { in: [Role.MEMBER, Role.CLAIMANT] } },
    include: { member: { select: { id: true, national_id: true, full_name: true, kra_pin: true, date_of_birth: true } } },
  })

  if (!user) {
    return {
      error: "Your identity was verified but no PSSF account was found for this number. Please sign up or contact PSSF to register.",
    }
  }

  // Reconcile member record with fresh KRA data
  if (user.member?.id) {
    const updates: Record<string, unknown> = {}
    if (!user.member.national_id && kra.national_id) updates.national_id = kra.national_id
    if (!user.member.kra_pin && kra.kra_pin) updates.kra_pin = kra.kra_pin
    if (kra.name && kra.name !== user.member.full_name) updates.full_name = kra.name
    if (!user.member.date_of_birth && kra.yob) updates.date_of_birth = new Date(`${kra.yob}-01-01`)
    if (Object.keys(updates).length > 0) {
      await prisma.member.update({ where: { id: user.member.id }, data: updates })
    }
  }

  const otp = await generateOTP(phone)
  if (!otp.success) {
    return { error: "Could not send your verification code. Please try again." }
  }

  return { success: true }
}

export async function otpLoginAction(prevState: unknown, formData: FormData) {
  const phone = normalizePhone((formData.get("phone") as string) ?? "")
  const code = formData.get("code") as string

  try {
    await signIn("otp", { phone, code, redirect: false })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid or expired OTP. Please try again." }
    }
    throw e
  }

  const user = await prisma.user.findFirst({
    where: { phone: phone ?? undefined, role: { in: [Role.MEMBER, Role.CLAIMANT] } },
    include: { member: { select: { id: true } } },
  })

  // Guarantee a complete, demo-ready account before landing on the dashboard.
  if (user?.member?.id) {
    const { ensureMemberDemoData } = await import("@/lib/members/provision")
    await ensureMemberDemoData(user.member.id)
  }

  const home = getRoleHome(user?.role)
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
