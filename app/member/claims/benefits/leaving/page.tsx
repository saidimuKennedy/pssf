"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BENEFITS_STEPS, nextAfterLeaving } from "@/lib/benefits/journey"

const REASONS = [
  "NORMAL_RETIREMENT", "EARLY_RETIREMENT", "RULE_12_16_20",
  "RESIGNATION", "TERMINATION", "EMIGRATION", "OTHER",
]

export default function BenefitsLeavingPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [date, setDate] = useState("")
  const [reason, setReason] = useState("")

  async function save() {
    if (!caseId || !date || !reason) return
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, date_of_leaving: date, reason_for_leaving: reason } }),
    })
    router.push(nextAfterLeaving(caseId, reason))
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={4} />
      <h1 className="text-xl font-bold text-[#0D2137]">Leaving Employment</h1>
      <div><Label>Date of Leaving *</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <div><Label>Reason *</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
          <SelectContent>{REASONS.map((r) => <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Button onClick={save} disabled={!date || !reason} className="w-full bg-[#7C3AED] text-white">Continue</Button>
    </div>
  )
}
