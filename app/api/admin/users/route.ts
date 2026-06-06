import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { z } from "zod"
import { listUsers, createAdminUser } from "@/lib/admin/users"

const CreateSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(Object.values(Role) as [string, ...string[]]),
  employer_id: z.string().uuid().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const result = await listUsers({
    role: (searchParams.get("role") as Role) || undefined,
    status: (searchParams.get("status") as "active" | "inactive") || undefined,
    search: searchParams.get("search") ?? undefined,
    page: parseInt(searchParams.get("page") ?? "1", 10),
    limit: parseInt(searchParams.get("limit") ?? "20", 10),
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await createAdminUser({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role as Role,
      employer_id: parsed.data.employer_id,
    })
    return NextResponse.json({ userId: result.userId }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
