import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createCase, listCases } from "@/lib/cases/service"
import { CreateCaseSchema } from "@/lib/validations/cases"
import { CaseType } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = CreateCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const caseId = await createCase(
      {
        type: parsed.data.type as CaseType,
        memberId: session.user.member_id ?? undefined,
        employerId: session.user.employer_id ?? undefined,
        formData: parsed.data.formData,
      },
      session.user.id
    )

    return NextResponse.json({ caseId }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const cases = await listCases(session.user.id, session.user.role)
    return NextResponse.json({ cases })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to list cases" }, { status: 500 })
  }
}
