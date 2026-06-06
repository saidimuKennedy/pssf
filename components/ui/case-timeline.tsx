"use client"

import { CaseStatus } from "@prisma/client"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/status-badge"

export interface TimelineEntry {
  id: string
  from_status: CaseStatus | null
  to_status: CaseStatus
  changed_by: string | null
  reason: string | null
  created_at: string | Date
}

const STATUS_DOT: Partial<Record<CaseStatus, string>> = {
  DRAFT: "bg-gray-400",
  SUBMITTED: "bg-indigo-500",
  PENDING_EMPLOYER: "bg-amber-500",
  EMPLOYER_APPROVED: "bg-green-500",
  EMPLOYER_REJECTED: "bg-red-500",
  UNDER_REVIEW: "bg-amber-500",
  MORE_INFO_REQUIRED: "bg-blue-500",
  UNDER_VERIFICATION: "bg-amber-500",
  AWAITING_TRUSTEE: "bg-purple-500",
  APPROVED: "bg-green-600",
  PAYMENT_PROCESSING: "bg-teal-500",
  COMPLETED: "bg-green-600",
  REJECTED: "bg-red-500",
  CLOSED: "bg-gray-400",
}

interface CaseTimelineProps {
  statusHistory: TimelineEntry[]
}

export function CaseTimeline({ statusHistory }: CaseTimelineProps) {
  const sorted = [...statusHistory].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-400">No status history yet.</p>
  }

  return (
    <div className="space-y-0">
      {sorted.map((entry, index) => {
        const timestamp = new Date(entry.created_at).toLocaleString("en-KE", {
          dateStyle: "medium",
          timeStyle: "short",
        })
        const dotColor = STATUS_DOT[entry.to_status] ?? "bg-gray-400"

        return (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn("w-3 h-3 rounded-full shrink-0 mt-1.5", dotColor)} />
              {index < sorted.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-200 my-1 min-h-[24px]" />
              )}
            </div>
            <div className="pb-6 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={entry.to_status} />
                {entry.from_status && (
                  <span className="text-xs text-gray-400">
                    from {entry.from_status.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{timestamp}</p>
              {entry.reason && (
                <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
