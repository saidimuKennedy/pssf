"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFICIARY_STEPS, getSkippedSteps } from "@/lib/beneficiaries/journey"

export default function BeneficiaryDeclarationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [accepted, setAccepted] = useState(false)
  const [hasMinor, setHasMinor] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => {
        const fd = (data.form_data ?? {}) as Record<string, unknown>
        setHasMinor(Boolean(fd.has_minor_beneficiary))
        if (fd.declaration_accepted) setAccepted(true)
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

  async function handleContinue() {
    if (!accepted) {
      setError("You must accept the statutory declaration to proceed.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      const getRes = await fetch(`/api/cases/${caseId}`)
      const caseData = await getRes.json()
      const existing = (caseData.form_data as Record<string, unknown>) ?? {}

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: { ...existing, declaration_accepted: true } }),
      })

      if (!res.ok) {
        setError("Failed to save declaration. Please try again.")
        return
      }

      router.push(`/member/beneficiaries/preview?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator
        steps={[...BENEFICIARY_STEPS]}
        currentStep={7}
        skippedSteps={getSkippedSteps(hasMinor)}
      />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Statutory Declaration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Please read and accept the declaration below.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 space-y-3 leading-relaxed">
        <p>
          I hereby nominate the person(s) named in this form as my beneficiary/beneficiaries
          under the Public Service Superannuation Scheme and declare that the information given
          is true and correct in every respect.
        </p>
        <p>
          I understand that this nomination may be revoked or varied by a subsequent nomination
          made in accordance with the Rules of the Scheme.
        </p>
        <p>
          I certify that the witness named is not a Trustee, Officer of the Scheme, or a
          Beneficiary named herein.
        </p>
        <p>
          I agree to be bound by the Public Service Superannuation Scheme Act, related laws,
          Rules and Regulations.
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
          onClick={() => router.push(`/member/beneficiaries/witness?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={loading}
          onClick={handleContinue}
          className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
        >
          {loading ? "Saving…" : "Accept & Continue"}
        </Button>
      </div>
    </div>
  )
}
