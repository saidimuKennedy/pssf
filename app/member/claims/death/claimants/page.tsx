"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2 } from "lucide-react"
import { DEATH_STEPS, syncClaimantFlags } from "@/lib/death-benefits/journey"
import { DeathClaimantSchema, type DeathClaimant } from "@/lib/validations/death-benefits"

const empty: DeathClaimant = {
  name: "", relationship: "", mobile_number: "+2547", is_minor: false,
}

export default function DeathClaimantsPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [claimants, setClaimants] = useState<DeathClaimant[]>([{ ...empty }])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      const fd = d.form_data as { claimants?: DeathClaimant[] } | undefined
      if (fd?.claimants?.length) setClaimants(fd.claimants)
    })
  }, [caseId])

  function update(i: number, patch: Partial<DeathClaimant>) {
    setClaimants((list) => list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  }

  async function save() {
    if (claimants.length > 5) { setError("Maximum 5 claimants."); return }
    for (const c of claimants) {
      const p = DeathClaimantSchema.safeParse(c)
      if (!p.success) { setError(p.error.issues[0]?.message ?? "Invalid claimant"); return }
    }
    const flags = syncClaimantFlags(claimants)
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: { ...existing, claimants, ...flags } }),
    })
    router.push(`/member/claims/death/home?case_id=${caseId}`)
  }

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={3} />
      <h1 className="text-xl font-bold text-[#0D2137]">Claimants (up to 5)</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {claimants.map((c, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between"><span className="font-medium">Claimant {i + 1}</span>
            {claimants.length > 1 && <button type="button" onClick={() => setClaimants(claimants.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-500" /></button>}
          </div>
          <div><Label>Name</Label><Input value={c.name} onChange={(e) => update(i, { name: e.target.value })} /></div>
          <div><Label>Relationship</Label><Input value={c.relationship} onChange={(e) => update(i, { relationship: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Checkbox checked={c.is_minor} onCheckedChange={(v) => update(i, { is_minor: Boolean(v), ...(Boolean(v) ? { mobile_number: "" } : {}) })} id={`m${i}`} /><Label htmlFor={`m${i}`}>Minor</Label></div>
          {c.is_minor ? (
            <div><Label>Birth Cert Number</Label><Input value={c.birth_cert_number ?? ""} onChange={(e) => update(i, { birth_cert_number: e.target.value })} /></div>
          ) : (
            <div><Label>National ID</Label><Input value={c.national_id ?? ""} onChange={(e) => update(i, { national_id: e.target.value })} /></div>
          )}
          {!c.is_minor && (
            <div><Label>Mobile</Label><Input value={c.mobile_number ?? ""} onChange={(e) => update(i, { mobile_number: e.target.value })} /></div>
          )}
          <div><Label>KRA PIN (if applicable)</Label><Input value={c.kra_pin ?? ""} onChange={(e) => update(i, { kra_pin: e.target.value })} /></div>
        </div>
      ))}
      {claimants.length < 5 && (
        <Button variant="outline" onClick={() => setClaimants([...claimants, { ...empty }])}><Plus className="w-4 h-4 mr-2" />Add Claimant</Button>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push(`/member/claims/death/details?case_id=${caseId}`)} className="flex-1">Back</Button>
        <Button onClick={save} className="flex-1 bg-[#E11D48] text-white">Continue</Button>
      </div>
    </div>
  )
}
