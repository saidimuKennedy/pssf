import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { z } from "zod"
import { getEmployerDetail, updateEmployer, addEmployerOfficer } from "@/lib/admin/employers"

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
})

const AddOfficerSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const employer = await getEmployerDetail(id)
  if (!employer) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(employer)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()

  if (body.add_officer) {
    const parsed = AddOfficerSchema.safeParse(body.add_officer)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    await addEmployerOfficer(id, parsed.data)
    const employer = await getEmployerDetail(id)
    return NextResponse.json(employer)
  }

  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const employer = await updateEmployer(id, parsed.data)
  return NextResponse.json(employer)
}
