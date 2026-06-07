"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFICIARY_STEPS, getSkippedSteps } from "@/lib/beneficiaries/journey"
import { JourneyOtpForm } from "@/components/journey/journey-otp-form"

export default function BeneficiaryConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")
  const [hasMinor, setHasMinor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => {
        const fd = (data.form_data ?? {}) as Record<string, unknown>
        setHasMinor(Boolean(fd.has_minor_beneficiary))
      })
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

  async function submitCase() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationAccepted: true, otpVerified: true }),
      })

      if (!res.ok) {
        const body = await res.json()
        if (body.code === "OTP_REQUIRED") {
          setError("OTP verification expired. Please verify again.")
          return
        }
        if (body.code === "ALLOCATION_INVALID") {
          setError(`Beneficiary allocations must total exactly 100%. Current total: ${body.details?.total ?? "?"}%.`)
          return
        }
        setError(body.error ?? "Submission failed.")
        return
      }

      const data = await res.json()
      sessionStorage.removeItem("beneficiary_prefill")
      router.push(
        `/member/beneficiaries/submitted?reference=${encodeURIComponent(data.reference ?? caseId)}&status=${data.status ?? "UNDER_REVIEW"}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFICIARY_STEPS]} currentStep={9} skippedSteps={getSkippedSteps(hasMinor)} />
      <h1 className="text-xl font-bold text-[#0D2137]">Confirm Submission</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <JourneyOtpForm onVerified={submitCase} loading={loading} submitLabel="Submit Nomination" />
      <Button type="button" variant="outline" onClick={() => router.push(`/member/beneficiaries/preview?case_id=${caseId}`)} disabled={loading}>Back</Button>
    </div>
  )
}
