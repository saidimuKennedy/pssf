import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ValidateMemberSchema } from "@/lib/validations/members"
import { lookupById } from "@/lib/kra/members"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ValidateMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { national_id, date_of_birth, phone } = parsed.data
  const year = date_of_birth.split("-")[0]

  const kraResult = await lookupById(national_id, phone, year)
  if (!kraResult.success) {
    return NextResponse.json({ matched: false })
  }

  const member = await prisma.member.findUnique({ where: { national_id } })
  if (!member) {
    return NextResponse.json({ matched: false })
  }

  return NextResponse.json({
    matched: true,
    member: {
      id: member.id,
      full_name: kraResult.name ?? member.full_name,
      national_id: member.national_id,
      date_of_birth,
      kra_pin: kraResult.kra_pin ?? member.kra_pin,
      member_number: member.member_number,
      personal_number: member.personal_number,
      employer_id: member.employer_id,
      employer_name: member.employer_name,
      date_of_employment: member.date_of_employment?.toISOString().split("T")[0] ?? null,
      date_joined_scheme: member.date_joined_scheme?.toISOString().split("T")[0] ?? null,
      mobile_number: phone,
      email: member.email,
      postal_address: member.postal_address,
      postal_code: member.postal_code,
      town: member.town,
      communication_pref: member.communication_pref,
    },
  })
}
