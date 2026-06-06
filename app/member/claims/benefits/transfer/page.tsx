"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFITS_STEPS, getBenefitsSkippedSteps } from "@/lib/benefits/journey"
import { TransferSchemeSchema } from "@/lib/validations/benefits"

export default function BenefitsTransferPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [form, setForm] = useState({
    transfer_scheme_name: "", transfer_scheme_administrator: "", transfer_scheme_account_name: "",
    transfer_scheme_account_number: "", transfer_scheme_bank: "", transfer_scheme_branch: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as Record<string, unknown>
      setFormData(fd)
      if (!fd.transfer_to_registered_scheme) router.replace(`/member/claims/benefits/summary?case_id=${caseId}`)
      setForm({
        transfer_scheme_name: String(fd.transfer_scheme_name ?? ""),
        transfer_scheme_administrator: String(fd.transfer_scheme_administrator ?? ""),
        transfer_scheme_account_name: String(fd.transfer_scheme_account_name ?? ""),
        transfer_scheme_account_number: String(fd.transfer_scheme_account_number ?? ""),
        transfer_scheme_bank: String(fd.transfer_scheme_bank ?? ""),
        transfer_scheme_branch: String(fd.transfer_scheme_branch ?? ""),
      })
    })
  }, [caseId, router])

  async function save() {
    const parsed = TransferSchemeSchema.safeParse(form)
    if (!parsed.success) {
      setError("All six transfer scheme fields are required.")
      return
    }
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, ...form } }),
    })
    router.push(`/member/claims/benefits/summary?case_id=${caseId}`)
  }

  if (!caseId) return null
  const field = (k: keyof typeof form, label: string) => (
    <div key={k}><Label>{label} *</Label><Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
  )
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={6} skippedSteps={getBenefitsSkippedSteps(formData)} />
      <h1 className="text-xl font-bold text-[#0D2137]">Transfer Scheme Details</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-3">
        {field("transfer_scheme_name", "Scheme Name")}
        {field("transfer_scheme_administrator", "Administrator")}
        {field("transfer_scheme_account_name", "Account Name")}
        {field("transfer_scheme_account_number", "Account Number")}
        {field("transfer_scheme_bank", "Bank")}
        {field("transfer_scheme_branch", "Branch")}
      </div>
      <Button onClick={save} className="w-full bg-[#7C3AED] text-white">Continue</Button>
    </div>
  )
}
