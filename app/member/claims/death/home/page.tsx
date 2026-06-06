"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"
import { HomeParticularsSchema } from "@/lib/validations/death-benefits"

export default function DeathHomePage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [form, setForm] = useState({ county: "", subcounty: "", location: "", sublocation: "", village: "", chief_name: "" })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as Record<string, string>
      setForm({
        county: fd.county ?? "", subcounty: fd.subcounty ?? "", location: fd.location ?? "",
        sublocation: fd.sublocation ?? "", village: fd.village ?? "", chief_name: fd.chief_name ?? "",
      })
    })
  }, [caseId])

  async function save() {
    const parsed = HomeParticularsSchema.safeParse(form)
    if (!parsed.success) { setError("All home particulars fields are required."); return }
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, ...form } }),
    })
    router.push(`/member/claims/death/option?case_id=${caseId}`)
  }

  if (!caseId) return null
  const field = (k: keyof typeof form, label: string) => (
    <div key={k}><Label>{label} *</Label><Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></div>
  )
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={4} />
      <h1 className="text-xl font-bold text-[#0D2137]">Home Particulars</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="space-y-3">
        {field("county", "County")}{field("subcounty", "Subcounty")}{field("location", "Location")}
        {field("sublocation", "Sublocation")}{field("village", "Village")}{field("chief_name", "Chief's Name")}
      </div>
      <Button onClick={save} className="w-full bg-[#E11D48] text-white">Continue</Button>
    </div>
  )
}
