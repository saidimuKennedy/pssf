"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"
import { JourneyOtpForm } from "@/components/journey/journey-otp-form"

export default function DeathConfirmPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
        const b = await res.json()
        if (b.code === "OTP_REQUIRED") {
          setError("OTP verification expired. Please verify again.")
          return
        }
        setError(b.error ?? "Submission failed.")
        return
      }
      const data = await res.json()
      router.push(`/member/claims/death/submitted?reference=${encodeURIComponent(data.reference)}&status=${data.status}`)
    } finally {
      setLoading(false)
    }
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={11} />
      <h1 className="text-xl font-bold text-[#0D2137]">Confirm Submission</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <JourneyOtpForm onVerified={submitCase} loading={loading} submitLabel="Submit Claim" />
    </div>
  )
}
