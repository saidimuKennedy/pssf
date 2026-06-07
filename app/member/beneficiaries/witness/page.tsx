"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { BENEFICIARY_STEPS, getSkippedSteps } from "@/lib/beneficiaries/journey"
import { WitnessSchema, type WitnessInput } from "@/lib/validations/beneficiaries"

export default function BeneficiaryWitnessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [hasMinor, setHasMinor] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WitnessInput>({ resolver: zodResolver(WitnessSchema) })

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => {
        const fd = (data.form_data ?? {}) as Record<string, unknown>
        setHasMinor(Boolean(fd.has_minor_beneficiary))
        if (fd.witnessed_by) {
          reset({
            witnessed_by: String(fd.witnessed_by),
            witness_id_number: String(fd.witness_id_number ?? ""),
            witness_signature: String(fd.witness_signature ?? ""),
            witness_mobile: String(fd.witness_mobile ?? ""),
            witness_date: String(fd.witness_date ?? ""),
          })
        }
      })
  }, [caseId, reset])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start nomination again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  async function onSubmit(values: WitnessInput) {
    setApiError(null)
    setLoading(true)
    try {
      const getRes = await fetch(`/api/cases/${caseId}`)
      const caseData = await getRes.json()
      const existing = (caseData.form_data as Record<string, unknown>) ?? {}

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: { ...existing, ...values } }),
      })

      if (!res.ok) {
        setApiError("Failed to save witness details. Please try again.")
        return
      }

      router.push(`/member/beneficiaries/declaration?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator
        steps={[...BENEFICIARY_STEPS]}
        currentStep={6}
        skippedSteps={getSkippedSteps(hasMinor)}
      />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Witness Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Provide details of the person who witnessed your nomination.
        </p>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          The witness must not be a Trustee, Officer of the Scheme, or a Beneficiary named in
          this nomination.
        </AlertDescription>
      </Alert>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label>Witnessed By <span className="text-red-500">*</span></Label>
          <Input {...register("witnessed_by")} placeholder="Full name of witness" />
          {errors.witnessed_by && (
            <p className="text-xs text-red-600">{errors.witnessed_by.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Witness ID Number <span className="text-red-500">*</span></Label>
          <Input {...register("witness_id_number")} />
          {errors.witness_id_number && (
            <p className="text-xs text-red-600">{errors.witness_id_number.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Signature (type full name) <span className="text-red-500">*</span></Label>
          <Input {...register("witness_signature")} placeholder="Full name as signature" />
          {errors.witness_signature && (
            <p className="text-xs text-red-600">{errors.witness_signature.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Witness Mobile <span className="text-red-500">*</span></Label>
          <Input {...register("witness_mobile")} placeholder="+254712345678" />
          {errors.witness_mobile && (
            <p className="text-xs text-red-600">{errors.witness_mobile.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Witness Date <span className="text-red-500">*</span></Label>
          <Input type="date" {...register("witness_date")} />
          {errors.witness_date && (
            <p className="text-xs text-red-600">{errors.witness_date.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/member/beneficiaries/documents?case_id=${caseId}`)}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
          >
            {loading ? "Saving…" : "Save & Continue"}
          </Button>
        </div>
      </form>
    </div>
  )
}
