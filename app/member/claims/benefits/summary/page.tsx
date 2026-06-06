"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { BENEFITS_STEPS, getBenefitsSkippedSteps } from "@/lib/benefits/journey"

export default function BenefitsSummaryPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  useEffect(() => {
    fetch("/api/member/contributions?period=LAST_24").then((r) => r.json()).then(setData)
    if (caseId) fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => setFormData(d.form_data as Record<string, unknown>))
  }, [caseId])

  if (!caseId) return null
  const s = data?.summary as Record<string, number> | undefined
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={7} skippedSteps={getBenefitsSkippedSteps(formData)} />
      <h1 className="text-xl font-bold text-[#0D2137]">Contribution Summary</h1>
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">Indicative only — final settlement subject to PSSF calculation.</p>
      {s && (
        <div className="border rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Employee contributions</span><span>KES {s.total_employee?.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Employer contributions</span><span>KES {s.total_employer?.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Interest earned</span><span>KES {s.interest_earned?.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold"><span>Total balance</span><span>KES {s.total_balance?.toLocaleString()}</span></div>
        </div>
      )}
      <Button onClick={() => router.push(`/member/claims/benefits/documents?case_id=${caseId}`)} className="w-full bg-[#7C3AED] text-white">Continue</Button>
    </div>
  )
}
