"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { CaseTimeline, type TimelineEntry } from "@/components/ui/case-timeline"
import { StatusBadge } from "@/components/ui/status-badge"
import { FIELD_LABELS, type DiscrepancyField } from "@/lib/validations/discrepancy"
import { CaseStatus } from "@/lib/enums"

export default function DiscrepancyDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<{
    reference: string
    status: CaseStatus
    form_data: Record<string, unknown>
    status_history: TimelineEntry[]
  } | null>(null)

  useEffect(() => {
    fetch(`/api/cases/${id}`).then((r) => r.json()).then(setData)
  }, [id])

  if (!data) return <p className="text-gray-500">Loading…</p>
  const fd = data.form_data
  const field = fd.field_name as DiscrepancyField

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/member/requests" className="text-sm text-[#1A7A4A] hover:underline">← My requests</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-mono">{data.reference}</h1>
        <StatusBadge status={data.status} />
      </div>
      <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
        <p><strong>Field reported:</strong> {FIELD_LABELS[field] ?? String(fd.field_name)}</p>
        <p><strong>Correct information:</strong> {String(fd.correct_information)}</p>
        <p><strong>Explanation:</strong> {String(fd.explanation)}</p>
        {fd.resolution_notes != null ? <p><strong>Resolution:</strong> {String(fd.resolution_notes)}</p> : null}
      </div>
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-medium mb-3">Status timeline</h2>
        <CaseTimeline statusHistory={data.status_history} />
      </div>
    </div>
  )
}
