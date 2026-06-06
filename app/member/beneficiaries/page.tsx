"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { BENEFICIARY_STEPS } from "@/lib/beneficiaries/journey"

const Schema = z.object({
  national_id: z.string().min(1, "National ID is required"),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
})
type FormValues = z.infer<typeof Schema>

export default function BeneficiaryStep1Page() {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) })

  async function onSubmit(values: FormValues) {
    setApiError(null)
    setLoading(true)
    try {
      const validateRes = await fetch("/api/member/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const validateData = await validateRes.json()

      if (!validateRes.ok || !validateData.matched) {
        setApiError(
          "We could not find a record matching your details. Please check your National ID number and date of birth and try again."
        )
        return
      }

      sessionStorage.setItem("beneficiary_prefill", JSON.stringify(validateData.member))

      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BENEFICIARY_NOMINATION",
          formData: {
            national_id: values.national_id,
            date_of_birth: values.date_of_birth,
            has_minor_beneficiary: false,
          },
        }),
      })

      if (!caseRes.ok) {
        if (caseRes.status === 401) {
          setApiError("Your session has expired. Please log in again to continue.")
          router.push("/login")
          return
        }
        setApiError("Could not start your nomination. Please try again.")
        return
      }

      const { caseId } = await caseRes.json()
      router.push(`/member/beneficiaries/details?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFICIARY_STEPS]} currentStep={1} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Verify Your Identity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your PSSF-registered National ID and date of birth to begin beneficiary nomination.
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="national_id">National ID Number</Label>
          <Input id="national_id" placeholder="e.g. 12345678" {...register("national_id")} />
          {errors.national_id && (
            <p className="text-xs text-red-600">{errors.national_id.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
          {errors.date_of_birth && (
            <p className="text-xs text-red-600">{errors.date_of_birth.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </Button>
      </form>
    </div>
  )
}
