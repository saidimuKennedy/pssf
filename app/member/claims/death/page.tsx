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
import { DEATH_STEPS } from "@/lib/death-benefits/journey"

const Schema = z.object({
  national_id: z.string().min(1, "National ID is required"),
  year_of_birth: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
  personal_number: z.string().optional(),
  member_number: z.string().optional(),
})

export default function DeathClaimStartPage() {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(Schema) })

  async function onSubmit(values: z.infer<typeof Schema>) {
    setApiError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/member/validate-deceased", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!data.matched) {
        setApiError("We could not verify the deceased member's record. Please check the National ID and year of birth.")
        return
      }
      sessionStorage.setItem("death_prefill", JSON.stringify(data.member))
      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DEATH_BENEFITS_CLAIM",
          formData: {
            deceased_member_id: data.member.id,
            national_id: data.member.national_id,
            full_name: data.member.full_name,
            personal_number: data.member.personal_number,
            member_number: data.member.member_number,
            employer_name: data.member.employer_name,
            kra_pin: data.member.kra_pin,
            year_of_birth: values.year_of_birth,
            claimants: [],
          },
        }),
      })
      if (!caseRes.ok) {
        setApiError("Could not start the death benefits claim.")
        return
      }
      const { caseId } = await caseRes.json()
      router.push(`/member/claims/death/details?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...DEATH_STEPS]} currentStep={1} />
      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Death Benefits Claim</h1>
        <p className="text-sm text-gray-600">Validate the deceased member&apos;s PSSF record.</p>
      </div>
      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="national_id">Deceased National ID / Passport</Label>
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
            placeholder="e.g. 1960"
            {...register("year_of_birth")}
          />
          {errors.year_of_birth && <p className="text-xs text-red-600">{String(errors.year_of_birth.message)}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="personal_number">Personal / Employment Number <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input id="personal_number" {...register("personal_number")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="member_number">PSSF Member Number <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input id="member_number" {...register("member_number")} />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-[#E11D48] hover:bg-[#be123c] text-white">
          {loading ? "Verifying…" : "Verify & Continue"}
        </Button>
      </form>
    </div>
  )
}
