import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { closeCase } from "@/lib/cases/service"
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
  try {
    await closeCase(id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to close case" }, { status: 500 })
  }
}
