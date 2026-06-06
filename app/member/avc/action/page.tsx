"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { LockedField } from "@/components/ui/locked-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle } from "lucide-react"
import { AVC_STEPS, AVC_ACTION_LABELS } from "@/lib/avc/journey"
import {
  NewAVCSchema,
  VaryAVCSchema,
  CancelAVCSchema,
} from "@/lib/validations/avc"

type AvcAction = "NEW" | "VARY" | "CANCEL"
type AvcMethod = "PAYROLL" | "MOBILE_WALLET"

export default function AVCActionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [avcAction, setAvcAction] = useState<AvcAction | null>(null)
  const [avcMethod, setAvcMethod] = useState<AvcMethod>("PAYROLL")
  const [newAmount, setNewAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [commencementDate, setCommencementDate] = useState("")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [mobileWalletNumber, setMobileWalletNumber] = useState("")
  const [knownCurrentAmount, setKnownCurrentAmount] = useState<number | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((data) => {
        const fd = data.form_data as Record<string, unknown>
        setAvcAction(fd.avc_action as AvcAction)
        if (fd.avc_method) setAvcMethod(fd.avc_method as AvcMethod)
        if (fd.new_amount) setNewAmount(String(fd.new_amount))
        if (fd.current_amount) {
          setCurrentAmount(String(fd.current_amount))
          setKnownCurrentAmount(Number(fd.current_amount))
        }
        if (fd.commencement_date) setCommencementDate(String(fd.commencement_date))
        if (fd.effective_date) setEffectiveDate(String(fd.effective_date))
        if (fd.mobile_wallet_number) setMobileWalletNumber(String(fd.mobile_wallet_number))
      })
  }, [caseId])

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start your AVC request again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError(null)
    setLoading(true)

    try {
      const getRes = await fetch(`/api/cases/${caseId}`)
      const caseData = await getRes.json()
      const existing = (caseData.form_data as Record<string, unknown>) ?? {}

      const base = {
        ...existing,
        avc_action: avcAction,
        avc_method: avcMethod,
        mobile_wallet_number:
          avcMethod === "MOBILE_WALLET" ? mobileWalletNumber : undefined,
      }

      let payload: Record<string, unknown>
      let parsed

      if (avcAction === "NEW") {
        payload = {
          ...base,
          new_amount: parseFloat(newAmount),
          commencement_date: commencementDate,
        }
        parsed = NewAVCSchema.safeParse(payload)
      } else if (avcAction === "VARY") {
        payload = {
          ...base,
          current_amount: knownCurrentAmount ?? parseFloat(currentAmount),
          new_amount: parseFloat(newAmount),
          effective_date: effectiveDate,
        }
        parsed = VaryAVCSchema.safeParse(payload)
      } else {
        payload = {
          ...base,
          current_amount: currentAmount ? parseFloat(currentAmount) : undefined,
          effective_date: effectiveDate,
        }
        parsed = CancelAVCSchema.safeParse(payload)
      }

      if (!parsed?.success) {
        const firstError = parsed?.error.issues[0]?.message ?? "Please check all required fields."
        setApiError(firstError)
        return
      }

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: payload }),
      })

      if (!res.ok) {
        setApiError("Failed to save AVC details. Please try again.")
        return
      }

      router.push(`/member/avc/declaration?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  const actionLabel = avcAction ? AVC_ACTION_LABELS[avcAction] : "AVC"

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={3} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">{actionLabel}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter your contribution details and select a payment method.
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {avcAction === "NEW" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              You are applying to commence additional voluntary contributions. Enter the monthly
              amount and the date contributions should begin.
            </div>
            <div className="space-y-1">
              <Label>Monthly Amount (KES) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            <div className="space-y-1">
              <Label>Commencement Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={commencementDate}
                onChange={(e) => setCommencementDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {avcAction === "VARY" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              You are applying to vary your existing AVC amount. Enter your current and new
              contribution amounts and the effective date.
            </div>
            {knownCurrentAmount != null ? (
              <LockedField
                label="Current Monthly Amount (KES)"
                value={knownCurrentAmount.toLocaleString()}
              />
            ) : (
              <div className="space-y-1">
                <Label>Current Monthly Amount (KES) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>New Monthly Amount (KES) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Effective Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {avcAction === "CANCEL" && (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Cancelling AVC contributions takes effect from the date you specify. If your
                employer has already deducted the current month&apos;s contribution, the
                effective date determines when cancellation applies.
              </AlertDescription>
            </Alert>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              You are applying to cancel your additional voluntary contributions.
            </div>
            {knownCurrentAmount != null && (
              <LockedField
                label="Current Monthly Amount (KES)"
                value={knownCurrentAmount.toLocaleString()}
              />
            )}
            <div className="space-y-1">
              <Label>Cancellation Effective Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="space-y-3 border-t border-gray-200 pt-6">
          <Label>Contribution Method <span className="text-red-500">*</span></Label>
          <RadioGroup
            value={avcMethod}
            onValueChange={(v) => setAvcMethod(v as AvcMethod)}
            className="space-y-3"
          >
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="PAYROLL" id="payroll" />
                <Label htmlFor="payroll" className="font-medium cursor-pointer">
                  Payroll Check-off
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Primary method — deducted from your salary. Requires employer HR confirmation.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="MOBILE_WALLET" id="wallet" />
                <Label htmlFor="wallet" className="font-medium cursor-pointer">
                  Mobile Wallet
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Optional — subject to PSSF approval. Routes directly to PSSF for processing.
              </p>
            </div>
          </RadioGroup>
        </div>

        {avcMethod === "MOBILE_WALLET" && (
          <div className="space-y-1">
            <Label>M-Pesa Number <span className="text-red-500">*</span></Label>
            <Input
              placeholder="+254712345678"
              value={mobileWalletNumber}
              onChange={(e) => setMobileWalletNumber(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/member/avc/details?case_id=${caseId}`)}
          >
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
  )
}
