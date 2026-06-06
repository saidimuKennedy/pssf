"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AVC_STEPS, AVC_ACTION_LABELS, routingDestinationLabel } from "@/lib/avc/journey"

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-none gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value || "—"}</span>
    </div>
  )
}

export default function AVCPreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [formData, setFormData] = useState<Record<string, unknown> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => setFormData(data.form_data as Record<string, unknown>))
      .catch(() => setLoadError("Failed to load your application summary."))
  }, [caseId])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start your AVC request again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const str = (key: string) =>
    formData ? String(formData[key] ?? "") || null : null

  const action = formData?.avc_action as string | undefined
  const method = formData?.avc_method as string | undefined

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={5} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Review Your Application</h1>
        <p className="text-sm text-gray-500 mt-1">Please review all details before submitting.</p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        {routingDestinationLabel(method)}
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {!formData && !loadError && <p className="text-sm text-gray-400">Loading…</p>}

      {formData && (
        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Member</p>
          </div>
          <div className="px-4">
            <Row label="Full Name" value={str("full_name")} />
            <Row label="Employer" value={str("employer_name")} />
            <Row label="Mobile" value={str("mobile_number")} />
            <Row label="Email" value={str("email")} />
          </div>

          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">AVC Details</p>
          </div>
          <div className="px-4">
            <Row
              label="Action"
              value={action ? AVC_ACTION_LABELS[action as keyof typeof AVC_ACTION_LABELS] : null}
            />
            {formData.current_amount != null && (
              <Row
                label="Current Amount (KES)"
                value={Number(formData.current_amount).toLocaleString()}
              />
            )}
            {formData.new_amount != null && (
              <Row
                label={action === "NEW" ? "Monthly Amount (KES)" : "New Amount (KES)"}
                value={Number(formData.new_amount).toLocaleString()}
              />
            )}
            {formData.commencement_date != null && (
              <Row label="Commencement Date" value={str("commencement_date")} />
            )}
            {formData.effective_date != null && (
              <Row label="Effective Date" value={str("effective_date")} />
            )}
            <Row
              label="Method"
              value={method === "MOBILE_WALLET" ? "Mobile Wallet" : "Payroll Check-off"}
            />
            {method === "MOBILE_WALLET" && (
              <Row label="M-Pesa Number" value={str("mobile_wallet_number")} />
            )}
          </div>

          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Declaration</p>
          </div>
          <div className="px-4">
            <Row
              label="Statutory Declaration"
              value={formData.declaration_accepted === true ? "Accepted" : "Not accepted"}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/member/avc/declaration?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={!formData}
          onClick={() => router.push(`/member/avc/confirm?case_id=${caseId}`)}
          className="flex-1 bg-[#16A34A] hover:bg-[#145f3a] text-white"
        >
          Looks correct — Continue
        </Button>
      </div>
    </div>
  )
}
