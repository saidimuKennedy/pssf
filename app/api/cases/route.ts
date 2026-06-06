import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createCase, listCases } from "@/lib/cases/service"
import { CreateCaseSchema } from "@/lib/validations/cases"
import { CaseType, CaseStatus, Role } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = CreateCaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const type = parsed.data.type as CaseType
    const formData = { ...parsed.data.formData }

    let memberId = session.user.member_id ?? undefined
    let claimantName: string | undefined

    let employerId = session.user.employer_id ?? undefined

    if (type === CaseType.DEATH_BENEFITS_CLAIM) {
      const deceasedId = formData.deceased_member_id as string | undefined
      if (!deceasedId) {
        return NextResponse.json({ error: "deceased_member_id is required" }, { status: 400 })
      }
      const deceased = await prisma.member.findUnique({
        where: { id: deceasedId },
        select: { employer_id: true },
      })
      if (!deceased) {
        return NextResponse.json({ error: "Deceased member not found" }, { status: 404 })
      }
      memberId = deceasedId
      employerId = deceased.employer_id ?? undefined
      formData.claimant_user_id = session.user.id
      claimantName = session.user.name ?? "Sarah Kamau"
    }

    const caseId = await createCase(
      {
        type,
        memberId,
        employerId,
        claimantName,
        formData,
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

  const { searchParams } = req.nextUrl
  const statusParam = searchParams.get("status")
  const typeParam = searchParams.get("type")

  try {
    const result = await listCases(session.user.id, session.user.role, {
      status: statusParam ? (statusParam as CaseStatus) : undefined,
      type: typeParam ? (typeParam as CaseType) : undefined,
      page: parseInt(searchParams.get("page") ?? "1", 10),
      limit: parseInt(searchParams.get("limit") ?? "20", 10),
      search: searchParams.get("search") ?? undefined,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to list cases" }, { status: 500 })
  }
}
