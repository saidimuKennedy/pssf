"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFITS_STEPS } from "@/lib/benefits/journey"

const DEV_OTP = "123456"

export default function BenefitsDeclarationPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [accepted, setAccepted] = useState(false)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!accepted) { setError("Accept the declaration."); return }
    if (process.env.NODE_ENV === "development" && otp !== DEV_OTP) { setError(`Use OTP ${DEV_OTP}`); return }
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formData: { ...existing, declaration_accepted: true } }) })
    router.push(`/member/claims/benefits/preview?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={9} />
      <h1 className="text-xl font-bold text-[#0D2137]">Declaration</h1>
      <div className="text-sm space-y-2 bg-gray-50 p-4 rounded border">
        <p>Trustees have final discretion over benefit payments.</p>
        <p>My bank and M-Pesa details are correct.</p>
        <p>PSSF is not responsible for wrong payment details I provide.</p>
        <p>The information in this claim is true and correct.</p>
      </div>
      <div className="flex gap-2"><Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(Boolean(v))} id="d" /><Label htmlFor="d">I accept the declaration</Label></div>
      <div><Label>OTP</Label><Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center font-mono" /></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button onClick={save} className="w-full bg-[#7C3AED] text-white">Continue</Button>
    </div>
  )
}
