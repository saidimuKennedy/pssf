"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFICIARY_STEPS, getSkippedSteps } from "@/lib/beneficiaries/journey"

interface PreviewRow {
  label: string
  value: string | null | undefined
}

function Row({ label, value }: PreviewRow) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-100 last:border-none gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value || "—"}</span>
    </div>
  )
}

interface Beneficiary {
  first_name: string
  middle_name: string | null
  surname: string
  relationship: string
  allocation_percent: string
  is_minor: boolean
}

export default function BeneficiaryPreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [formData, setFormData] = useState<Record<string, unknown> | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [documents, setDocuments] = useState<{ document_type: string; status: string }[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) return
    Promise.all([
      fetch(`/api/cases/${caseId}`).then((r) => r.json()),
      fetch(`/api/cases/${caseId}/beneficiaries`).then((r) => r.json()),
    ])
      .then(([caseData, benData]) => {
        setFormData(caseData.form_data as Record<string, unknown>)
        setBeneficiaries(benData.beneficiaries ?? [])
        setDocuments(caseData.documents ?? [])
      })
      .catch(() => setLoadError("Failed to load your application summary."))
  }, [caseId])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start nomination again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const str = (key: string) =>
    formData ? String(formData[key] ?? "") || null : null

  const hasMinor = Boolean(formData?.has_minor_beneficiary)

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator
        steps={[...BENEFICIARY_STEPS]}
        currentStep={8}
        skippedSteps={getSkippedSteps(hasMinor)}
      />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Review Your Nomination</h1>
        <p className="text-sm text-gray-500 mt-1">
          Please review all details before submitting.
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        This will be sent directly to PSSF for review — no employer confirmation step.
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
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Member Details</p>
          </div>
          <div className="px-4">
            <Row label="Full Name" value={str("full_name")} />
            <Row label="National ID" value={str("national_id")} />
            <Row label="Employer" value={str("employer_name")} />
            <Row label="Mobile" value={str("mobile_number")} />
            <Row label="Email" value={str("email")} />
          </div>

          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Beneficiaries</p>
          </div>
          <div className="px-4">
            {beneficiaries.map((b) => (
              <Row
                key={`${b.surname}-${b.first_name}`}
                label={`${b.first_name} ${b.surname}`}
                value={`${b.relationship} · ${Number(b.allocation_percent)}%${b.is_minor ? " (Minor)" : ""}`}
              />
            ))}
          </div>

          {hasMinor && (
            <>
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Guardian</p>
              </div>
              <div className="px-4">
                <Row label="Guardian Name" value={str("guardian_name")} />
                <Row label="Relationship" value={str("guardian_relationship")} />
                <Row label="Mobile" value={str("guardian_mobile")} />
                <Row
                  label="Minor Benefit Option"
                  value={
                    formData.minor_benefit_option === "TRUST"
                      ? "Option A — Trust"
                      : formData.minor_benefit_option === "GUARDIAN"
                        ? "Option B — Named Guardian"
                        : null
                  }
                />
              </div>
            </>
          )}

          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Documents</p>
          </div>
          <div className="px-4">
            {documents.map((d) => (
              <Row key={d.document_type} label={d.document_type.replace(/_/g, " ")} value={d.status} />
            ))}
            {documents.length === 0 && <Row label="Documents" value="None uploaded" />}
          </div>

          <div className="px-4 py-3 bg-gray-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Witness</p>
          </div>
          <div className="px-4">
            <Row label="Witnessed By" value={str("witnessed_by")} />
            <Row label="Witness ID" value={str("witness_id_number")} />
            <Row label="Witness Date" value={str("witness_date")} />
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
          onClick={() => router.push(`/member/beneficiaries/declaration?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={!formData}
          onClick={() => router.push(`/member/beneficiaries/confirm?case_id=${caseId}`)}
          className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
        >
          Looks correct — Continue
        </Button>
      </div>
    </div>
  )
}
