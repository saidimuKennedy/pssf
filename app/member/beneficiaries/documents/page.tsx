"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { FileUploadSlot } from "@/components/ui/file-upload-slot"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFICIARY_STEPS, backFromDocuments, getSkippedSteps } from "@/lib/beneficiaries/journey"
import { getChecklist, evaluateCondition } from "@/lib/documents/checklists"
import { CaseType } from "@prisma/client"

type DocumentStatus = "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED"

interface DocState {
  status: DocumentStatus
  fileName?: string | null
  rejectionReason?: string | null
}

const DOC_LABELS: Record<string, string> = {
  NATIONAL_ID: "National ID",
  BIRTH_CERTIFICATE: "Birth Certificate(s)",
  GUARDIAN_ID: "Guardian ID",
}

export default function BeneficiaryDocumentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [docStates, setDocStates] = useState<Record<string, DocState>>({})
  const [advanceError, setAdvanceError] = useState<string | null>(null)

  const hasMinor = Boolean(formData.has_minor_beneficiary)
  const checklist = getChecklist(CaseType.BENEFICIARY_NOMINATION).filter((req) => {
    if (!req.condition) return true
    return evaluateCondition(req.condition, formData)
  })

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => {
        const fd = (data.form_data ?? {}) as Record<string, unknown>
        setFormData(fd)
        const states: Record<string, DocState> = {}
        for (const doc of data.documents ?? []) {
          states[doc.document_type] = {
            status: doc.status as DocumentStatus,
            fileName: doc.file_name,
            rejectionReason: doc.rejection_reason,
          }
        }
        setDocStates(states)
      })
  }, [caseId])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start nomination again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  function updateDoc(type: string, status: DocumentStatus, fileName?: string) {
    setDocStates((prev) => ({
      ...prev,
      [type]: { ...prev[type], status, fileName: fileName ?? prev[type]?.fileName },
    }))
  }

  function handleAdvance() {
    const missing = checklist.filter((req) => {
      const isRequired =
        req.required || (req.condition ? evaluateCondition(req.condition, formData) : false)
      if (!isRequired) return false
      const state = docStates[req.type]
      return !state || state.status === "PENDING"
    })

    if (missing.length > 0) {
      const label = DOC_LABELS[missing[0].type] ?? missing[0].type
      setAdvanceError(`Please upload your ${label} before continuing.`)
      return
    }

    setAdvanceError(null)
    router.push(`/member/beneficiaries/witness?case_id=${caseId}`)
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator
        steps={[...BENEFICIARY_STEPS]}
        currentStep={5}
        skippedSteps={getSkippedSteps(hasMinor)}
      />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Upload Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload required documents. Accepted formats: PDF, JPEG, PNG (max 5MB).
        </p>
      </div>

      <div className="space-y-4">
        {checklist.map((req) => {
          const isRequired =
            req.required || (req.condition ? evaluateCondition(req.condition, formData) : false)
          const state = docStates[req.type] ?? { status: "PENDING" as DocumentStatus }
          return (
            <FileUploadSlot
              key={req.type}
              documentType={req.type}
              label={DOC_LABELS[req.type] ?? req.type}
              required={isRequired}
              caseId={caseId}
              currentStatus={state.status}
              currentFileName={state.fileName}
              rejectionReason={state.rejectionReason}
              onUploadSuccess={(status, fileName) => updateDoc(req.type, status, fileName)}
            />
          )
        })}
      </div>

      {advanceError && (
        <Alert variant="destructive">
          <AlertDescription>{advanceError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(backFromDocuments(caseId, hasMinor))}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleAdvance}
          className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
