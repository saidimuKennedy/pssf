"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { StepIndicator } from "@/components/ui/step-indicator"
import { LockedField } from "@/components/ui/locked-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { AVC_STEPS } from "@/lib/avc/journey"

const Schema = z.object({
  mobile_number: z
    .string()
    .regex(/^\+254[17]\d{8}$/, "Phone must start with +254 followed by 7 or 1 and 8 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
})
type FormValues = z.infer<typeof Schema>

interface Prefill {
  full_name: string
  personal_number: string | null
  employer_name: string | null
  date_joined_scheme: string | null
  mobile_number: string | null
  email: string | null
}

export default function AVCDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [prefill, setPrefill] = useState<Prefill | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) })

  useEffect(() => {
    const raw = sessionStorage.getItem("avc_prefill")
    if (raw) {
      const data = JSON.parse(raw) as Prefill
      setPrefill(data)
      reset({
        mobile_number: data.mobile_number ?? "",
        email: data.email ?? "",
      })
    } else if (caseId) {
      fetch(`/api/cases/${caseId}`)
        .then((r) => r.json())
        .then((data) => {
          const fd = data.form_data as Record<string, unknown>
          setPrefill({
            full_name: String(fd.full_name ?? ""),
            personal_number: fd.personal_number ? String(fd.personal_number) : null,
            employer_name: fd.employer_name ? String(fd.employer_name) : null,
            date_joined_scheme: fd.date_joined_scheme ? String(fd.date_joined_scheme) : null,
            mobile_number: fd.mobile_number ? String(fd.mobile_number) : null,
            email: fd.email ? String(fd.email) : null,
          })
          reset({
            mobile_number: String(fd.mobile_number ?? ""),
            email: String(fd.email ?? ""),
          })
        })
    }
  }, [caseId, reset])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start your AVC request again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  async function onSubmit(values: FormValues) {
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
            full_name: prefill?.full_name ?? existing.full_name,
            personal_number: prefill?.personal_number ?? existing.personal_number,
            employer_name: prefill?.employer_name ?? existing.employer_name,
            date_joined_scheme: prefill?.date_joined_scheme ?? existing.date_joined_scheme,
            mobile_number: values.mobile_number,
            email: values.email || undefined,
          },
        }),
      })

      if (!res.ok) {
        setApiError("Failed to save your details. Please try again.")
        return
      }

      router.push(`/member/avc/action?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={2} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Confirm Your Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your prefilled particulars and update your contact information.
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">PSSF Records</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LockedField label="Full Name" value={prefill?.full_name} />
            <LockedField label="Personal Number" value={prefill?.personal_number} />
            <LockedField label="Date Joined Scheme" value={prefill?.date_joined_scheme} />
            <LockedField label="Employer" value={prefill?.employer_name} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mobile_number">Mobile Number <span className="text-red-500">*</span></Label>
              <Input id="mobile_number" placeholder="+254712345678" {...register("mobile_number")} />
              {errors.mobile_number && (
                <p className="text-xs text-red-600">{errors.mobile_number.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.push("/member/avc")}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#16A34A] hover:bg-[#145f3a] text-white"
            >
              {loading ? "Saving…" : "Save & Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
