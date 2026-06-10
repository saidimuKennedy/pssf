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

const Schema = z.object({
  national_id: z.string().min(1, "National ID is required"),
  year_of_birth: z
    .string()
    .regex(/^\d{4}$/, "Enter a valid 4-digit year"),
})
type FormValues = z.infer<typeof Schema>

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]

export default function EnrolmentStep1Page() {
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
      // 1. Validate identity
      const validateRes = await fetch("/api/member/validate?allow_new=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const validateData = await validateRes.json()

      if (!validateRes.ok || !validateData.matched) {
        setApiError(
          "We could not verify your identity. Please check your National ID and date of birth."
        )
        return
      }

      // 2. Store prefill in sessionStorage for step 2
      sessionStorage.setItem("enrolment_prefill", JSON.stringify(validateData.member))

      // 3. Create draft case
      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MEMBER_ENROLMENT",
          formData: {
            national_id: values.national_id,
            year_of_birth: values.year_of_birth,
          },
        }),
      })

      if (!caseRes.ok) {
        setApiError("Could not start your enrolment. Please try again.")
        return
      }

      const { caseId } = await caseRes.json()
      router.push(`/member/enrolment/details?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={1} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Verify Your Identity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your PSSF-registered National ID and year of birth to begin enrolment.
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
          <Input
            id="national_id"
            placeholder="e.g. 12345678"
            {...register("national_id")}
          />
          {errors.national_id && (
            <p className="text-xs text-red-600">{errors.national_id.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="year_of_birth">Year of Birth</Label>
          <Input
            id="year_of_birth"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            placeholder="e.g. 1983"
            {...register("year_of_birth")}
          />
          {errors.year_of_birth && (
            <p className="text-xs text-red-600">{errors.year_of_birth.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </Button>
      </form>
    </div>
  )
}
