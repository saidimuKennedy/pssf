import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import {
  getSubmissionsByType,
  getCasesByStatus,
  getEmployerResponseTimes,
  getProcessingTimes,
  type ReportPeriod,
} from "@/lib/admin/reports"
import { buildCsv } from "@/lib/csv"

const VALID_TYPES = [
  "submissions_by_type",
  "cases_by_status",
  "employer_response",
  "processing_times",
] as const

export async function GET(req: NextRequest) {
  const session = await auth()
  const allowed: Role[] = [Role.ADMIN, Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR]
  if (!session?.user || !allowed.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const type = searchParams.get("type") ?? "submissions_by_type"
  const period = (searchParams.get("period") ?? "30d") as ReportPeriod
  const exportCsv = searchParams.get("export") === "true"

  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  }

  let data: unknown
  let headers: string[] = []
  let rows: (string | number)[][] = []

  switch (type) {
    case "submissions_by_type": {
      const result = await getSubmissionsByType(period)
      data = { period, items: result }
      headers = ["type", "count"]
      rows = result.map((r) => [r.type, r.count])
      break
    }
    case "cases_by_status": {
      const result = await getCasesByStatus()
      data = { items: result }
      headers = ["status", "count"]
      rows = result.map((r) => [r.status, r.count])
      break
    }
    case "employer_response": {
      const result = await getEmployerResponseTimes(period)
      data = { period, items: result }
      headers = ["employer_name", "average_days", "case_count"]
      rows = result.map((r) => [r.employer_name, r.average_days, r.case_count])
      break
    }
    case "processing_times": {
      const result = await getProcessingTimes(period)
      data = { period, items: result }
      headers = ["type", "average_days", "case_count"]
      rows = result.map((r) => [r.type, r.average_days, r.case_count])
      break
    }
  }

  if (exportCsv) {
    const csv = buildCsv(headers, rows)
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-report.csv"`,
      },
    })
  }

  return NextResponse.json(data)
}
