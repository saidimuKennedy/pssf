import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getMemberProfile, updateMemberContact } from "@/lib/members/service"
import { UpdateContactSchema } from "@/lib/validations/members"
import { Role } from "@prisma/client"

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const allowedRoles: Role[] = [Role.MEMBER, Role.CLAIMANT]
  if (!(allowedRoles as Role[]).includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const profile = await getMemberProfile(session.user.id)
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const allowedRoles: Role[] = [Role.MEMBER, Role.CLAIMANT]
  if (!(allowedRoles as Role[]).includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = UpdateContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  await updateMemberContact(session.user.id, parsed.data)
  const updated = await getMemberProfile(session.user.id)
  return NextResponse.json(updated)
}
