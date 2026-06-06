import { NotificationChannel } from "@prisma/client"
import { prisma } from "@/lib/db"

export interface MemberPrefill {
  matched: true
  member: {
    id: string
    full_name: string
    national_id: string
    date_of_birth: string
    kra_pin: string | null
    member_number: string | null
    personal_number: string | null
    employer_id: string | null
    employer_name: string | null
    date_of_employment: string | null
    date_joined_scheme: string | null
    mobile_number: string | null
    email: string | null
    postal_address: string | null
    postal_code: string | null
    town: string | null
    communication_pref: string
  }
}

export type ValidateResult = MemberPrefill | { matched: false }

export async function validateMember(
  nationalId: string,
  dateOfBirth: string
): Promise<ValidateResult> {
  const member = await prisma.member.findUnique({
    where: { national_id: nationalId },
  })

  if (!member) return { matched: false }

  const dob = member.date_of_birth.toISOString().split("T")[0]
  if (dob !== dateOfBirth) return { matched: false }

  return {
    matched: true,
    member: {
      id: member.id,
      full_name: member.full_name,
      national_id: member.national_id,
      date_of_birth: dob,
      kra_pin: member.kra_pin,
      member_number: member.member_number,
      personal_number: member.personal_number,
      employer_id: member.employer_id,
      employer_name: member.employer_name,
      date_of_employment: member.date_of_employment?.toISOString().split("T")[0] ?? null,
      date_joined_scheme: member.date_joined_scheme?.toISOString().split("T")[0] ?? null,
      mobile_number: member.mobile_number,
      email: member.email,
      postal_address: member.postal_address,
      postal_code: member.postal_code,
      town: member.town,
      communication_pref: member.communication_pref,
    },
  }
}

export async function getMemberProfile(userId: string) {
  return prisma.member.findFirst({
    where: { user_id: userId },
    select: {
      id: true,
      full_name: true,
      national_id: true,
      date_of_birth: true,
      kra_pin: true,
      member_number: true,
      personal_number: true,
      employer_id: true,
      employer_name: true,
      date_of_employment: true,
      date_joined_scheme: true,
      mobile_number: true,
      email: true,
      postal_address: true,
      postal_code: true,
      town: true,
      communication_pref: true,
      is_verified: true,
    },
  })
}

const EDITABLE_FIELDS = new Set([
  "mobile_number",
  "email",
  "postal_address",
  "postal_code",
  "town",
  "communication_pref",
])

export async function updateMemberContact(
  userId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const sanitised: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (EDITABLE_FIELDS.has(key)) {
      sanitised[key] = value
    }
  }
  if (Object.keys(sanitised).length === 0) return

  await prisma.member.updateMany({
    where: { user_id: userId },
    data: sanitised as Parameters<typeof prisma.member.updateMany>[0]["data"],
  })
}

export async function getMemberByUserId(userId: string) {
  return prisma.member.findFirst({ where: { user_id: userId } })
}
