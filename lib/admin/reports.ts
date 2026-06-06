import { CaseStatus, CaseType } from "@prisma/client"
import { prisma } from "@/lib/db"

export type ReportPeriod = "7d" | "30d" | "90d" | "year"

function periodStart(period: ReportPeriod): Date {
  const now = new Date()
  switch (period) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case "year":
      return new Date(now.getFullYear(), 0, 1)
  }
}

export async function getSubmissionsByType(period: ReportPeriod) {
  const from = periodStart(period)
  const groups = await prisma.case.groupBy({
    by: ["type"],
    where: { submitted_at: { gte: from } },
    _count: { id: true },
  })
  return groups.map((g) => ({
    type: g.type,
    count: g._count.id,
  }))
}

export async function getCasesByStatus() {
  const groups = await prisma.case.groupBy({
    by: ["status"],
    _count: { id: true },
  })
  return groups.map((g) => ({
    status: g.status,
    count: g._count.id,
  }))
}

export async function getEmployerResponseTimes(period: ReportPeriod) {
  const from = periodStart(period)
  const approvals = await prisma.approval.findMany({
    where: {
      type: "EMPLOYER",
      decision: "APPROVED",
      created_at: { gte: from },
    },
    include: {
      case: {
        select: {
          employer_id: true,
          employer: { select: { name: true } },
          submitted_at: true,
        },
      },
    },
  })

  const byEmployer = new Map<string, { name: string; totalDays: number; count: number }>()

  for (const a of approvals) {
    if (!a.case.employer_id || !a.case.submitted_at) continue
    const days =
      (a.created_at.getTime() - a.case.submitted_at.getTime()) / (1000 * 60 * 60 * 24)
    const key = a.case.employer_id
    const existing = byEmployer.get(key) ?? {
      name: a.case.employer?.name ?? "Unknown",
      totalDays: 0,
      count: 0,
    }
    existing.totalDays += days
    existing.count += 1
    byEmployer.set(key, existing)
  }

  return Array.from(byEmployer.entries()).map(([employer_id, v]) => ({
    employer_id,
    employer_name: v.name,
    average_days: Math.round((v.totalDays / v.count) * 10) / 10,
    case_count: v.count,
  }))
}

export async function getProcessingTimes(period: ReportPeriod) {
  const from = periodStart(period)
  const completed = await prisma.case.findMany({
    where: {
      status: CaseStatus.COMPLETED,
      submitted_at: { gte: from },
      completed_at: { not: null },
    },
    select: { type: true, submitted_at: true, completed_at: true },
  })

  const byType = new Map<CaseType, { totalDays: number; count: number }>()
  for (const c of completed) {
    if (!c.submitted_at || !c.completed_at) continue
    const days =
      (c.completed_at.getTime() - c.submitted_at.getTime()) / (1000 * 60 * 60 * 24)
    const existing = byType.get(c.type) ?? { totalDays: 0, count: 0 }
    existing.totalDays += days
    existing.count += 1
    byType.set(c.type, existing)
  }

  return Array.from(byType.entries()).map(([type, v]) => ({
    type,
    average_days: Math.round((v.totalDays / v.count) * 10) / 10,
    case_count: v.count,
  }))
}
