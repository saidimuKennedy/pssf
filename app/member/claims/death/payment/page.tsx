"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"
import type { DeathClaimant } from "@/lib/validations/death-benefits"

export default function DeathPaymentPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [claimants, setClaimants] = useState<DeathClaimant[]>([])

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      setClaimants((d.form_data as { claimants?: DeathClaimant[] } | undefined)?.claimants ?? [])
    })
  }, [caseId])

  function update(i: number, patch: Partial<DeathClaimant>) {
    setClaimants((list) => list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }

  async function save() {
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, claimants } }),
    })
    router.push(`/member/claims/death/documents?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={6} />
      <h1 className="text-xl font-bold text-[#0D2137]">Payment Details per Claimant</h1>
      <Alert><AlertDescription>M-Pesa is applicable for benefits below KES 500,000 (informational only).</AlertDescription></Alert>
      {claimants.map((c, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <p className="font-medium">{c.name}</p>
          <div><Label>Bank Account</Label><Input value={c.bank_account_number ?? ""} onChange={(e) => update(i, { bank_account_number: e.target.value })} /></div>
          <div><Label>Bank Name</Label><Input value={c.bank_name ?? ""} onChange={(e) => update(i, { bank_name: e.target.value })} /></div>
          <div><Label>Branch</Label><Input value={c.bank_branch ?? ""} onChange={(e) => update(i, { bank_branch: e.target.value })} /></div>
          <div><Label>M-Pesa (optional)</Label><Input value={c.mpesa_number ?? ""} onChange={(e) => update(i, { mpesa_number: e.target.value })} placeholder="+2547..." /></div>
        </div>
      ))}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push(`/member/claims/death/option?case_id=${caseId}`)} className="flex-1">Back</Button>
        <Button onClick={save} className="flex-1 bg-[#E11D48] text-white">Continue</Button>
      </div>
    </div>
  )
}
