import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { completeTask } from "@/lib/tasks/service"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  try {
    await completeTask(id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to complete task" }, { status: 500 })
  }
}
