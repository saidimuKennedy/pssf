import { prisma } from "@/lib/db"

export interface DeceasedValidateInput {
  national_id: string
  date_of_birth: string
  personal_number?: string
  member_number?: string
}

export async function validateDeceasedMember(input: DeceasedValidateInput) {
  const member = await prisma.member.findUnique({
    where: { national_id: input.national_id },
  })

  if (!member) return { matched: false as const }

  const dob = member.date_of_birth.toISOString().split("T")[0]
  if (dob !== input.date_of_birth) return { matched: false as const }

  if (input.personal_number && member.personal_number !== input.personal_number) {
    return { matched: false as const }
  }
  if (input.member_number && member.member_number !== input.member_number) {
    return { matched: false as const }
  }

  return {
    matched: true as const,
    member: {
      id: member.id,
      full_name: member.full_name,
      national_id: member.national_id,
      date_of_birth: dob,
      personal_number: member.personal_number,
      member_number: member.member_number,
      employer_name: member.employer_name,
      kra_pin: member.kra_pin,
    },
  }
}
