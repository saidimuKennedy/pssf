"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CaseTimeline, type TimelineEntry } from "@/components/ui/case-timeline"
import { FileUploadSlot } from "@/components/ui/file-upload-slot"
import { StatusBadge, CASE_TYPE_LABELS } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CaseStatus } from "@prisma/client"

type DocumentStatus = "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED"

interface CaseDocument {
  id: string
  document_type: string
  status: DocumentStatus
  file_name: string | null
  rejection_reason: string | null
  is_required: boolean
}

interface CaseNotification {
  id: string
  payload: { message?: string }
  is_read: boolean
  created_at: string
}

interface CaseDetail {
  id: string
  reference: string
  type: string
  status: CaseStatus
  form_data: Record<string, unknown>
  status_history: TimelineEntry[]
  documents: CaseDocument[]
  notifications: CaseNotification[]
  beneficiaries: {
    first_name: string
    surname: string
    relationship: string
    allocation_percent: string
    is_minor: boolean
  }[]
}

const DOC_LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID",
  BIRTH_CERTIFICATE: "Birth Certificate",
  GUARDIAN_ID: "Guardian ID",
  EXIT_LETTER: "Exit Letter",
  ATM_CARD: "ATM Card",
  KRA_PIN: "KRA PIN Certificate",
}

export default function MemberCaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string

  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [submittingInfo, setSubmittingInfo] = useState(false)
  const [infoError, setInfoError] = useState<string | null>(null)
  const [infoSuccess, setInfoSuccess] = useState(false)

  const loadCase = useCallback(async () => {
    const res = await fetch(`/api/cases/${caseId}`)
    if (!res.ok) {
      setLoadError("Case not found or you do not have access.")
      return
    }
    const data = await res.json()
    setCaseData(data)
  }, [caseId])

  useEffect(() => {
    loadCase()
  }, [loadCase])

  async function handleSubmitAdditionalInfo() {
    if (!additionalInfo.trim()) return
    setSubmittingInfo(true)
    setInfoError(null)
    setInfoSuccess(false)
    try {
      const res = await fetch(`/api/cases/${caseId}/additional-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: { message: additionalInfo } }),
      })
      if (!res.ok) {
        setInfoError("Failed to submit your response. Please try again.")
        return
      }
      setInfoSuccess(true)
      setAdditionalInfo("")
      await loadCase()
    } finally {
      setSubmittingInfo(false)
    }
  }

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!caseData) {
    return <p className="text-sm text-gray-400">Loading…</p>
  }

  const formData = caseData.form_data ?? {}
  const moreInfoRequest = formData.info_requested as string | undefined

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/member/requests"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to requests
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D2137]">{caseData.reference}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {CASE_TYPE_LABELS[caseData.type] ?? caseData.type}
          </p>
        </div>
        <StatusBadge status={caseData.status} />
      </div>

      {/* Status timeline */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Status Timeline
        </h2>
        <CaseTimeline statusHistory={caseData.status_history} />
      </section>

      {/* Beneficiaries (if nomination case) */}
      {caseData.beneficiaries?.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Beneficiaries
          </h2>
          <div className="space-y-2">
            {caseData.beneficiaries.map((b) => (
              <div key={`${b.surname}-${b.first_name}`} className="flex justify-between text-sm">
                <span>
                  {b.first_name} {b.surname} ({b.relationship})
                  {b.is_minor ? " · Minor" : ""}
                </span>
                <span className="font-medium">{Number(b.allocation_percent)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      <section className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Documents
        </h2>
        {caseData.documents.length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded.</p>
        ) : (
          caseData.documents.map((doc) => (
            <FileUploadSlot
              key={doc.id}
              documentType={doc.document_type}
              label={DOC_LABELS[doc.document_type] ?? doc.document_type.replace(/_/g, " ")}
              required={doc.is_required}
              caseId={caseId}
              currentStatus={doc.status}
              currentFileName={doc.file_name}
              rejectionReason={doc.rejection_reason}
              onUploadSuccess={() => loadCase()}
            />
          ))
        )}
      </section>

      {/* Additional info */}
      {caseData.status === CaseStatus.MORE_INFO_REQUIRED && (
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
            Additional Information Required
          </h2>
          {moreInfoRequest && (
            <p className="text-sm text-blue-700">{moreInfoRequest}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="additional_info">Your Response</Label>
            <Textarea
              id="additional_info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Provide the requested information…"
              rows={4}
            />
          </div>
          {infoError && (
            <Alert variant="destructive">
              <AlertDescription>{infoError}</AlertDescription>
            </Alert>
          )}
          {infoSuccess && (
            <Alert>
              <AlertDescription>Your response has been submitted.</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleSubmitAdditionalInfo}
            disabled={submittingInfo || !additionalInfo.trim()}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
          >
            {submittingInfo ? "Submitting…" : "Submit Response"}
          </Button>
        </section>
      )}

      {/* Notifications */}
      {caseData.notifications?.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Notifications
          </h2>
          <div className="space-y-3">
            {caseData.notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-md text-sm ${
                  n.is_read ? "bg-gray-50 text-gray-600" : "bg-blue-50 text-gray-800 border border-blue-100"
                }`}
              >
                <p>{n.payload?.message ?? "Notification"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
