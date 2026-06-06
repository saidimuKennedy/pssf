"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { DEATH_STEPS, DEATH_OPTION_TEXT } from "@/lib/death-benefits/journey"
import type { DeathClaimant } from "@/lib/validations/death-benefits"

export default function DeathPreviewPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [fd, setFd] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (caseId) fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => setFd(d.form_data as Record<string, unknown>))
  }, [caseId])

  if (!caseId) return null
  const opt = fd.benefit_option as string | undefined
  const claimants = (fd.claimants as DeathClaimant[]) ?? []
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={10} />
      <h1 className="text-xl font-bold text-[#0D2137]">Review Claim</h1>
      <div className="border rounded p-4 text-sm space-y-2">
        <p><strong>Deceased:</strong> {String(fd.full_name)}</p>
        <p><strong>Date of death:</strong> {String(fd.date_of_death)}</p>
        <p><strong>Home:</strong> {String(fd.county)}, {String(fd.village)}</p>
        {opt && <p><strong>Option:</strong> {DEATH_OPTION_TEXT[opt]?.title}</p>}
        <p><strong>Claimants:</strong> {claimants.map((c) => c.name).join(", ")}</p>
        <p><strong>Witness:</strong> {String(fd.witness_name)}</p>
      </div>
      <Button onClick={() => router.push(`/member/claims/death/confirm?case_id=${caseId}`)} className="w-full bg-[#E11D48] text-white">Continue to Submit</Button>
    </div>
  )
}
