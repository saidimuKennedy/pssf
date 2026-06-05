import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { addNote } from "@/lib/cases/service"
import { AddNoteSchema } from "@/lib/validations/cases"
import { Role } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const validRoles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!validRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = AddNoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    await addNote(id, parsed.data.content, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 })
  }
}
