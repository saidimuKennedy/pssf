"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AVC_STEPS } from "@/lib/avc/journey"
import { JourneyOtpForm } from "@/components/journey/journey-otp-form"

export default function AVCConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start your AVC request again.</AlertDescription>
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
        setError(body.error ?? "Submission failed.")
        return
      }

      const data = await res.json()
      sessionStorage.removeItem("avc_prefill")
      const caseRes = await fetch(`/api/cases/${caseId}`)
      const caseData = await caseRes.json()
      const method = (caseData.form_data as Record<string, unknown>)?.avc_method
      router.push(
        `/member/avc/submitted?reference=${encodeURIComponent(data.reference ?? caseId)}&status=${data.status ?? "SUBMITTED"}&method=${method ?? "PAYROLL"}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={6} />
      <h1 className="text-xl font-bold text-[#0D2137]">Confirm Submission</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <JourneyOtpForm onVerified={submitCase} loading={loading} />
      <Button type="button" variant="outline" onClick={() => router.push(`/member/avc/preview?case_id=${caseId}`)} disabled={loading}>Back</Button>
    </div>
  )
}
