import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allowed: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!(allowed as Role[]).includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const caseRecord = await prisma.case.findUnique({
    where: { id },
    include: {
      member: { select: { full_name: true, national_id: true, employer_name: true } },
      status_history: { orderBy: { created_at: "asc" } },
    },
  })

  if (!caseRecord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const rows: string[] = [
    "section,field,value",
    `case,reference,${escape(caseRecord.reference)}`,
    `case,type,${escape(caseRecord.type)}`,
    `case,status,${escape(caseRecord.status)}`,
    `case,member_name,${escape(caseRecord.member?.full_name ?? "")}`,
    `case,member_id,${escape(caseRecord.member?.national_id ?? "")}`,
    `case,employer,${escape(caseRecord.member?.employer_name ?? "")}`,
    `case,submitted_at,${escape(caseRecord.submitted_at?.toISOString() ?? "")}`,
    `case,completed_at,${escape(caseRecord.completed_at?.toISOString() ?? "")}`,
  ]

  for (const h of caseRecord.status_history) {
    rows.push(
      [
        "history",
        escape(h.to_status),
        escape(`${h.from_status ?? "—"} → ${h.to_status} @ ${h.created_at.toISOString()}`),
      ].join(",")
    )
  }

  const csv = rows.join("\n")
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${caseRecord.reference}.csv"`,
    },
  })
}
