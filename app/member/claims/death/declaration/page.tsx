"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"
import type { DeathClaimant } from "@/lib/validations/death-benefits"


export default function DeathDeclarationPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [claimants, setClaimants] = useState<DeathClaimant[]>([])
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({})
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      setClaimants((d.form_data as { claimants: DeathClaimant[] }).claimants ?? [])
    })
  }, [caseId])

  async function save() {
    if (claimants.some((_, i) => !confirmed[i])) { setError("Each claimant must confirm the declaration."); return }

    const updated = claimants.map((c) => ({ ...c, declaration_confirmed: true }))
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, claimants: updated, declaration_accepted: true } }),
    })
    router.push(`/member/claims/death/preview?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={9} />
      <h1 className="text-xl font-bold text-[#0D2137]">Declaration</h1>
      <div className="text-sm space-y-2 bg-gray-50 p-4 rounded border">
        <p>Trustees have final discretion over death benefit payments.</p>
        <p>Payment details provided are correct to the best of my knowledge.</p>
        <p>The information in this claim is true and correct.</p>
        <p>I understand false statements may result in prosecution.</p>
      </div>
      {claimants.map((c, i) => (
        <div key={i} className="flex gap-2 items-center border p-3 rounded">
          <Checkbox checked={confirmed[i] ?? false} onCheckedChange={(v) => setConfirmed({ ...confirmed, [i]: Boolean(v) })} id={`c${i}`} />
          <Label htmlFor={`c${i}`}>{c.name} confirms the declaration</Label>
        </div>
      ))}
      <div><Label>OTP (sent to primary claimant mobile)</Label><Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className="text-center font-mono" /></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button onClick={save} className="w-full bg-[#E11D48] text-white">Continue</Button>
    </div>
  )
}
