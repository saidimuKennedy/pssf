"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"

const DEV_OTP = "123456"

export default function DeathConfirmPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (process.env.NODE_ENV === "development" && otp !== DEV_OTP) { setError(`Use OTP ${DEV_OTP}`); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ declarationAccepted: true, otpVerified: true }) })
      if (!res.ok) { const b = await res.json(); setError(b.error); return }
      const data = await res.json()
      router.push(`/member/claims/death/submitted?reference=${encodeURIComponent(data.reference)}&status=${data.status}`)
    } finally { setLoading(false) }
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={11} />
      <h1 className="text-xl font-bold text-[#0D2137]">Confirm Submission</h1>
      <div><Label>OTP</Label><Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center font-mono text-xl" /></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button onClick={submit} disabled={loading || otp.length !== 6} className="w-full bg-[#E11D48] text-white">{loading ? "Submitting…" : "Submit Claim"}</Button>
    </div>
  )
}
