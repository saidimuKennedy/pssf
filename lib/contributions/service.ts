import { prisma } from "@/lib/db"

const ANNUAL_INTEREST_RATE = 0.08

export type ContributionPeriod =
  | "CURRENT_YEAR"
  | "LAST_12"
  | "LAST_24"
  | "FULL"
  | "CUSTOM"

export interface ContributionSummary {
  total_employee: number
  total_employer: number
  interest_earned: number
  total_balance: number
  last_updated: string
}

export interface ContributionRow {
  month: string
  employee_amount: number
  employer_amount: number
  date_received: string
  status: string
}

function enumerateMonths(from: Date, to: Date): string[] {
  const months: string[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)
  while (cursor <= end) {
    months.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

function getPeriodRange(
  period: ContributionPeriod,
  from?: string,
  to?: string
): { from: Date; to: Date } {
  const now = new Date()
  const toDate = to ? new Date(to) : now

  switch (period) {
    case "CURRENT_YEAR":
      return { from: new Date(now.getFullYear(), 0, 1), to: toDate }
    case "LAST_12": {
      const from12 = new Date(now)
      from12.setMonth(from12.getMonth() - 12)
      return { from: from12, to: toDate }
    }
    case "LAST_24": {
      const from24 = new Date(now)
      from24.setMonth(from24.getMonth() - 24)
      return { from: from24, to: toDate }
    }
    case "CUSTOM":
      return {
        from: from ? new Date(from) : new Date(now.getFullYear(), 0, 1),
        to: toDate,
      }
    case "FULL":
    default:
      return { from: new Date(2000, 0, 1), to: toDate }
  }
}

function calculateInterest(contributions: { employee_amount: unknown; employer_amount: unknown; date_received: Date }[]): number {
  let balance = 0
  let interest = 0
  const sorted = [...contributions].sort(
    (a, b) => a.date_received.getTime() - b.date_received.getTime()
  )

  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i]
    const amount = Number(c.employee_amount) + Number(c.employer_amount)
    balance += amount

    if (i < sorted.length - 1) {
      const days =
        (sorted[i + 1].date_received.getTime() - c.date_received.getTime()) /
        (1000 * 60 * 60 * 24)
      interest += balance * (ANNUAL_INTEREST_RATE * (days / 365))
    }
  }

  return Math.round(interest * 100) / 100
}

export async function getContributionSummary(memberId: string): Promise<ContributionSummary> {
  const contributions = await prisma.contribution.findMany({
    where: { member_id: memberId },
    orderBy: { date_received: "asc" },
  })

  const totalEmployee = contributions.reduce((s, c) => s + Number(c.employee_amount), 0)
  const totalEmployer = contributions.reduce((s, c) => s + Number(c.employer_amount), 0)
  const interest = calculateInterest(contributions)
  const lastUpdated = contributions.length
    ? contributions[contributions.length - 1].date_received.toISOString()
    : new Date().toISOString()

  return {
    total_employee: totalEmployee,
    total_employer: totalEmployer,
    interest_earned: interest,
    total_balance: totalEmployee + totalEmployer + interest,
    last_updated: lastUpdated,
  }
}

export async function getContributionHistory(
  memberId: string,
  period: ContributionPeriod = "FULL",
  from?: string,
  to?: string
): Promise<ContributionRow[]> {
  const range = getPeriodRange(period, from, to)

  const contributions = await prisma.contribution.findMany({
    where: {
      member_id: memberId,
      date_received: { gte: range.from, lte: range.to },
    },
    orderBy: { month: "asc" },
  })

  const byMonth = new Map(
    contributions.map((c) => [
      c.month,
      {
        month: c.month,
        employee_amount: Number(c.employee_amount),
        employer_amount: Number(c.employer_amount),
        date_received: c.date_received.toISOString().split("T")[0],
        status: c.status,
      },
    ])
  )

  const expectedMonths = enumerateMonths(range.from, range.to)
  return expectedMonths.map((month) => {
    const row = byMonth.get(month)
    if (row) return row
    return {
      month,
      employee_amount: 0,
      employer_amount: 0,
      date_received: "",
      status: "MISSING",
    }
  })
}

export async function getMemberContributions(
  memberId: string,
  period: ContributionPeriod = "FULL",
  from?: string,
  to?: string
) {
  const member = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
    select: { full_name: true, member_number: true, employer_name: true },
  })

  const range = getPeriodRange(period, from, to)
  const summary = await getContributionSummary(memberId)
  const history = await getContributionHistory(memberId, period, from, to)

  return {
    member_number: member.member_number,
    full_name: member.full_name,
    employer_name: member.employer_name,
    period: {
      from: range.from.toISOString().split("T")[0],
      to: range.to.toISOString().split("T")[0],
    },
    summary: {
      total_employee: summary.total_employee,
      total_employer: summary.total_employer,
      interest_earned: summary.interest_earned,
      total_balance: summary.total_balance,
    },
    employee_contributions: history.map((h) => ({
      month: h.month,
      amount: h.employee_amount,
      date_received: h.date_received,
      status: h.status,
    })),
    employer_contributions: history.map((h) => ({
      month: h.month,
      amount: h.employer_amount,
      date_received: h.date_received,
      status: h.status,
    })),
    last_updated: summary.last_updated,
  }
}
