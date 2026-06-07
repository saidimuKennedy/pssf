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

const Schema = z.object({
  mobile_number: z
    .string()
    .regex(/^\+254[17]\d{8}$/, "Phone must start with +254 followed by 7 or 1 and 8 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  postal_address: z.string().max(255).optional(),
  postal_code: z.string().max(10).optional(),
  town: z.string().max(100).optional(),
  kra_pin: z
    .string()
    .regex(/^[A-Z]\d{9}[A-Z]$/, "KRA PIN must be in format A000000000A")
    .optional()
    .or(z.literal("")),
})
type FormValues = z.infer<typeof Schema>

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]

interface Prefill {
  full_name: string
  national_id: string
  date_of_birth: string
  member_number: string | null
  personal_number: string | null
  employer_name: string | null
  date_of_employment: string | null
  date_joined_scheme: string | null
  kra_pin: string | null
  mobile_number: string | null
  email: string | null
  postal_address: string | null
  postal_code: string | null
  town: string | null
}

export default function EnrolmentStep2Page() {
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
    const raw = sessionStorage.getItem("enrolment_prefill")
    if (raw) {
      const data = JSON.parse(raw) as Prefill
      setPrefill(data)
      reset({
        mobile_number: data.mobile_number ?? "",
        email: data.email ?? "",
        postal_address: data.postal_address ?? "",
        postal_code: data.postal_code ?? "",
        town: data.town ?? "",
        kra_pin: data.kra_pin ?? "",
      })
    }
  }, [reset])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start enrolment again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  async function onSubmit(values: FormValues) {
    setApiError(null)
    if (!prefill?.kra_pin && !values.kra_pin?.trim()) {
      setApiError("KRA PIN is required.")
      return
    }
    setLoading(true)
    try {
      const formData = {
        national_id: prefill?.national_id ?? "",
        date_of_birth: prefill?.date_of_birth ?? "",
        full_name: prefill?.full_name ?? "",
        mobile_number: values.mobile_number,
        email: values.email || undefined,
        postal_address: values.postal_address || undefined,
        postal_code: values.postal_code || undefined,
        town: values.town || undefined,
        ...(values.kra_pin ? { kra_pin: values.kra_pin } : {}),
      }

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      })

      if (!res.ok) {
        setApiError("Failed to save your details. Please try again.")
        return
      }

      router.push(`/member/enrolment/documents?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={2} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Confirm Your Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Locked fields are prefilled from PSSF records and cannot be edited here.
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Locked fields */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">PSSF Records</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LockedField label="Full Name" value={prefill?.full_name} />
            <LockedField label="National ID" value={prefill?.national_id} />
            <LockedField label="Date of Birth" value={prefill?.date_of_birth} />
            <LockedField label="Member Number" value={prefill?.member_number} />
            <LockedField label="Personal Number" value={prefill?.personal_number} />
            <LockedField label="Employer" value={prefill?.employer_name} />
            <LockedField label="Date of Employment" value={prefill?.date_of_employment} />
            <LockedField label="Date Joined Scheme" value={prefill?.date_joined_scheme} />
            {prefill?.kra_pin ? (
              <LockedField label="KRA PIN" value={prefill.kra_pin} />
            ) : (
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="kra_pin">KRA PIN <span className="text-red-500">*</span></Label>
                <Input
                  id="kra_pin"
                  placeholder="A000000000A"
                  {...register("kra_pin")}
                />
                {errors.kra_pin && (
                  <p className="text-xs text-red-600">{errors.kra_pin.message}</p>
                )}
                <p className="text-xs text-gray-500">Your KRA PIN was not on file — please enter it to continue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Editable fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mobile_number">Mobile Number <span className="text-red-500">*</span></Label>
              <Input
                id="mobile_number"
                placeholder="+254712345678"
                {...register("mobile_number")}
              />
              {errors.mobile_number && (
                <p className="text-xs text-red-600">{errors.mobile_number.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="postal_address">Postal Address</Label>
              <Input
                id="postal_address"
                placeholder="P.O. Box 1234"
                {...register("postal_address")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="00100"
                {...register("postal_code")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="town">Town / City</Label>
              <Input
                id="town"
                placeholder="Nairobi"
                {...register("town")}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/member/enrolment")}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
            >
              {loading ? "Saving…" : "Save & Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
