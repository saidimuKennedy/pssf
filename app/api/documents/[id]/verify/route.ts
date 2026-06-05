import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { verifyDocument } from "@/lib/documents/service"
import { AuthError } from "@/lib/state-machine/guards"
import { Role } from "@prisma/client"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const allowedRoles: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!(allowedRoles as Role[]).includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const { id } = await params

  try {
    await verifyDocument(id, session.user.id, session.user.role)
    return NextResponse.json({ status: "VERIFIED" })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message, code: err.name }, { status: 403 })
    }
    console.error(err)
    return NextResponse.json(
      { error: "Failed to verify document", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}
