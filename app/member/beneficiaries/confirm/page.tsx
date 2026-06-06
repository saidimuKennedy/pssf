"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFICIARY_STEPS, getSkippedSteps } from "@/lib/beneficiaries/journey"

const DEV_OTP = "123456"

export default function BeneficiaryConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [otp, setOtp] = useState("")
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
        if (body.code === "ALLOCATION_INVALID") {
          const total = body.details?.total ?? "?"
          setError(`Beneficiary allocations must total exactly 100%. Current total: ${total}%.`)
          return
        }
        setError(body.error ?? "Submission failed. Please try again.")
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
      <StepIndicator
        steps={[...BENEFICIARY_STEPS]}
        currentStep={9}
        skippedSteps={getSkippedSteps(hasMinor)}
      />

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
          onClick={() => router.push(`/member/beneficiaries/preview?case_id=${caseId}`)}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={loading || otp.length !== 6}
          onClick={handleSubmit}
          className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
        >
          {loading ? "Submitting…" : "Submit Nomination"}
        </Button>
      </div>
    </div>
  )
}
