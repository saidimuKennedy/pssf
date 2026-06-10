"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DiscrepancyFieldSchema,
  FIELD_LABELS,
  deriveFieldCategory,
  getRoutingNote,
  type DiscrepancyField,
} from "@/lib/validations/discrepancy"
import { FileUploadSlot } from "@/components/ui/file-upload-slot"

export default function DiscrepancyPage() {
  return (
    <Suspense fallback={<p className="text-gray-500 p-8">Loading…</p>}>
      <DiscrepancyForm />
    </Suspense>
  )
}

function DiscrepancyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromStatement = searchParams.get("source") === "statement"
  const [field, setField] = useState<DiscrepancyField>("NAME")
  const [correct, setCorrect] = useState("")
  const [explanation, setExplanation] = useState("")
  const [caseId, setCaseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [docUploaded, setDocUploaded] = useState(false)

  async function startCase() {
    if (caseId) return caseId
    const formData = {
      field_name: field,
      field_category: deriveFieldCategory(field),
      correct_information: correct,
      explanation,
    }
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "DISCREPANCY", formData }),
    })
    if (!res.ok) return null
    const { caseId: id } = await res.json()
    setCaseId(id)
    return id
  }

  async function submit() {
    if (!correct.trim() || !explanation.trim()) {
      setError("All fields are required.")
      return
    }
    const parsed = DiscrepancyFieldSchema.safeParse(field)
    if (!parsed.success) return

    setLoading(true)
    setError(null)
    try {
      const id = await startCase()
      if (!id) { setError("Could not create report."); return }
      if (!docUploaded) { setError("Supporting document is required."); return }

      // Always sync the latest field values before submitting — startCase() may have
      // been called earlier (via the upload button) with different or empty values.
      await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            field_name: field,
            field_category: deriveFieldCategory(field),
            correct_information: correct,
            explanation,
          },
        }),
      })

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
      router.push(`/member/discrepancy/${id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#0D2137]">
        {fromStatement ? "Request Clarification" : "Report a Discrepancy"}
      </h1>
      {fromStatement && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            Use this form to query information on your contribution statement. PSSF will review and respond.
          </AlertDescription>
        </Alert>
      )}
      <div><Label>Field with incorrect information *</Label>
        <Select value={field} onValueChange={(v) => setField(v as DiscrepancyField)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DiscrepancyFieldSchema.options.map((f) => (
              <SelectItem key={f} value={f}>{FIELD_LABELS[f]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Alert><AlertDescription>{getRoutingNote(field)}</AlertDescription></Alert>
      <div><Label>Correct information *</Label><Textarea value={correct} onChange={(e) => setCorrect(e.target.value)} rows={2} /></div>
      <div><Label>Explanation *</Label><Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} /></div>
      {caseId ? (
        <FileUploadSlot documentType="SUPPORTING" label="Supporting Document" required caseId={caseId} currentStatus="PENDING" onUploadSuccess={() => setDocUploaded(true)} />
      ) : (
        <Button variant="outline" onClick={startCase}>Upload supporting document</Button>
      )}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button onClick={submit} disabled={loading} className="w-full bg-[#0D2137] text-white">{loading ? "Submitting…" : "Submit Report"}</Button>
    </div>
  )
}
