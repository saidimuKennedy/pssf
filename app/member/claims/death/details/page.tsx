"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { LockedField } from "@/components/ui/locked-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"

export default function DeathDetailsPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [prefill, setPrefill] = useState<Record<string, string | null>>({})
  const [dateOfDeath, setDateOfDeath] = useState("")

  useEffect(() => {
    const raw = sessionStorage.getItem("death_prefill")
    if (raw) setPrefill(JSON.parse(raw))
    if (caseId) fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as Record<string, string> | undefined
      if (fd?.date_of_death) setDateOfDeath(fd.date_of_death)
    })
  }, [caseId])

  async function save() {
    if (!caseId || !dateOfDeath) return
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, ...prefill, date_of_death: dateOfDeath } }),
    })
    router.push(`/member/claims/death/claimants?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={2} />
      <h1 className="text-xl font-bold text-[#0D2137]">Deceased Member Details</h1>
      <div className="grid grid-cols-2 gap-4">
        <LockedField label="Full Name" value={prefill.full_name} />
        <LockedField label="Employer" value={prefill.employer_name} />
        <LockedField label="National ID" value={prefill.national_id} />
        <LockedField label="Member Number" value={prefill.member_number} />
        <LockedField label="Personal Number" value={prefill.personal_number} />
        <LockedField label="KRA PIN" value={prefill.kra_pin} />
      </div>
      <div><Label>Date of Death *</Label><Input type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} /></div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push(`/member/claims/death?case_id=${caseId}`)} className="flex-1">Back</Button>
        <Button onClick={save} disabled={!dateOfDeath} className="flex-1 bg-[#E11D48] text-white">Continue</Button>
      </div>
    </div>
  )
}
