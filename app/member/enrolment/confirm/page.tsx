"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { JourneyOtpForm } from "@/components/journey/journey-otp-form"

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]

export default function EnrolmentStep6Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start enrolment again.</AlertDescription>
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
        setError(body.error ?? "Submission failed. Please try again.")
        return
      }

      const data = await res.json()
      sessionStorage.removeItem("enrolment_prefill")
      router.push(`/member/enrolment/submitted?reference=${encodeURIComponent(data.reference ?? caseId)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={6} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Confirm Submission</h1>
        <p className="text-sm text-gray-500 mt-1">
          Verify your identity with a one-time code before submitting.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <JourneyOtpForm onVerified={submitCase} loading={loading} />

      <Button
        type="button"
        variant="outline"
        onClick={() => router.push(`/member/enrolment/preview?case_id=${caseId}`)}
        disabled={loading}
      >
        Back
      </Button>
    </div>
  )
}
