"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { FIELD_LABELS, type DiscrepancyField } from "@/lib/validations/discrepancy"
import { CaseStatus } from "@/lib/enums"

interface CaseData {
  id: string
  reference: string
  status: string
  form_data: Record<string, unknown>
  member?: { full_name: string; national_id: string }
}

export default function EmployerDiscrepancyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [disputeReason, setDisputeReason] = useState("")
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((data) => setCaseData(data as CaseData))
      .catch(() => setLoadError("Failed to load discrepancy."))
  }, [id])

  async function submitDecision(decision: "APPROVED" | "REJECTED", reason?: string) {
    setActionError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/approvals/employer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: id,
          decision,
          reason,
          comments: reason,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setActionError(typeof body.error === "string" ? body.error : "Action failed.")
        return
      }
      router.push("/employer/discrepancies")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    await submitDecision("APPROVED")
  }

  async function handleDispute() {
    if (disputeReason.trim().length < 10) {
      setActionError("Please provide a reason of at least 10 characters.")
      return
    }
    await submitDecision("REJECTED", disputeReason.trim())
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    )
  }

  if (!caseData) {
    return <p className="text-sm text-gray-400">Loading…</p>
  }

  const fd = caseData.form_data ?? {}
  const field = fd.field_name as DiscrepancyField
  const isPending = caseData.status === "PENDING_EMPLOYER"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/employer/discrepancies" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#0D2137]">{caseData.reference}</h1>
          <p className="text-sm text-gray-500">Discrepancy Verification</p>
        </div>
        <StatusBadge status={caseData.status as CaseStatus} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0D2137]">Member</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><strong>Name:</strong> {caseData.member?.full_name ?? "—"}</p>
          <p><strong>National ID:</strong> {caseData.member?.national_id ?? "—"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0D2137]">Reported Discrepancy</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Field:</strong> {FIELD_LABELS[field] ?? String(fd.field_name)}</p>
          <p><strong>Correct information:</strong> {String(fd.correct_information ?? "—")}</p>
          <p><strong>Explanation:</strong> {String(fd.explanation ?? "—")}</p>
        </CardContent>
      </Card>

      {!isPending && (
        <Alert>
          <AlertDescription>
            This discrepancy is in <strong>{caseData.status.replace(/_/g, " ")}</strong> status and cannot be actioned.
          </AlertDescription>
        </Alert>
      )}

      {actionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {isPending && (
        <div className="space-y-4">
          {!showDisputeForm ? (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setShowDisputeForm(true)}
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Dispute
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleVerify}
                className="flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {loading ? "Verifying…" : "Verify"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800">Dispute Reason</h3>
              <div className="space-y-1">
                <Label htmlFor="dispute_reason">Explain why this discrepancy is incorrect</Label>
                <Textarea
                  id="dispute_reason"
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. Employment records show different information…"
                  className="bg-white"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowDisputeForm(false); setActionError(null) }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleDispute}
                  variant="destructive"
                >
                  {loading ? "Submitting…" : "Confirm Dispute"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
