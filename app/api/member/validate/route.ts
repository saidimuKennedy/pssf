import { NextRequest, NextResponse } from "next/server"
import { validateMember } from "@/lib/members/service"
import { ValidateMemberSchema } from "@/lib/validations/members"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ValidateMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const result = await validateMember(parsed.data.national_id, parsed.data.date_of_birth)
  return NextResponse.json(result)
}
