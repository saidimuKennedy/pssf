import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { validateDeceasedMember } from "@/lib/death-benefits/service"

const Schema = z.object({
  national_id: z.string().min(1),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  personal_number: z.string().optional(),
  member_number: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const result = await validateDeceasedMember(parsed.data)
  return NextResponse.json(result)
}
