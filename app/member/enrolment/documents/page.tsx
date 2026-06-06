"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { FileUploadSlot } from "@/components/ui/file-upload-slot"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]

export default function EnrolmentStep3Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [docStatus, setDocStatus] = useState<"PENDING" | "UPLOADED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED">("PENDING")
  const [advanceError, setAdvanceError] = useState<string | null>(null)

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start enrolment again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  function handleAdvance() {
    if (docStatus === "PENDING") {
      setAdvanceError("Please upload your National ID before continuing.")
      return
    }
    setAdvanceError(null)
    router.push(`/member/enrolment/declaration?case_id=${caseId}`)
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={3} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Upload Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a clear scan or photo of your National ID. Accepted formats: PDF, JPEG, PNG (max 5MB).
        </p>
      </div>

      <FileUploadSlot
        documentType="NATIONAL_ID"
        label="National ID"
        required
        caseId={caseId}
        currentStatus={docStatus}
        onUploadSuccess={(status) => setDocStatus(status)}
      />

      {advanceError && (
        <Alert variant="destructive">
          <AlertDescription>{advanceError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/member/enrolment/details?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleAdvance}
          className="flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
