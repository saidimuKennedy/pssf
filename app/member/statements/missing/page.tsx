"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploadSlot } from "@/components/ui/file-upload-slot"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MissingContributionFormDataSchema } from "@/lib/validations/discrepancy"

export default function MissingContributionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ month: "", contribution_type: "BOTH", explanation: "", employer_name: "" })
  const [caseId, setCaseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/member/profile").then((r) => r.json()).then((p) => {
      if (p.employer_name) setForm((f) => ({ ...f, employer_name: p.employer_name }))
    })
    fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "MISSING_CONTRIBUTION", formData: { employer_name: "" } }),
    }).then((r) => r.json()).then((d) => { if (d.caseId) setCaseId(d.caseId) })
  }, [])

  async function submit() {
    const parsed = MissingContributionFormDataSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form")
      return
    }
    setLoading(true)
    setError(null)
    try {
      let id = caseId
      if (!id) {
        const createRes = await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "MISSING_CONTRIBUTION", formData: parsed.data }),
        })
        if (!createRes.ok) { setError("Could not create report."); return }
        id = (await createRes.json()).caseId
      } else {
        await fetch(`/api/cases/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: parsed.data }),
        })
      }
      const submitRes = await fetch(`/api/cases/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationAccepted: true, otpVerified: true }),
      })
      if (!submitRes.ok) {
        const b = await submitRes.json()
        setError(b.error ?? "Submission failed")
        return
      }
      router.push(`/member/requests/${id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#0D2137]">Report Missing Contribution</h1>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <div><Label>Month (YYYY-MM) *</Label><Input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></div>
      <div><Label>Contribution Type *</Label>
        <Select value={form.contribution_type} onValueChange={(v) => setForm({ ...form, contribution_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="EMPLOYEE">Employee</SelectItem>
            <SelectItem value="EMPLOYER">Employer</SelectItem>
            <SelectItem value="BOTH">Both</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Employer</Label><Input value={form.employer_name} readOnly className="bg-gray-50" /></div>
      <div><Label>Explanation *</Label><Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={4} /></div>
      {caseId && (
        <FileUploadSlot documentType="PAYSLIP" label="Payslip (optional)" required={false} caseId={caseId} currentStatus="PENDING" />
      )}
      <Button onClick={submit} disabled={loading} className="w-full bg-[#D97706] text-white">{loading ? "Submitting…" : "Submit Report"}</Button>
    </div>
  )
}
