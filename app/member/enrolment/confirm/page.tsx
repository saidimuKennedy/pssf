"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]
const DEV_OTP = "123456"

export default function EnrolmentStep6Page() {
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
          <AlertDescription>Invalid session. Please start enrolment again.</AlertDescription>
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
        const body = await res.json()
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
          Enter the 6-digit verification code sent to your registered mobile number.
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
          onClick={() => router.push(`/member/enrolment/preview?case_id=${caseId}`)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={loading || otp.length !== 6}
          onClick={handleSubmit}
          className="flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
        >
          {loading ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
    </div>
  )
}
