import { prisma } from "@/lib/db"

export interface DeceasedValidateInput {
  national_id: string
  year_of_birth: string
  personal_number?: string
  member_number?: string
  claimant_user_id: string
}

export async function validateDeceasedMember(input: DeceasedValidateInput) {
  const member = await prisma.member.findUnique({
    where: { national_id: input.national_id },
  })

  if (!member) return { matched: false as const }

  if (member.date_of_birth.getFullYear() !== parseInt(input.year_of_birth, 10)) {
    return { matched: false as const }
  }

  if (input.personal_number && member.personal_number && member.personal_number !== input.personal_number) {
    return { matched: false as const }
  }
  if (input.member_number && member.member_number && member.member_number !== input.member_number) {
    return { matched: false as const }
  }

  return {
    matched: true as const,
    member: {
      id: member.id,
      full_name: member.full_name,
      national_id: input.national_id,
      year_of_birth: input.year_of_birth,
      personal_number: member.personal_number ?? null,
      member_number: member.member_number ?? null,
      employer_name: member.employer_name ?? null,
      kra_pin: member.kra_pin ?? null,
    },
  }
}
