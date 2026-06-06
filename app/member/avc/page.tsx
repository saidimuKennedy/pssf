"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { TrendingUp, RefreshCw, XCircle } from "lucide-react"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { AVC_STEPS, AVC_ACTION_LABELS, AVC_ACTION_DESCRIPTIONS } from "@/lib/avc/journey"
import { cn } from "@/lib/utils"

const Schema = z.object({
  national_id: z.string().min(1, "National ID is required"),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
})
type FormValues = z.infer<typeof Schema>

type AvcAction = "NEW" | "VARY" | "CANCEL"

const ACTIONS: { action: AvcAction; icon: typeof TrendingUp; color: string }[] = [
  { action: "NEW", icon: TrendingUp, color: "#16A34A" },
  { action: "VARY", icon: RefreshCw, color: "#2563EB" },
  { action: "CANCEL", icon: XCircle, color: "#D97706" },
]

export default function AVCStep1Page() {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)
  const [prefill, setPrefill] = useState<Record<string, unknown> | null>(null)
  const [creating, setCreating] = useState<AvcAction | null>(null)

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
          "We could not find a record matching your details. Please check your National ID and date of birth."
        )
        return
      }

      sessionStorage.setItem("avc_prefill", JSON.stringify(validateData.member))
      setPrefill(validateData.member)
      setValidated(true)
    } finally {
      setLoading(false)
    }
  }

  async function selectAction(action: AvcAction) {
    if (!prefill) return
    setCreating(action)
    setApiError(null)
    try {
      const caseRes = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "AVC",
          formData: {
            national_id: prefill.national_id,
            date_of_birth: prefill.date_of_birth,
            full_name: prefill.full_name,
            personal_number: prefill.personal_number,
            employer_name: prefill.employer_name,
            date_joined_scheme: prefill.date_joined_scheme,
            avc_action: action,
          },
        }),
      })

      if (!caseRes.ok) {
        if (caseRes.status === 401) {
          setApiError("Your session has expired. Please log in again to continue.")
          router.push("/login")
          return
        }
        setApiError("Could not start your AVC request. Please try again.")
        return
      }

      const { caseId } = await caseRes.json()
      router.push(`/member/avc/details?case_id=${caseId}`)
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={1} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Additional Voluntary Contributions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Verify your identity, then select the AVC action you wish to perform.
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {!validated ? (
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
            className="w-full bg-[#16A34A] hover:bg-[#145f3a] text-white"
          >
            {loading ? "Verifying…" : "Verify Identity"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select an action to continue:</p>
          <div className="grid gap-3">
            {ACTIONS.map(({ action, icon: Icon, color }) => (
              <Card
                key={action}
                className={cn(
                  "cursor-pointer transition-all hover:border-[#16A34A] hover:shadow-sm",
                  creating === action && "opacity-60 pointer-events-none"
                )}
                onClick={() => selectAction(action)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{AVC_ACTION_LABELS[action]}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{AVC_ACTION_DESCRIPTIONS[action]}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={() => setValidated(false)}>
            Re-enter identity details
          </Button>
        </div>
      )}
    </div>
  )
}
