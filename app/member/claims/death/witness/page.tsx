"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"

export default function DeathWitnessPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [form, setForm] = useState({ witness_name: "", witness_id: "", witness_signature: "", witness_date: "" })

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = (d.form_data ?? {}) as Record<string, string>
      setForm({
        witness_name: fd.witness_name ?? "",
        witness_id: fd.witness_id ?? "",
        witness_signature: fd.witness_signature ?? "",
        witness_date: fd.witness_date ?? "",
      })
    })
  }, [caseId])

  async function save() {
    if (!form.witness_name || !form.witness_id || !form.witness_signature || !form.witness_date) return
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, ...form } }),
    })
    router.push(`/member/claims/death/declaration?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={8} />
      <h1 className="text-xl font-bold text-[#0D2137]">Witness Details</h1>
      <div className="space-y-3">
        <div><Label>Full Name *</Label><Input value={form.witness_name} onChange={(e) => setForm({ ...form, witness_name: e.target.value })} /></div>
        <div><Label>ID Number *</Label><Input value={form.witness_id} onChange={(e) => setForm({ ...form, witness_id: e.target.value })} /></div>
        <div><Label>Signature (type full name) *</Label><Input value={form.witness_signature} onChange={(e) => setForm({ ...form, witness_signature: e.target.value })} /></div>
        <div><Label>Date *</Label><Input type="date" value={form.witness_date} onChange={(e) => setForm({ ...form, witness_date: e.target.value })} /></div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push(`/member/claims/death/documents?case_id=${caseId}`)} className="flex-1">Back</Button>
        <Button onClick={save} className="flex-1 bg-[#E11D48] text-white">Continue</Button>
      </div>
    </div>
  )
}
