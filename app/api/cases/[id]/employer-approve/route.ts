import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  Role,
  CaseStatus,
  CaseType,
  ApprovalType,
  ApprovalDecision,
} from "@prisma/client"
import { transition } from "@/lib/state-machine/transitions"
import { prisma } from "@/lib/db"
import { EmployerAVCApprovalSchema } from "@/lib/validations/avc"
import { z } from "zod"

const BaseApprovalSchema = z.object({
  officer_name: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  effective_payroll_month: z.string().optional(),
  comments: z.string().optional(),
  exit_date_confirmed: z.boolean().optional(),
  confirmed_exit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== Role.EMPLOYER) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const caseRecord = await prisma.case.findUnique({ where: { id } })
  if (!caseRecord) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (caseRecord.employer_id !== session.user.employer_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = BaseApprovalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  if (caseRecord.type === CaseType.AVC) {
    const avcParsed = EmployerAVCApprovalSchema.safeParse(body)
    if (!avcParsed.success) {
      return NextResponse.json(
        { error: "AVC approval requires effective payroll month, officer name, and designation", details: avcParsed.error.flatten() },
        { status: 422 }
      )
    }
  }

  const formData = (caseRecord.form_data ?? {}) as Record<string, unknown>
  let confirmedExitDate: string | undefined

  if (caseRecord.type === CaseType.BENEFITS_CLAIM) {
    if (!parsed.data.exit_date_confirmed) {
      return NextResponse.json(
        { error: "You must confirm the member's exit date before approving." },
        { status: 422 }
      )
    }
    const dateOfLeaving = formData.date_of_leaving ? String(formData.date_of_leaving) : null
    if (!dateOfLeaving) {
      return NextResponse.json({ error: "Case is missing date of leaving." }, { status: 422 })
    }
    confirmedExitDate = parsed.data.confirmed_exit_date ?? dateOfLeaving
    if (confirmedExitDate !== dateOfLeaving) {
      return NextResponse.json(
        { error: "Confirmed exit date must match the date of leaving on the claim." },
        { status: 422 }
      )
    }
  }

  const officer = await prisma.employerOfficer.findFirst({
    where: { user_id: session.user.id },
    include: { employer: true },
  })

  const officerName = parsed.data.officer_name ?? officer?.full_name ?? "Employer Officer"
  const designation = parsed.data.designation ?? officer?.designation ?? undefined
  const effectiveMonth = parsed.data.effective_payroll_month

  const approvalComments = JSON.stringify({
    officer_name: officerName,
    designation,
    effective_payroll_month: effectiveMonth,
    comments: parsed.data.comments ?? null,
    exit_date_confirmed: parsed.data.exit_date_confirmed ?? null,
    confirmed_exit_date: confirmedExitDate ?? null,
  })

  const digitalRef =
    caseRecord.type === CaseType.BENEFITS_CLAIM
      ? (confirmedExitDate ?? null)
      : (effectiveMonth ?? null)

  try {
    await prisma.approval.create({
      data: {
        case_id: id,
        type: ApprovalType.EMPLOYER,
        decision: ApprovalDecision.APPROVED,
        actor_id: session.user.id,
        actor_name: officerName,
        actor_role: Role.EMPLOYER,
        actor_org: officer?.employer.name,
        digital_ref: digitalRef,
        comments: approvalComments,
      },
    })

    await transition({
      caseId: id,
      action: "EMPLOYER_APPROVE",
      actorId: session.user.id,
      actorRole: Role.EMPLOYER,
      nextStatus: CaseStatus.EMPLOYER_APPROVED,
    })
    await transition({
      caseId: id,
      action: "ROUTE",
      nextStatus: CaseStatus.UNDER_REVIEW,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to approve case" }, { status: 500 })
  }
}
