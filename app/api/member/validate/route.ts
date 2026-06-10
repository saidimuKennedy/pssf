import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ValidateMemberSchema } from "@/lib/validations/members"
import { lookupById } from "@/lib/kra/members"
import { ensureMemberProfile, synthesizeMemberDefaults } from "@/lib/members/provision"
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

  let member = await prisma.member.findUnique({ where: { national_id } })

  if (!member && !allowNew) {
    return NextResponse.json({ matched: false })
  }

  // Backfill any missing profile fields so prefilled records never show gaps.
  if (member) {
    member = await ensureMemberProfile(member)
  }

  // Members who exist via KRA but have no PSSF record yet (first-time enrolment)
  // still need a complete, gap-free prefill. Synthesize deterministic values
  // keyed on national ID so they stay stable and match what gets persisted.
  const fullName = kraResult.name ?? member?.full_name ?? ""
  const defaults = synthesizeMemberDefaults(national_id, fullName)

  return NextResponse.json({
    matched: true,
    member: {
      id: member?.id ?? null,
      full_name: fullName,
      national_id,
      year_of_birth,
      kra_pin: kraResult.kra_pin ?? member?.kra_pin ?? defaults.kra_pin,
      member_number: member?.member_number ?? defaults.member_number,
      personal_number: member?.personal_number ?? defaults.personal_number,
      employer_id: member?.employer_id ?? null,
      employer_name: member?.employer_name ?? defaults.employer_name,
      date_of_employment:
        member?.date_of_employment?.toISOString().split("T")[0] ??
        defaults.date_of_employment.toISOString().split("T")[0],
      date_joined_scheme:
        member?.date_joined_scheme?.toISOString().split("T")[0] ??
        defaults.date_joined_scheme.toISOString().split("T")[0],
      mobile_number: member?.mobile_number ?? phone,
      email: member?.email ?? defaults.email,
      postal_address: member?.postal_address ?? defaults.postal_address,
      postal_code: member?.postal_code ?? defaults.postal_code,
      town: member?.town ?? defaults.town,
      communication_pref: member?.communication_pref ?? "PORTAL",
    },
  })
}
