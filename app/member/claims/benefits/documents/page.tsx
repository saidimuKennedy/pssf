"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CaseType } from "@prisma/client"
import { StepIndicator } from "@/components/ui/step-indicator"
import { FileUploadSlot } from "@/components/ui/file-upload-slot"
import { Button } from "@/components/ui/button"
import { BENEFITS_STEPS, getBenefitsSkippedSteps } from "@/lib/benefits/journey"
import { getChecklist, evaluateCondition } from "@/lib/documents/checklists"

const LABELS: Record<string, string> = {
  EXIT_LETTER: "Exit Letter", NATIONAL_ID: "National ID", ATM_CARD: "ATM Card Front",
  KRA_PIN: "KRA PIN Certificate", PROOF_OF_RESIDENCY: "Proof of Residency", OPTION_ELECTION: "Option Election Form",
}

export default function BenefitsDocumentsPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [docs, setDocs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => {
      setFormData(d.form_data as Record<string, unknown>)
      const m: Record<string, string> = {}
      for (const doc of d.documents ?? []) m[doc.document_type] = doc.status
      setDocs(m)
    })
  }, [caseId])

  const checklist = getChecklist(CaseType.BENEFITS_CLAIM).filter((r) => !r.condition || evaluateCondition(r.condition, formData))

  if (!caseId) return null
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={8} skippedSteps={getBenefitsSkippedSteps(formData)} />
      <h1 className="text-xl font-bold text-[#0D2137]">Upload Documents</h1>
      <div className="space-y-4">
        {checklist.map((req) => (
          <FileUploadSlot key={req.type} documentType={req.type} label={LABELS[req.type] ?? req.type} required={req.required || Boolean(req.condition)} caseId={caseId} currentStatus={(docs[req.type] as "PENDING") ?? "PENDING"} onUploadSuccess={(s) => setDocs({ ...docs, [req.type]: s })} />
        ))}
      </div>
      <Button onClick={() => router.push(`/member/claims/benefits/declaration?case_id=${caseId}`)} className="w-full bg-[#7C3AED] text-white">Continue</Button>
    </div>
  )
}
