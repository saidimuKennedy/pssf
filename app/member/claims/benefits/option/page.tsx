"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BENEFITS_STEPS, BENEFIT_OPTION_TEXT, getBenefitsSkippedSteps, isRetirementReason, nextAfterOption } from "@/lib/benefits/journey"

export default function BenefitsOptionPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [reason, setReason] = useState("")
  const [selection, setSelection] = useState("")

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as Record<string, unknown>
      setReason(String(fd.reason_for_leaving ?? ""))
      if (!isRetirementReason(String(fd.reason_for_leaving))) {
        router.replace(`/member/claims/benefits/summary?case_id=${caseId}`)
      }
    })
  }, [caseId, router])

  async function save() {
    if (!caseId || !selection) return
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    const transfer = selection === "TRANSFER"
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: {
          ...existing,
          benefit_option: transfer ? undefined : selection,
          transfer_to_registered_scheme: transfer,
        },
      }),
    })
    router.push(nextAfterOption(caseId, transfer))
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={5} skippedSteps={getBenefitsSkippedSteps({ reason_for_leaving: reason })} />
      <h1 className="text-xl font-bold text-[#0D2137]">Benefit Option</h1>
      <RadioGroup value={selection} onValueChange={setSelection} className="space-y-3">
        {Object.entries(BENEFIT_OPTION_TEXT).map(([key, { title, description }]) => (
          <div key={key} className="border rounded-lg p-4 flex gap-2">
            <RadioGroupItem value={key} id={key} />
            <Label htmlFor={key} className="cursor-pointer"><span className="font-medium">{title}</span><p className="text-xs text-gray-500">{description}</p></Label>
          </div>
        ))}
        <div className="border rounded-lg p-4 flex gap-2">
          <RadioGroupItem value="TRANSFER" id="transfer" />
          <Label htmlFor="transfer" className="cursor-pointer"><span className="font-medium">Transfer to another registered scheme</span></Label>
        </div>
      </RadioGroup>
      <Button onClick={save} disabled={!selection} className="w-full bg-[#7C3AED] text-white">Continue</Button>
    </div>
  )
}
