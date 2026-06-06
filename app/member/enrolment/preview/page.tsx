"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]

interface PreviewRow {
  label: string
  value: string | null | undefined
}

function Row({ label, value }: PreviewRow) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-none">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || "—"}</span>
    </div>
  )
}

export default function EnrolmentStep5Page() {
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
          <AlertDescription>Invalid session. Please start enrolment again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const str = (key: string) =>
    formData ? String(formData[key] ?? "") || null : null

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={5} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Review Your Application</h1>
        <p className="text-sm text-gray-500 mt-1">
          Please review all details below before submitting.
        </p>
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {!formData && !loadError && (
        <p className="text-sm text-gray-400">Loading…</p>
      )}

      {formData && (
        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Personal Details</p>
          </div>
          <div className="px-4">
            <Row label="Full Name" value={str("full_name")} />
            <Row label="National ID" value={str("national_id")} />
            <Row label="Date of Birth" value={str("date_of_birth")} />
            <Row label="KRA PIN" value={str("kra_pin")} />
          </div>

          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</p>
          </div>
          <div className="px-4">
            <Row label="Mobile Number" value={str("mobile_number")} />
            <Row label="Email" value={str("email")} />
            <Row label="Postal Address" value={str("postal_address")} />
            <Row label="Postal Code" value={str("postal_code")} />
            <Row label="Town / City" value={str("town")} />
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
          onClick={() => router.push(`/member/enrolment/declaration?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={!formData}
          onClick={() => router.push(`/member/enrolment/confirm?case_id=${caseId}`)}
          className="flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
        >
          Looks correct — Continue
        </Button>
      </div>
    </div>
  )
}
