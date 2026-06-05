import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getTasksForActor } from "@/lib/tasks/service"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const tasks = await getTasksForActor(session.user.id, session.user.role)
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}
