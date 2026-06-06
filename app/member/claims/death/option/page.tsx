"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DeathBenefitOption } from "@prisma/client"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEATH_STEPS, DEATH_OPTION_TEXT } from "@/lib/death-benefits/journey"

export default function DeathOptionPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [selection, setSelection] = useState("")
  const [hasMinor, setHasMinor] = useState(false)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as Record<string, unknown>
      setHasMinor(Boolean(fd.has_minor_claimant))
      if (fd.benefit_option) setSelection(String(fd.benefit_option))
    })
  }, [caseId])

  const options = (Object.keys(DEATH_OPTION_TEXT) as DeathBenefitOption[]).filter(
    (k) => k !== "TRUST_FUND_MINORS" || hasMinor
  )

  async function save() {
    if (!selection) return
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, benefit_option: selection } }),
    })
    router.push(`/member/claims/death/payment?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={5} />
      <h1 className="text-xl font-bold text-[#0D2137]">Death Benefit Option</h1>
      <Alert><AlertDescription>M-Pesa payment is applicable for benefits below KES 500,000. Final amount is determined by PSSF after review.</AlertDescription></Alert>
      <RadioGroup value={selection} onValueChange={setSelection} className="space-y-3">
        {options.map((key) => (
          <div key={key} className="border rounded-lg p-4 flex gap-2">
            <RadioGroupItem value={key} id={key} />
            <Label htmlFor={key} className="cursor-pointer"><span className="font-medium">{DEATH_OPTION_TEXT[key].title}</span><p className="text-xs text-gray-500">{DEATH_OPTION_TEXT[key].description}</p></Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={save} disabled={!selection} className="w-full bg-[#E11D48] text-white">Continue</Button>
    </div>
  )
}
