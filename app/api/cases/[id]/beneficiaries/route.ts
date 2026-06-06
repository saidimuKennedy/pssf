import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { addBeneficiary, getBeneficiaries } from "@/lib/beneficiaries/service"
import { BeneficiarySchema } from "@/lib/validations/beneficiaries"
import { AuthError } from "@/lib/state-machine/guards"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const { id } = await params
  try {
    const beneficiaries = await getBeneficiaries(id, session.user.id, session.user.role)
    return NextResponse.json({ beneficiaries })
  } catch (error) {
    if (error instanceof AuthError) {
      const status = error.name === "NOT_FOUND" ? 404 : 422
      return NextResponse.json(
        { error: error.message, code: error.name, details: error.details },
        { status }
      )
    }
    console.error(error)
    return NextResponse.json({ error: "Failed to list beneficiaries", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = BeneficiarySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  try {
    const beneficiary = await addBeneficiary(id, parsed.data, session.user.id, session.user.role)
    return NextResponse.json({ beneficiary }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      const status = error.name === "NOT_FOUND" ? 404 : 422
      return NextResponse.json(
        { error: error.message, code: error.name, details: error.details },
        { status }
      )
    }
    console.error(error)
    return NextResponse.json({ error: "Failed to add beneficiary", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
