"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Role, CaseStatus, CaseType } from "@/lib/enums"
import { CaseTimeline, type TimelineEntry } from "@/components/ui/case-timeline"
import { StatusBadge, CASE_TYPE_LABELS } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CaseDocument {
  id: string
  document_type: string
  status: string
  file_name: string | null
  rejection_reason: string | null
}

interface Approval {
  id: string
  type: string
  decision: string
  actor_name: string
  actor_role: string
  reason: string | null
  comments: string | null
  created_at: string
}

interface CaseDetail {
  id: string
  reference: string
  type: CaseType
  status: CaseStatus
  claimant_name: string | null
  assigned_to: string | null
  form_data: Record<string, unknown>
  member?: { full_name: string; national_id: string; member_number: string | null }
  employer?: { name: string }
  documents: CaseDocument[]
  status_history: TimelineEntry[]
  approvals: Approval[]
  notes: { id: string; content: string; created_at: string }[]
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "string") {
    // ISO date
    if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(value)) {
      const d = new Date(value)
      return isNaN(d.getTime()) ? value : d.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })
    }
    // SCREAMING_SNAKE → Title Case
    if (/^[A-Z_]+$/.test(value)) return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    return value
  }
  if (typeof value === "number") return value.toLocaleString()
  return String(value)
}

