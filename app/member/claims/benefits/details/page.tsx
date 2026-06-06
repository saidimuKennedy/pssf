"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { LockedField } from "@/components/ui/locked-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BENEFITS_STEPS } from "@/lib/benefits/journey"

function joinedAt45Plus(dob: string, joined: string | null): boolean {
  if (!joined) return false
  const age = (new Date(joined).getTime() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)
  return age >= 45
}

export default function BenefitsDetailsPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [prefill, setPrefill] = useState<Record<string, string | null>>({})
  const [form, setForm] = useState({ bank_account_number: "", bank_name: "", bank_branch: "", mobile_number: "", email: "", postal_address: "" })

  useEffect(() => {
    const raw = sessionStorage.getItem("benefits_prefill")
    if (raw) setPrefill(JSON.parse(raw))
    if (caseId) fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as Record<string, string>
      setForm((f) => ({ ...f, ...fd }))
    })
  }, [caseId])

  async function save() {
    if (!caseId) return
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data as Record<string, unknown>
    const dob = String(prefill.date_of_birth ?? existing.date_of_birth ?? "")
    const joined = String(prefill.date_joined_scheme ?? existing.date_joined_scheme ?? "")
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: {
          ...existing,
          ...prefill,
          ...form,
          joined_at_45_plus: joinedAt45Plus(dob, joined || null),
        },
      }),
    })
    router.push(`/member/claims/benefits/payment?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={2} />
      <h1 className="text-xl font-bold text-[#0D2137]">Your Particulars</h1>
      <div className="grid grid-cols-2 gap-4">
        <LockedField label="Full Name" value={prefill.full_name} />
        <LockedField label="Employer" value={prefill.employer_name} />
        <LockedField label="Personal Number" value={prefill.personal_number} />
        <LockedField label="National ID" value={prefill.national_id} />
        <LockedField label="KRA PIN" value={prefill.kra_pin} />
        <LockedField label="Date of Birth" value={prefill.date_of_birth} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Bank Account</Label><Input value={form.bank_account_number} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} /></div>
        <div><Label>Bank Name</Label><Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} /></div>
        <div><Label>Branch</Label><Input value={form.bank_branch} onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} /></div>
        <div><Label>Mobile</Label><Input value={form.mobile_number} onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} /></div>
        <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><Label>Address</Label><Input value={form.postal_address} onChange={(e) => setForm({ ...form, postal_address: e.target.value })} /></div>
      </div>
      <Button onClick={save} className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white w-full">Continue</Button>
    </div>
  )
}
