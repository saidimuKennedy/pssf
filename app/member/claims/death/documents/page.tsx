"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CaseType } from "@/lib/enums"
import { StepIndicator } from "@/components/ui/step-indicator"
import { FileUploadSlot } from "@/components/ui/file-upload-slot"
import { Button } from "@/components/ui/button"
import { DEATH_STEPS } from "@/lib/death-benefits/journey"
import { getChecklist, evaluateCondition } from "@/lib/documents/checklists"

const LABELS: Record<string, string> = {
  DEATH_CERTIFICATE: "Death Certificate",
  MARRIAGE_CERTIFICATE: "Marriage Certificate or Affidavit",
  BIRTH_CERTIFICATE: "Birth Certificates of Children",
  NATIONAL_ID: "Claimant ID Copies",
  ATM_CARD: "ATM Card Front Page",
}

export default function DeathDocumentsPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [docs, setDocs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      setFormData((d.form_data ?? {}) as Record<string, unknown>)
      const m: Record<string, string> = {}
      for (const doc of d.documents ?? []) m[doc.document_type] = doc.status
      setDocs(m)
    })
  }, [caseId])

  const checklist = getChecklist(CaseType.DEATH_BENEFITS_CLAIM).filter((r) => !r.condition || evaluateCondition(r.condition, formData))

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={7} />
      <h1 className="text-xl font-bold text-[#0D2137]">Upload Documents</h1>
      <div className="space-y-4">
        {checklist.map((req) => (
          <FileUploadSlot key={req.type} documentType={req.type} label={LABELS[req.type] ?? req.type} required={req.required || Boolean(req.condition)} caseId={caseId} currentStatus={(docs[req.type] as "PENDING") ?? "PENDING"} onUploadSuccess={(s) => setDocs({ ...docs, [req.type]: s })} />
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push(`/member/claims/death/payment?case_id=${caseId}`)} className="flex-1">Back</Button>
        <Button onClick={() => router.push(`/member/claims/death/witness?case_id=${caseId}`)} className="flex-1 bg-[#E11D48] text-white">Continue</Button>
      </div>
    </div>
  )
}
