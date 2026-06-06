"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CaseStatus, CaseType } from "@prisma/client"
import { StatusBadge, CASE_TYPE_LABELS } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CaseRow {
  id: string
  reference: string
  type: CaseType
  status: CaseStatus
  assigned_to: string | null
  member?: { full_name: string }
  employer?: { name: string }
  updated_at: string
}

export default function StaffCasesPage() {
  const searchParams = useSearchParams()
  const [cases, setCases] = useState<CaseRow[]>([])
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") ?? "ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  function load() {
    const params = new URLSearchParams({ limit: "100" })
    if (typeFilter !== "ALL") params.set("type", typeFilter)
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    if (search) params.set("search", search)
    fetch(`/api/cases?${params}`).then((r) => r.json()).then((d) => setCases(d.data ?? []))
  }

  useEffect(() => { load() }, [typeFilter, statusFilter])

  async function assignToSelf(caseId: string) {
    await fetch(`/api/cases/${caseId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0D2137]">All Cases</h1>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search reference…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button variant="outline" onClick={load}>Search</Button>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {Object.entries(CASE_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {Object.values(CaseStatus).map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-2">Reference</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Member</th>
              <th className="text-left px-4 py-2">Employer</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2"><Link href={`/staff/cases/${c.id}`} className="font-mono text-[#1A7A4A] hover:underline">{c.reference}</Link></td>
                <td className="px-4 py-2">{CASE_TYPE_LABELS[c.type]}</td>
                <td className="px-4 py-2">{c.member?.full_name ?? "—"}</td>
                <td className="px-4 py-2">{c.employer?.name ?? "—"}</td>
                <td className="px-4 py-2"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-2">
                  {!c.assigned_to && (
                    <Button size="sm" variant="outline" onClick={() => assignToSelf(c.id)}>Assign to me</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
