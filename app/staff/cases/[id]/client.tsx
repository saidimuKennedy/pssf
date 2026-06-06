"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Role, CaseStatus, CaseType } from "@prisma/client"
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

  async function pssfAction(decision: string) {
    const res = await fetch("/api/approvals/pssf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, decision, reason, comments: reason }),
    })
    if (res.ok) { setActionMsg("Action recorded."); load() }
    else setActionMsg("Action failed.")
  }

  async function trusteeDecision(decision: string) {
    const res = await fetch("/api/approvals/trustee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId, decision, reason, comments: reason }),
    })
    if (res.ok) { setActionMsg("Trustee decision recorded."); load() }
    else setActionMsg("Trustee action failed.")
  }

  async function docAction(docId: string, action: "verify" | "reject") {
    const url = action === "verify" ? `/api/documents/${docId}/verify` : `/api/documents/${docId}/reject`
    const body = action === "reject" ? JSON.stringify({ reason: reason || "Rejected" }) : undefined
    await fetch(url, { method: "POST", headers: body ? { "Content-Type": "application/json" } : {}, body })
    load()
  }

  async function postAction(path: string, body?: object) {
    const res = await fetch(`/api/cases/${caseId}/${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.ok) { setActionMsg("Updated."); load() }
    else setActionMsg("Action failed.")
  }

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

      {actionMsg && <Alert><AlertDescription>{actionMsg}</AlertDescription></Alert>}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white border rounded-lg p-4">
            <h2 className="font-medium mb-3">Case data</h2>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64">{JSON.stringify(data.form_data, null, 2)}</pre>
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
            <Textarea placeholder="Reason / comments" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => pssfAction("APPROVED")}>Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => pssfAction("REJECTED")}>Reject</Button>
              <Button size="sm" variant="outline" onClick={() => pssfAction("REQUEST_MORE_INFO")}>Request Info</Button>
              <Button size="sm" variant="outline" onClick={() => postAction("route-to-verification")}>Mark Verified</Button>
            </div>
            {isClaimCase && data.status === CaseStatus.APPROVED && (
              <Button size="sm" className="w-full" onClick={() => postAction("mark-payment-processing")}>Mark Payment Processing</Button>
            )}
            {isClaimCase && data.status === CaseStatus.PAYMENT_PROCESSING && (
              <Button size="sm" className="w-full" onClick={() => postAction("mark-paid")}>Mark Paid</Button>
            )}
            {isSupervisor && (
              <>
                <Button size="sm" variant="outline" className="w-full" onClick={() => postAction("reassign", { assigneeId: userId })}>Reassign to me</Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => postAction("close")}>Close Case</Button>
              </>
            )}
          </section>

          {isSupervisor && data.status === CaseStatus.AWAITING_TRUSTEE && (
            <section className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
              <h2 className="font-medium text-purple-900">Trustee Decision</h2>
              <Button size="sm" onClick={() => trusteeDecision("APPROVED")}>Trustee Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => trusteeDecision("REJECTED")}>Trustee Reject</Button>
            </section>
          )}

          {data.status === CaseStatus.UNDER_VERIFICATION && data.type === CaseType.DEATH_BENEFITS_CLAIM && (
            <Button size="sm" variant="outline" className="w-full" onClick={() => postAction("route-to-trustee")}>Route to Trustee</Button>
          )}

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
