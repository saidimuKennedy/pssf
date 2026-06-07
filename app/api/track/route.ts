import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { CaseType } from "@prisma/client"

const TYPE_LABELS: Record<CaseType, string> = {
  MEMBER_ENROLMENT: "Member Enrolment",
  BENEFICIARY_NOMINATION: "Beneficiary Nomination",
  AVC: "AVC",
  BENEFITS_CLAIM: "Benefits Claim",
  DEATH_BENEFITS_CLAIM: "Death Benefits Claim",
  MISSING_CONTRIBUTION: "Missing Contribution",
  DISCREPANCY: "Discrepancy",
}

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")?.trim()
  if (!ref) {
    return NextResponse.json(
      { error: "Reference number is required", code: "VALIDATION_ERROR" },
      { status: 422 }
    )
  }

  const caseRecord = await prisma.case.findUnique({
    where: { reference: ref },
    select: {
      reference: true,
      type: true,
      status: true,
      submitted_at: true,
      updated_at: true,
      status_history: {
        orderBy: { created_at: "asc" },
        select: {
          from_status: true,
          to_status: true,
          created_at: true,
        },
      },
    },
  })

  if (!caseRecord) {
    return NextResponse.json(
      { error: "No request found with this reference number. Please check and try again.", code: "NOT_FOUND" },
      { status: 404 }
    )
  }

  return NextResponse.json({
    reference: caseRecord.reference,
    type: caseRecord.type,
    type_label: TYPE_LABELS[caseRecord.type] ?? caseRecord.type,
    status: caseRecord.status,
    submitted_at: caseRecord.submitted_at,
    updated_at: caseRecord.updated_at,
    status_history: caseRecord.status_history.map((h) => ({
      from_status: h.from_status,
      to_status: h.to_status,
      created_at: h.created_at,
    })),
  })
}
