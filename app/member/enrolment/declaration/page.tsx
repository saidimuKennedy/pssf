"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]

export default function EnrolmentStep4Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start enrolment again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  async function handleContinue() {
    if (!accepted) {
      setError("You must accept the statutory declaration to proceed.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      // Fetch current form_data, merge declaration, PATCH back
      const getRes = await fetch(`/api/cases/${caseId}`)
      const caseData = await getRes.json()
      const existing = (caseData.form_data as Record<string, unknown>) ?? {}

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: { ...existing, declaration_accepted: true },
        }),
      })

      if (!res.ok) {
        setError("Failed to save declaration. Please try again.")
        return
      }

      router.push(`/member/enrolment/preview?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={4} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Statutory Declaration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Please read the declaration below and confirm your acceptance.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 space-y-3 leading-relaxed">
        <p>
          I hereby declare that all the information I have provided in this enrolment application is
          true, accurate, and complete to the best of my knowledge.
        </p>
        <p>
          I understand that providing false or misleading information may result in the rejection of
          this application and may subject me to legal action under the Public Service Superannuation
          Fund Act.
        </p>
        <p>
          I consent to the processing of my personal data by PSSF for the purposes of administering
          my membership and benefits, in accordance with the Data Protection Act, 2019.
        </p>
        <p>
          I authorise PSSF to verify any information provided in this application with relevant
          government agencies or my employer.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="declaration"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(Boolean(v))}
        />
        <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
          I have read, understood, and accept the statutory declaration above.
        </Label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/member/enrolment/documents?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={handleContinue}
          className="flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
        >
          {loading ? "Saving…" : "Accept & Continue"}
        </Button>
      </div>
    </div>
  )
}
