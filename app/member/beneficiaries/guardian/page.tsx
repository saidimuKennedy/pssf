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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle } from "lucide-react"
import { BENEFICIARY_STEPS } from "@/lib/beneficiaries/journey"
import { GuardianSchema, type GuardianInput } from "@/lib/validations/beneficiaries"

export default function BeneficiaryGuardianPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [hasMinor, setHasMinor] = useState<boolean | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GuardianInput>({
    resolver: zodResolver(GuardianSchema),
    defaultValues: { minor_benefit_option: "TRUST" },
  })

  const benefitOption = watch("minor_benefit_option")

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}/beneficiaries`)
      .then((r) => r.json())
      .then((data) => {
        const minors = (data.beneficiaries ?? []).some(
          (b: { is_minor: boolean }) => b.is_minor
        )
        setHasMinor(minors)
        if (!minors) {
          router.replace(`/member/beneficiaries/documents?case_id=${caseId}`)
        }
      })
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => {
        const fd = (data.form_data ?? {}) as Record<string, unknown>
        if (fd.guardian_name) {
          reset({
            guardian_name: String(fd.guardian_name),
            guardian_relationship: String(fd.guardian_relationship ?? ""),
            guardian_address: String(fd.guardian_address ?? ""),
            guardian_postal_code: String(fd.guardian_postal_code ?? ""),
            guardian_town: String(fd.guardian_town ?? ""),
            guardian_mobile: String(fd.guardian_mobile ?? ""),
            minor_benefit_option: (fd.minor_benefit_option as GuardianInput["minor_benefit_option"]) ?? "TRUST",
          })
        }
      })
  }, [caseId, router, reset])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start nomination again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (hasMinor === null) {
    return <p className="text-sm text-gray-400">Loading…</p>
  }

  async function onSubmit(values: GuardianInput) {
    setApiError(null)
    setLoading(true)
    try {
      const getRes = await fetch(`/api/cases/${caseId}`)
      const caseData = await getRes.json()
      const existing = (caseData.form_data as Record<string, unknown>) ?? {}

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            ...existing,
            has_minor_beneficiary: true,
            ...values,
          },
        }),
      })

      if (!res.ok) {
        setApiError("Failed to save guardian details. Please try again.")
        return
      }

      router.push(`/member/beneficiaries/documents?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFICIARY_STEPS]} currentStep={4} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Guardian Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Required because you have nominated minor beneficiaries.
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <Label>Guardian Name <span className="text-red-500">*</span></Label>
            <Input {...register("guardian_name")} />
            {errors.guardian_name && (
              <p className="text-xs text-red-600">{errors.guardian_name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Relationship <span className="text-red-500">*</span></Label>
            <Input {...register("guardian_relationship")} placeholder="e.g. Grandmother" />
            {errors.guardian_relationship && (
              <p className="text-xs text-red-600">{errors.guardian_relationship.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Mobile Number <span className="text-red-500">*</span></Label>
            <Input {...register("guardian_mobile")} placeholder="+254712345678" />
            {errors.guardian_mobile && (
              <p className="text-xs text-red-600">{errors.guardian_mobile.message}</p>
            )}
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Address <span className="text-red-500">*</span></Label>
            <Input {...register("guardian_address")} />
            {errors.guardian_address && (
              <p className="text-xs text-red-600">{errors.guardian_address.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Postal Code <span className="text-red-500">*</span></Label>
            <Input {...register("guardian_postal_code")} />
            {errors.guardian_postal_code && (
              <p className="text-xs text-red-600">{errors.guardian_postal_code.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Town <span className="text-red-500">*</span></Label>
            <Input {...register("guardian_town")} />
            {errors.guardian_town && (
              <p className="text-xs text-red-600">{errors.guardian_town.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Minor Benefit Option <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={benefitOption}
            onValueChange={(v) =>
              setValue("minor_benefit_option", v as GuardianInput["minor_benefit_option"])
            }
            className="space-y-3"
          >
            <div className="rounded-lg border border-gray-200 p-4 space-y-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="TRUST" id="trust" />
                <Label htmlFor="trust" className="font-medium cursor-pointer">
                  Option A — Pay to a Trust
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Benefits payable to minor beneficiaries shall be paid to a trust established by
                the Trustees of the Public Service Superannuation Scheme until the minor attains
                the age of majority.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 space-y-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="GUARDIAN" id="guardian" />
                <Label htmlFor="guardian" className="font-medium cursor-pointer">
                  Option B — Pay to Named Guardian
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Benefits payable to minor beneficiaries shall be paid to the named guardian for
                the maintenance, education, and welfare of the minor beneficiary, subject to
                oversight by the Trustees.
              </p>
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/member/beneficiaries/add?case_id=${caseId}`)}
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
