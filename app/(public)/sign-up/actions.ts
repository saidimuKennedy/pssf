"use server"

import { prisma } from "@/lib/db"
import { SignUpSchema } from "@/lib/validations/auth"
import { lookupById } from "@/lib/kra/members"
import { ensureMemberDemoData, getDefaultEmployer } from "@/lib/members/provision"
import { sendWhatsApp } from "@/lib/notifications/channels/whatsapp"
import { normalizePhone } from "@/lib/phone"
import bcrypt from "bcryptjs"
import { generateOTP, validateOTP } from "@/lib/kra/otp"
import { NotificationChannel, Role } from "@prisma/client"

export type MatchStatus =
  | "MATCHED"
  | "NOT_FOUND"
  | "DOB_MISMATCH"
  | "NO_CONTACT"
  | "ALREADY_REGISTERED"

export type ValidateMemberResult =
  | null
  | {
      success?: boolean
      matchStatus?: MatchStatus
      member?: Record<string, string>
      error?: { fieldErrors?: Record<string, string[]> } | string
    }

export type SendOtpResult = null | { success?: boolean; error?: string }

export type ActivateResult = null | { success?: boolean; registered?: boolean; error?: string }

export async function validateMemberAction(prevState: unknown, formData: FormData) {
  const parsed = SignUpSchema.safeParse({
    national_id: formData.get("national_id"),
    year_of_birth: formData.get("year_of_birth"),
    phone: formData.get("phone"),
  })
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  const { national_id, year_of_birth, phone } = parsed.data

  const kraResult = await lookupById(national_id, phone, year_of_birth)

  if (!kraResult.success) {
    if (kraResult.mismatch_type === "dob") {
      return {
        matchStatus: "DOB_MISMATCH" as MatchStatus,
        error: {
          fieldErrors: {
            year_of_birth: ["Year of birth does not match the records for this ID. Please check and try again."],
          },
        },
      }
    }
    return {
      matchStatus: "NOT_FOUND" as MatchStatus,
      error: {
        fieldErrors: {
          national_id: ["We could not find a record for this ID. If you believe this is an error, contact PSSF."],
        },
      },
    }
  }

  const memberRecord = await prisma.member.findFirst({ where: { national_id } })

  // Account already fully activated
  if (memberRecord?.user_id) {
    const linked = await prisma.user.findUnique({ where: { id: memberRecord.user_id } })
    if (linked?.phone) {
      return {
        matchStatus: "ALREADY_REGISTERED" as MatchStatus,
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
    matchStatus: "MATCHED" as MatchStatus,
    member: {
      id: memberRecord?.id ?? "",
      full_name: kraResult.name ?? memberRecord?.full_name ?? "",
      national_id,
      year_of_birth,
      kra_pin: kraResult.kra_pin ?? memberRecord?.kra_pin ?? "",
      member_number: memberRecord?.member_number ?? `TSC${Date.now().toString().slice(-8)}`,
      personal_number: memberRecord?.personal_number ?? `${Math.floor(100000 + Math.random() * 900000)}`,
      employer_name: memberRecord?.employer_name ?? "Teachers Service Commission",
      mobile_number: phone,
      email: memberRecord?.email ?? "",
      postal_address: memberRecord?.postal_address ?? "",
      postal_code: memberRecord?.postal_code ?? "",
      town: memberRecord?.town ?? "",
      communication_pref: memberRecord?.communication_pref ?? "PORTAL",
    },
  }
}

export async function sendSignUpOtpAction(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string
  if (!phone) return { error: "Phone number is required." }

  const result = await generateOTP(phone)
  if (!result.success) {
    return { error: "Could not send your verification code. Please try again." }
  }

  return { success: true }
}

export async function activateAccountAction(prevState: unknown, formData: FormData) {
  // Normalise to +254… so the stored value matches what login looks up.
  // (Webview links pass "254…" without a +, which otherwise breaks login.)
  const phone = normalizePhone(formData.get("phone") as string)
  const code = formData.get("code") as string
  const national_id = formData.get("national_id") as string
  const full_name = formData.get("full_name") as string
  const year_of_birth = (formData.get("year_of_birth") as string) || null
  const kra_pin = (formData.get("kra_pin") as string) || null
  const provided_member_number = (formData.get("member_number") as string) || null
  const provided_personal_number = (formData.get("personal_number") as string) || null
  const email = (formData.get("email") as string) || null
  const postal_address = (formData.get("postal_address") as string) || null
  const postal_code = (formData.get("postal_code") as string) || null
  const town = (formData.get("town") as string) || null
  const access_method = (formData.get("access_method") as string) || "otp"
  const password = (formData.get("password") as string) || null
  const communication_pref = (formData.get("communication_pref") as string) || "PORTAL"

  if (!phone || !code || !national_id || !full_name) {
    return { error: "Missing required fields." }
  }

  if (access_method === "password") {
    if (!password || password.length < 8) {
      return { error: "Password must be at least 8 characters." }
    }
  }

  const result = await validateOTP(phone, code)
  if (!result.success) {
    return { error: "Invalid or expired OTP." }
  }

  const password_hash =
    access_method === "password" && password ? bcrypt.hashSync(password, 12) : undefined

  const commPref =
    communication_pref === "WHATSAPP"
      ? NotificationChannel.WHATSAPP
      : communication_pref === "EMAIL"
        ? NotificationChannel.EMAIL
        : NotificationChannel.PORTAL

  const member = await prisma.member.findFirst({ where: { national_id } })
  let memberId: string

  try {
    if (member?.user_id) {
      // Existing linked user — update details
      await prisma.user.update({
        where: { id: member.user_id },
        data: {
          phone,
          email: email || member.email || undefined,
          is_active: true,
          otp_verified_at: new Date(),
          ...(password_hash ? { password_hash } : {}),
        },
      })
      await prisma.member.update({
        where: { id: member.id },
        data: {
          is_verified: true,
          mobile_number: phone,
          email: email || member.email || undefined,
          postal_address: postal_address || member.postal_address || undefined,
          postal_code: postal_code || member.postal_code || undefined,
          town: town || member.town || undefined,
          communication_pref: commPref,
        },
      })
      memberId = member.id
    } else if (member) {
      // Member record exists but no user yet
      const user = await prisma.user.create({
        data: {
          phone,
          email: email || null,
          role: Role.MEMBER,
          is_active: true,
          otp_verified_at: new Date(),
          ...(password_hash ? { password_hash } : {}),
        },
      })
      await prisma.member.update({
        where: { id: member.id },
        data: {
          user_id: user.id,
          is_verified: true,
          mobile_number: phone,
          email: email || member.email || undefined,
          postal_address: postal_address || member.postal_address || undefined,
          postal_code: postal_code || member.postal_code || undefined,
          town: town || member.town || undefined,
          communication_pref: commPref,
        },
      })
      memberId = member.id
    } else {
      // No member record — provision a bare account from KRA data, then let
      // ensureMemberDemoData() below fill in everything else.
      // User may already exist (e.g. from a previous partial attempt or login test).
      let user = await prisma.user.findFirst({ where: { phone } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            phone,
            email: email || null,
            role: Role.MEMBER,
            is_active: true,
            otp_verified_at: new Date(),
            ...(password_hash ? { password_hash } : {}),
          },
        })
      } else {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: email || user.email || null,
            role: Role.MEMBER,
            is_active: true,
            otp_verified_at: new Date(),
            ...(password_hash ? { password_hash } : {}),
          },
        })
      }

      const employer = await getDefaultEmployer()
      const dob = year_of_birth ? new Date(`${year_of_birth}-07-01`) : new Date("1980-07-01")

      const newMember = await prisma.member.create({
        data: {
          user_id: user.id,
          national_id,
          full_name,
          date_of_birth: dob,
          kra_pin: kra_pin || undefined,
          member_number: provided_member_number || undefined,
          personal_number: provided_personal_number || undefined,
          employer_id: employer.id,
          employer_name: employer.name,
          mobile_number: phone,
          email: email || null,
          postal_address: postal_address || null,
          postal_code: postal_code || null,
          town: town || null,
          communication_pref: commPref,
          is_verified: true,
        },
      })
      memberId = newMember.id
    }
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code?: string }).code === "P2002") {
      const target = (e as { meta?: { target?: string[] | string } }).meta?.target
      const field = Array.isArray(target) ? target.join(", ") : String(target ?? "")
      if (field.includes("email"))
        return { error: "This email is already linked to another account. Use a different email." }
      if (field.includes("phone"))
        return { error: "This phone number is already linked to another account. Use a different number." }
      return { error: "These details are already linked to another account." }
    }
    throw e
  }

  // Guarantee a complete, demo-ready account: full profile + contributions +
  // beneficiaries. Idempotent, so existing members only get their gaps filled.
  await ensureMemberDemoData(memberId)

  // Welcome the member over WhatsApp via the approved `pssf_welcome` template.
  // Failure-isolated so it never blocks activation.
  try {
    const firstName = full_name.trim().split(/\s+/)[0] || "there"
    await sendWhatsApp({
      recipient_phone: phone,
      template_ref: "tpl_welcome_wa",
      variables: { first_name: firstName },
    })
  } catch (err) {
    console.error("[activate] WhatsApp welcome failed:", err)
  }

  return { success: true, registered: true }
}
