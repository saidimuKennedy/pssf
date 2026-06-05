import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { submitAdditionalInfo } from "@/lib/cases/service"
import { AdditionalInfoSchema } from "@/lib/validations/cases"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = AdditionalInfoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await submitAdditionalInfo(id, parsed.data.response, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to submit additional info" }, { status: 500 })
  }
}
