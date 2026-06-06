import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { z } from "zod"
import { assignCase } from "@/lib/cases/staff-actions"

const Schema = z.object({ assignee_id: z.string().uuid().optional() })

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!roles.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const assigneeId =
    session.user.role === Role.PSSF_SUPERVISOR && parsed.data.assignee_id
      ? parsed.data.assignee_id
      : session.user.id

  try {
    await assignCase(id, assigneeId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to assign case" }, { status: 500 })
  }
}
