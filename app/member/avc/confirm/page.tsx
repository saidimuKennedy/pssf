"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AVC_STEPS } from "@/lib/avc/journey"

const DEV_OTP = "123456"

export default function AVCConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [otp, setOtp] = useState("")
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

  async function handleSubmit() {
    setError(null)

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit code sent to your phone.")
      return
    }

    if (process.env.NODE_ENV === "development" && otp !== DEV_OTP) {
      setError(`In development, use OTP: ${DEV_OTP}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationAccepted: true, otpVerified: true }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          setError("Your session has expired. Please log in again to continue.")
          router.push("/login")
          return
        }
        const body = await res.json()
        setError(body.error ?? "Submission failed. Please try again.")
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

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Confirm Submission</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter the 6-digit verification code to submit your AVC application.
        </p>
      </div>

      {process.env.NODE_ENV === "development" && (
        <Alert>
          <AlertDescription>
            Development mode — use OTP: <strong>{DEV_OTP}</strong>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="otp">Verification Code</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-widest font-mono"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/member/avc/preview?case_id=${caseId}`)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={loading || otp.length !== 6}
          onClick={handleSubmit}
          className="flex-1 bg-[#16A34A] hover:bg-[#145f3a] text-white"
        >
          {loading ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
    </div>
  )
}
