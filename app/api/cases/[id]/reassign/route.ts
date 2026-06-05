import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { reassignCase } from "@/lib/cases/service"
import { ReassignSchema } from "@/lib/validations/cases"
import { Role } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (session.user.role !== Role.PSSF_SUPERVISOR) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = ReassignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await reassignCase(id, parsed.data.assigneeId, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to reassign case" }, { status: 500 })
  }
}