function FormDataDisplay({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "")
  if (entries.length === 0) return <p className="text-sm text-gray-400">No data</p>
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0">
          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{formatKey(key)}</dt>
          <dd className="mt-0.5 text-sm text-gray-900 break-words">{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function StaffCaseDetailClient({
  caseId,
  userId,
  userRole,
}: {
  caseId: string
  userId: string
  userRole: Role
}) {
  const [data, setData] = useState<CaseDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [reason, setReason] = useState("")
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const isSupervisor = userRole === Role.PSSF_SUPERVISOR
  const isClaimCase = data?.type === CaseType.BENEFITS_CLAIM || data?.type === CaseType.DEATH_BENEFITS_CLAIM

  const load = useCallback(() => {
    fetch(`/api/cases/${caseId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Failed to load case"))
  }, [caseId])

  useEffect(() => { load() }, [load])

  async function apiCall(fn: () => Promise<Response>, successMsg: string) {
    setActionMsg(null)
    try {
      const res = await fn()
      if (res.ok) {
        setActionMsg(successMsg)
        load()
      } else {
        const body = await res.json().catch(() => ({}))
        setActionMsg(`Error: ${body.error ?? res.statusText}`)
      }
    } catch {
      setActionMsg("Network error — please try again.")
    }
  }

  const pssfAction = (decision: string) => apiCall(
    () => fetch("/api/approvals/pssf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, decision, reason, comments: reason }),
    }),
    "Action recorded."
  )

  const trusteeDecision = (decision: string) => apiCall(
    () => fetch("/api/approvals/trustee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, decision, reason, comments: reason }),
    }),
    "Trustee decision recorded."
  )

  async function docAction(docId: string, action: "verify" | "reject") {
    const url = action === "verify" ? `/api/documents/${docId}/verify` : `/api/documents/${docId}/reject`
    const body = action === "reject" ? JSON.stringify({ reason: reason || "Rejected" }) : undefined
    await fetch(url, { method: "POST", headers: body ? { "Content-Type": "application/json" } : {}, body })
    load()
  }

  const postAction = (path: string, body?: object) => apiCall(
    () => fetch(`/api/cases/${caseId}/${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    }),
    "Updated."
  )

  async function addNote() {
    if (!note.trim()) return
    await fetch(`/api/cases/${caseId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note }),
    })
    setNote("")
    load()
  }

  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  if (!data) return <p className="text-gray-500">Loading…</p>

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/staff/cases" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to cases
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono">{data.reference}</h1>
          <p className="text-gray-600">{CASE_TYPE_LABELS[data.type]}</p>
          {data.claimant_name && <p className="text-sm">Claimant: {data.claimant_name}</p>}
        </div>
        <StatusBadge status={data.status} />
      </div>

      {actionMsg && (
        <Alert variant={actionMsg.startsWith("Error:") || actionMsg.startsWith("Network") ? "destructive" : "default"}>
          <AlertDescription>{actionMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white border rounded-lg p-4">
            <h2 className="font-medium mb-3">Case data</h2>
            <FormDataDisplay data={data.form_data} />
          </section>

          <section className="bg-white border rounded-lg p-4">
            <h2 className="font-medium mb-3">Documents</h2>
            <div className="space-y-2">
              {data.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between border rounded p-2 text-sm">
                  <div>
                    <span className="font-medium">{d.document_type}</span>
                    <span className="text-gray-500 ml-2">{d.status}</span>
                    {d.file_name && <span className="text-gray-400 ml-2">{d.file_name}</span>}
                  </div>
                  {d.status !== "VERIFIED" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => docAction(d.id, "verify")}>Verify</Button>
                      <Button size="sm" variant="outline" onClick={() => docAction(d.id, "reject")}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
              {data.documents.length === 0 && <p className="text-gray-500 text-sm">No documents</p>}
            </div>
          </section>

          <section className="bg-white border rounded-lg p-4">
            <h2 className="font-medium mb-3">Approvals</h2>
            {data.approvals.map((a) => (
              <div key={a.id} className="text-sm border-b py-2 last:border-0">
                <span className="font-medium">{a.type}</span> — {a.decision} by {a.actor_name}
                {a.reason && <p className="text-gray-500">{a.reason}</p>}
              </div>
            ))}
          </section>

          <section className="bg-white border rounded-lg p-4">
            <h2 className="font-medium mb-3">Status timeline</h2>
            <CaseTimeline statusHistory={data.status_history} />
          </section>
        </div>

        <div className="space-y-4">
          <section className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="font-medium">Actions</h2>

            {/* Statuses where PSSF can review */}
            {(data.status === CaseStatus.UNDER_REVIEW || data.status === CaseStatus.UNDER_VERIFICATION) && (
              <>
                <Textarea placeholder="Reason / comments" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => pssfAction("APPROVED")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => pssfAction("REJECTED")}>Reject</Button>
                  {data.status === CaseStatus.UNDER_REVIEW && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => pssfAction("REQUEST_MORE_INFO")}>Request Info</Button>
                      <Button size="sm" variant="outline" onClick={() => postAction("route-to-verification")}>Route to Verification</Button>
                    </>
                  )}
                  {data.status === CaseStatus.UNDER_VERIFICATION && data.type === CaseType.DEATH_BENEFITS_CLAIM && (
                    <Button size="sm" variant="outline" onClick={() => postAction("route-to-trustee")}>Route to Trustee</Button>
                  )}
                </div>
              </>
            )}

            {/* Claim payment flow */}
            {isClaimCase && data.status === CaseStatus.APPROVED && (
              <Button size="sm" className="w-full" onClick={() => postAction("mark-payment-processing")}>Mark Payment Processing</Button>
            )}
            {isClaimCase && data.status === CaseStatus.PAYMENT_PROCESSING && (
              <Button size="sm" className="w-full" onClick={() => postAction("mark-paid")}>Mark Paid / Completed</Button>
            )}

            {/* Trustee decision — supervisor only */}
            {isSupervisor && data.status === CaseStatus.AWAITING_TRUSTEE && (
              <div className="space-y-2 pt-1 border-t">
                <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Trustee Decision</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => trusteeDecision("APPROVED")}>Trustee Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => trusteeDecision("REJECTED")}>Trustee Reject</Button>
                </div>
              </div>
            )}

            {/* Supervisor tools */}
            {isSupervisor && (
              <div className="flex flex-wrap gap-2 pt-1 border-t">
                <Button size="sm" variant="outline" onClick={() => postAction("reassign", { assigneeId: userId })}>Reassign to me</Button>
                <Button size="sm" variant="outline" onClick={() => postAction("close")}>Close Case</Button>
              </div>
            )}

            {/* Terminal state notice */}
            {(data.status === CaseStatus.COMPLETED || data.status === "CLOSED" || data.status === CaseStatus.REJECTED) && (
              <p className="text-sm text-gray-400 italic">This case is {data.status.toLowerCase()} — no further actions available.</p>
            )}
          </section>

          <section className="bg-white border rounded-lg p-4 space-y-3">
            <h2 className="font-medium">Notes</h2>
            {data.notes.map((n) => (
              <p key={n.id} className="text-sm text-gray-600 border-b pb-2">{n.content}</p>
            ))}
            <Label>Add note</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            <Button size="sm" onClick={addNote}>Add Note</Button>
          </section>

          {data.member && (
            <section className="bg-white border rounded-lg p-4 text-sm space-y-1">
              <h2 className="font-medium mb-2">Member</h2>
              <p>{data.member.full_name}</p>
              <p className="text-gray-500">{data.member.national_id}</p>
              <p className="text-gray-500">{data.member.member_number}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
