import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getCase, updateFormData } from "@/lib/cases/service"
import { UpdateFormDataSchema } from "@/lib/validations/cases"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    const caseData = await getCase(id, session.user.id, session.user.role)
    return NextResponse.json(caseData)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = UpdateFormDataSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await updateFormData(id, parsed.data.formData, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 })
  }
}
