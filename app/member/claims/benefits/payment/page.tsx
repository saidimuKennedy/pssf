"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFITS_STEPS } from "@/lib/benefits/journey"

export default function BenefitsPaymentPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [form, setForm] = useState({ bank_account_number: "", bank_name: "", bank_branch: "", mpesa_number: "" })
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as Record<string, string>
      setForm({
        bank_account_number: fd.bank_account_number ?? "",
        bank_name: fd.bank_name ?? "",
        bank_branch: fd.bank_branch ?? "",
        mpesa_number: fd.mpesa_number ?? "",
      })
    })
  }, [caseId])

  async function save() {
    if (!form.bank_account_number || !form.bank_name || !form.bank_branch) {
      setError("All bank fields are required.")
      return
    }
    if (!confirmed) {
      setError("You must confirm your payment details are correct.")
      return
    }
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, ...form, payment_confirmed: true } }),
    })
    router.push(`/member/claims/benefits/leaving?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={3} />
      <h1 className="text-xl font-bold text-[#0D2137]">Payment Details</h1>
      <Alert><AlertDescription>PSSF is not responsible for incorrect payment details you provide.</AlertDescription></Alert>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-3">
        <div><Label>Bank Account Number *</Label><Input value={form.bank_account_number} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} /></div>
        <div><Label>Bank Name *</Label><Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} /></div>
        <div><Label>Branch *</Label><Input value={form.bank_branch} onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} /></div>
        <div><Label>M-Pesa (optional)</Label><Input value={form.mpesa_number} onChange={(e) => setForm({ ...form, mpesa_number: e.target.value })} placeholder="+2547..." /></div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(Boolean(v))} id="pay" />
        <Label htmlFor="pay">I confirm these payment details are correct</Label>
      </div>
      <Button onClick={save} className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white">Continue</Button>
    </div>
  )
}
