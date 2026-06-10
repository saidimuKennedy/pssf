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
import { BENEFITS_STEPS } from "@/lib/benefits/journey"

const Schema = z.object({
  national_id: z.string().min(1, "National ID is required"),
  year_of_birth: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
})

export default function BenefitsClaimStartPage() {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(Schema) })

  async function onSubmit(values: z.infer<typeof Schema>) {
    setApiError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/member/validate?allow_new=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!data.matched) {
        setApiError("We could not verify your identity. Please check your National ID and year of birth.")
        return
      }
      sessionStorage.setItem("benefits_prefill", JSON.stringify(data.member))
      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BENEFITS_CLAIM",
          formData: {
            national_id: data.member.national_id,
            full_name: data.member.full_name,
            personal_number: data.member.personal_number,
            employer_name: data.member.employer_name,
            kra_pin: data.member.kra_pin,
            date_joined_scheme: data.member.date_joined_scheme,
          },
        }),
      })
      if (!caseRes.ok) {
        setApiError("Could not start your claim.")
        return
      }
      const { caseId } = await caseRes.json()
      router.push(`/member/claims/benefits/details?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={1} />
      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Benefits Claim</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your PSSF-registered National ID and year of birth to begin.
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
          {errors.national_id && <p className="text-xs text-red-600">{String(errors.national_id.message)}</p>}
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
          {errors.year_of_birth && <p className="text-xs text-red-600">{String(errors.year_of_birth.message)}</p>}
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white">
          {loading ? "Verifying…" : "Verify & Continue"}
        </Button>
      </form>
    </div>
  )
}
