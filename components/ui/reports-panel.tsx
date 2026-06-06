"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const REPORTS = [
  { type: "submissions_by_type", title: "Submissions by Type" },
  { type: "cases_by_status", title: "Cases by Status" },
  { type: "employer_response", title: "Employer Response Times" },
  { type: "processing_times", title: "Processing Times" },
] as const

export function ReportsPanel() {
  const [period, setPeriod] = useState("30d")
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [active, setActive] = useState<string>("submissions_by_type")

  useEffect(() => {
    fetch(`/api/admin/reports?type=${active}&period=${period}`).then((r) => r.json()).then(setData)
  }, [active, period])

  const items = (data?.items as { type?: string; status?: string; count?: number; employer_name?: string; average_days?: number; case_count?: number }[]) ?? []

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {REPORTS.map((r) => (
          <div key={r.type} className={`bg-white border rounded-lg p-4 cursor-pointer ${active === r.type ? "ring-2 ring-[#1A7A4A]" : ""}`} onClick={() => setActive(r.type)}>
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{r.title}</h3>
              <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                <a href={`/api/admin/reports?type=${r.type}&period=${period}&export=true`}>CSV</a>
              </Button>
            </div>
            {active === r.type && (
              <ul className="mt-3 text-sm space-y-1">
                {items.map((item, i) => (
                  <li key={i}>
                    {item.type ?? item.status ?? item.employer_name}: {item.count ?? item.average_days} {item.case_count != null ? `(${item.case_count} cases)` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
