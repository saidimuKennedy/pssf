"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"
import { StatusBadge, CASE_TYPE_LABELS } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CaseStatus, CaseType } from "@prisma/client"

interface CaseRow {
  id: string
  reference: string
  type: CaseType
  status: CaseStatus
  submitted_at: string | null
  updated_at: string
}

export default function MemberRequestsPage() {
  const [cases, setCases] = useState<CaseRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  const limit = 10

  const loadCases = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (typeFilter !== "all") params.set("type", typeFilter)

      const res = await fetch(`/api/cases?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCases(data.data ?? [])
        setTotal(data.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, typeFilter])

  useEffect(() => {
    loadCases()
  }, [loadCases])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0D2137]">My Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and track all your submitted cases.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Case type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(CASE_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(CaseStatus).map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : cases.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No requests found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Submitted</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/member/requests/${c.id}`}
                      className="font-medium text-[#2563EB] hover:underline"
                    >
                      {c.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                    {CASE_TYPE_LABELS[c.type] ?? c.type}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {c.submitted_at
                      ? new Date(c.submitted_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {new Date(c.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
