"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CaseStatus, CaseType } from "@/lib/enums"
import { StatusBadge, CASE_TYPE_LABELS } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface CaseRow {
  id: string
  reference: string
  type: CaseType
  status: CaseStatus
  updated_at: string
  member?: { full_name: string }
}

export default function StaffDashboardPage() {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/cases?limit=100")
      .then((r) => r.json())
      .then((d) => setCases(d.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const counts = cases.reduce(
    (acc, c) => {
      acc.byType[c.type] = (acc.byType[c.type] ?? 0) + 1
      acc.byStatus[c.status] = (acc.byStatus[c.status] ?? 0) + 1
      return acc
    },
    { byType: {} as Record<string, number>, byStatus: {} as Record<string, number> }
  )

  const overdue = cases.filter((c) =>
    ["UNDER_REVIEW", "UNDER_VERIFICATION", "PENDING_EMPLOYER"].includes(c.status)
  ).slice(0, 5)

  const recent = [...cases].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8)

  if (loading) return <p className="text-gray-500">Loading dashboard…</p>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D2137]">Staff Dashboard</h1>
        <Button asChild variant="outline"><Link href="/staff/cases">View all cases</Link></Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(CASE_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-[#0D2137]">{counts.byType[type] ?? 0}</p>
          </div>
        ))}
      </div>

      {Object.keys(counts.byStatus).length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Cases by status</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts.byStatus)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div
                  key={status}
                  className="inline-flex items-center gap-2 bg-white border rounded-lg px-3 py-2"
                >
                  <StatusBadge status={status as CaseStatus} />
                  <span className="text-sm font-semibold text-[#0D2137]">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
            <AlertTriangle className="w-4 h-4" /> Attention required
          </div>
          <ul className="text-sm space-y-1">
            {overdue.map((c) => (
              <li key={c.id}>
                <Link href={`/staff/cases/${c.id}`} className="text-amber-900 hover:underline">
                  {c.reference} — {CASE_TYPE_LABELS[c.type]} — <StatusBadge status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b font-medium">Recent submissions</div>
        <div className="divide-y">
          {recent.map((c) => (
            <Link key={c.id} href={`/staff/cases/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div>
                <span className="font-mono text-sm">{c.reference}</span>
                <span className="text-gray-500 text-sm ml-2">{c.member?.full_name}</span>
              </div>
              <StatusBadge status={c.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
