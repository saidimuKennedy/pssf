import { prisma } from "@/lib/db"

export async function getMemberProfile(userId: string) {
  const member = await prisma.member.findFirst({
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

  // Member not yet enrolled — return minimal profile from users table so OTP works
  if (!member) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, email: true },
    })
    if (!user) return null
    return {
      id: null,
      full_name: null,
      national_id: null,
      date_of_birth: null,
      kra_pin: null,
      member_number: null,
      personal_number: null,
      employer_id: null,
      employer_name: null,
      date_of_employment: null,
      date_joined_scheme: null,
      mobile_number: user.phone,
      email: user.email,
      postal_address: null,
      postal_code: null,
      town: null,
      communication_pref: null,
      is_verified: false,
    }
  }

  return member
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
