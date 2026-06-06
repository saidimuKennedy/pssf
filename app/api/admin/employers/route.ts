import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { z } from "zod"
import { listEmployers, createEmployer } from "@/lib/admin/employers"

const CreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  officer: z
    .object({
      full_name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
    })
    .optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const result = await listEmployers(
    parseInt(searchParams.get("page") ?? "1", 10),
    parseInt(searchParams.get("limit") ?? "20", 10),
    searchParams.get("search") ?? undefined
  )
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
    const employer = await createEmployer(parsed.data)
    return NextResponse.json(employer, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create employer" }, { status: 500 })
  }
}
