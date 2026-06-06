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
import { Input } from "@/components/ui/input"
import { AVC_ACTION_LABELS } from "@/lib/avc/journey"

interface CaseData {
  id: string
  reference: string
  type: string
  status: string
  form_data: Record<string, unknown>
  member?: {
    full_name: string
    national_id: string
    member_number: string | null
    employer_name: string | null
  }
  created_at: string
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-none">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || "—"}</span>
    </div>
  )
}

export default function EmployerApprovalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [officerName, setOfficerName] = useState("")
  const [designation, setDesignation] = useState("")
  const [effectivePayrollMonth, setEffectivePayrollMonth] = useState("")

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((data) => setCaseData(data as CaseData))
      .catch(() => setLoadError("Failed to load case details."))
  }, [id])

  async function handleApprove() {
    if (caseData?.type === "AVC") {
      if (!officerName.trim() || !designation.trim() || !effectivePayrollMonth) {
        setActionError("Please complete all AVC confirmation fields before approving.")
        return
      }
    }
    setActionError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${id}/employer-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_name: officerName.trim() || undefined,
          designation: designation.trim() || undefined,
          effective_payroll_month: effectivePayrollMonth || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setActionError(body.error ?? "Approval failed.")
        return
      }
      router.push("/employer/approvals")
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 10) {
      setActionError("Please provide a reason of at least 10 characters.")
      return
    }
    setActionError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${id}/employer-reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!res.ok) {
        const body = await res.json()
        setActionError(body.error ?? "Rejection failed.")
        return
      }
      router.push("/employer/approvals")
    } finally {
      setLoading(false)
    }
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
  const str = (k: string) => (fd[k] != null && fd[k] !== "" ? String(fd[k]) : null)
  const isPending = caseData.status === "PENDING_EMPLOYER"
  const isAVC = caseData.type === "AVC"

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/employer/approvals" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#0D2137]">{caseData.reference}</h1>
          <p className="text-sm text-gray-500">{caseData.type.replace(/_/g, " ")}</p>
        </div>
      </div>

      {/* Member details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0D2137]">Member Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Full Name" value={caseData.member?.full_name} />
          <Row label="National ID" value={caseData.member?.national_id} />
          <Row label="Member Number" value={caseData.member?.member_number} />
        </CardContent>
      </Card>

      {/* Application form data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0D2137]">Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isAVC ? (
            <>
              <Row
                label="AVC Action"
                value={
                  fd.avc_action
                    ? AVC_ACTION_LABELS[fd.avc_action as keyof typeof AVC_ACTION_LABELS]
                    : null
                }
              />
              {fd.new_amount != null && (
                <Row label="Amount (KES)" value={Number(fd.new_amount).toLocaleString()} />
              )}
              {fd.current_amount != null && (
                <Row label="Current Amount (KES)" value={Number(fd.current_amount).toLocaleString()} />
              )}
              <Row label="Commencement Date" value={str("commencement_date")} />
              <Row label="Effective Date" value={str("effective_date")} />
              <Row
                label="Method"
                value={fd.avc_method === "MOBILE_WALLET" ? "Mobile Wallet" : "Payroll Check-off"}
              />
            </>
          ) : (
            <>
              <Row label="Date of Birth" value={str("date_of_birth")} />
              <Row label="Mobile Number" value={str("mobile_number")} />
              <Row label="Email" value={str("email")} />
              <Row label="Postal Address" value={str("postal_address")} />
              <Row label="Town" value={str("town")} />
              <Row label="KRA PIN" value={str("kra_pin")} />
            </>
          )}
          <Row
            label="Declaration"
            value={fd.declaration_accepted === true ? "Accepted" : "Not accepted"}
          />
          <Row label="Submitted" value={new Date(caseData.created_at).toLocaleDateString()} />
        </CardContent>
      </Card>

      {isPending && isAVC && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#0D2137]">AVC Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Confirm the effective payroll month and your officer details.
            </p>
            <div className="space-y-1">
              <Label htmlFor="effective_month">Effective Payroll Month</Label>
              <Input
                id="effective_month"
                type="month"
                value={effectivePayrollMonth}
                onChange={(e) => setEffectivePayrollMonth(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="officer_name">Authorised Official Name</Label>
              <Input
                id="officer_name"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. HR Manager"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      {!isPending && (
        <Alert>
          <AlertDescription>
            This case is in <strong>{caseData.status.replace(/_/g, " ")}</strong> status and cannot be actioned.
          </AlertDescription>
        </Alert>
      )}

      {/* Action error */}
      {actionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      {isPending && (
        <div className="space-y-4">
          {!showRejectForm ? (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setShowRejectForm(true)}
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={handleApprove}
                className="flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {loading ? "Approving…" : "Approve"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800">Rejection Reason</h3>
              <div className="space-y-1">
                <Label htmlFor="reason" className="text-sm">
                  Please provide a clear reason for rejection
                </Label>
                <Textarea
                  id="reason"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Employment records do not match…"
                  className="bg-white"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowRejectForm(false); setActionError(null) }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleReject}
                  variant="destructive"
                >
                  {loading ? "Rejecting…" : "Confirm Rejection"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
