import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { removeBeneficiary, updateBeneficiary } from "@/lib/beneficiaries/service"
import { PatchBeneficiarySchema } from "@/lib/validations/beneficiaries"
import { AuthError } from "@/lib/state-machine/guards"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; beneficiaryId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const { id, beneficiaryId } = await params
  const body = await req.json()
  const parsed = PatchBeneficiarySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  try {
    const beneficiary = await updateBeneficiary(
      beneficiaryId,
      parsed.data,
      session.user.id,
      session.user.role
    )
    return NextResponse.json({ beneficiary })
  } catch (error) {
    if (error instanceof AuthError) {
      const status = error.name === "NOT_FOUND" ? 404 : 422
      return NextResponse.json(
        { error: error.message, code: error.name, details: error.details },
        { status }
      )
    }
    console.error(error)
    return NextResponse.json({ error: "Failed to update beneficiary", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; beneficiaryId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const { id, beneficiaryId } = await params
  try {
    await removeBeneficiary(beneficiaryId, id, session.user.id, session.user.role)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      const status = error.name === "NOT_FOUND" ? 404 : 422
      return NextResponse.json(
        { error: error.message, code: error.name, details: error.details },
        { status }
      )
    }
    console.error(error)
    return NextResponse.json({ error: "Failed to remove beneficiary", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
