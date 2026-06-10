import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ValidateMemberSchema } from "@/lib/validations/members"
import { lookupById } from "@/lib/kra/members"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ValidateMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { national_id, year_of_birth } = parsed.data
  const phone = session.user.phone
  if (!phone) {
    return NextResponse.json({ error: "No phone on account. Contact support." }, { status: 400 })
  }

  // allow_new=true is used by the enrolment journey: KRA confirmation is enough,
  // the member may not exist in the DB yet (first-time enrolment).
  const url = new URL(req.url)
  const allowNew = url.searchParams.get("allow_new") === "true"

  const kraResult = await lookupById(national_id, phone, year_of_birth)
  if (!kraResult.success) {
    return NextResponse.json({ matched: false })
  }

  const member = await prisma.member.findUnique({ where: { national_id } })

  if (!member && !allowNew) {
    return NextResponse.json({ matched: false })
  }

  return NextResponse.json({
    matched: true,
    member: {
      id: member?.id ?? null,
      full_name: kraResult.name ?? member?.full_name ?? "",
      national_id,
      year_of_birth,
      kra_pin: kraResult.kra_pin ?? member?.kra_pin ?? null,
      member_number: member?.member_number ?? null,
      personal_number: member?.personal_number ?? null,
      employer_id: member?.employer_id ?? null,
      employer_name: member?.employer_name ?? null,
      date_of_employment: member?.date_of_employment?.toISOString().split("T")[0] ?? null,
      date_joined_scheme: member?.date_joined_scheme?.toISOString().split("T")[0] ?? null,
      mobile_number: member?.mobile_number ?? phone,
      email: member?.email ?? null,
      postal_address: member?.postal_address ?? null,
      postal_code: member?.postal_code ?? null,
      town: member?.town ?? null,
      communication_pref: member?.communication_pref ?? null,
    },
  })
}
