"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableScroll } from "@/components/ui/table-scroll"

interface AuditRow {
  id: string
  timestamp: string
  actor_name: string
  actor_role: string
  action: string
  case_reference: string
  from_status: string
  to_status: string
}

export default function AdminAuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [caseId, setCaseId] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  function load() {
    const params = new URLSearchParams({ limit: "100" })
    if (caseId) params.set("case_id", caseId)
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    fetch(`/api/admin/audit?${params}`).then((r) => r.json()).then((d) => setRows(d.data ?? []))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audit Trail</h1>
        <Button variant="outline" asChild><a href="/api/admin/audit?export=true">Export CSV</a></Button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Case ID" value={caseId} onChange={(e) => setCaseId(e.target.value)} className="max-w-xs" />
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button variant="outline" onClick={load}>Filter</Button>
      </div>
      <TableScroll>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-3 py-2">Timestamp</th><th className="text-left px-3 py-2">Actor</th><th className="text-left px-3 py-2">Action</th><th className="text-left px-3 py-2">Case</th><th className="text-left px-3 py-2">Transition</th>
          </tr></thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2">{r.actor_name}<br /><span className="text-xs text-gray-400">{r.actor_role}</span></td>
                <td className="px-3 py-2">{r.action}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.case_reference}</td>
                <td className="px-3 py-2 text-xs">{r.from_status} → {r.to_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  )
}
