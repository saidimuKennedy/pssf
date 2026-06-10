"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BENEFITS_STEPS, getBenefitsSkippedSteps, BENEFIT_OPTION_TEXT } from "@/lib/benefits/journey"

export default function BenefitsPreviewPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")
  const [fd, setFd] = useState<Record<string, unknown>>({})
  const [previewConfirmed, setPreviewConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (caseId) fetch(`/api/cases/${caseId}`).then((r) => r.json()).then((d) => setFd(d.form_data as Record<string, unknown>))
  }, [caseId])

  async function save() {
    if (!previewConfirmed) { setError("Confirm payment details again to proceed."); return }
    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ formData: { ...existing, preview_payment_confirmed: true } }) })
    router.push(`/member/claims/benefits/confirm?case_id=${caseId}`)
  }

  if (!caseId) return null
  const opt = fd.benefit_option as string | undefined
  const missingPayment = !fd.bank_name || !fd.bank_account_number
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={10} skippedSteps={getBenefitsSkippedSteps(fd)} />
      <h1 className="text-xl font-bold text-[#0D2137]">Review Claim</h1>
      <div className="text-sm bg-blue-50 border border-blue-200 p-3 rounded">This will be sent to your employer for exit confirmation, then to PSSF.</div>
      {missingPayment && (
        <Alert variant="destructive">
          <AlertDescription>
            Payment details are incomplete.{" "}
            <button className="underline font-medium" onClick={() => router.push(`/member/claims/benefits/payment?case_id=${caseId}`)}>
              Go back and fill in bank details.
            </button>
          </AlertDescription>
        </Alert>
      )}
      <div className="border rounded p-4 text-sm space-y-1">
        <p><strong>Bank:</strong> {(fd.bank_name as string) ?? "—"} — {(fd.bank_account_number as string) ?? "—"}{fd.bank_branch ? ` (${fd.bank_branch})` : ""}</p>
        <p><strong>Leaving:</strong> {(fd.date_of_leaving as string) ?? "—"} — {((fd.reason_for_leaving as string) ?? "—").replace(/_/g, " ")}</p>
        {opt && <p><strong>Option:</strong> {BENEFIT_OPTION_TEXT[opt]?.title}</p>}
        {fd.mpesa_number && <p><strong>M-Pesa:</strong> {fd.mpesa_number as string}</p>}
      </div>
      <div className="flex gap-2"><Checkbox checked={previewConfirmed} onCheckedChange={(v) => setPreviewConfirmed(Boolean(v))} id="p" /><Label htmlFor="p">I confirm payment details are correct (second confirmation)</Label></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Button onClick={save} disabled={missingPayment} className="w-full bg-[#7C3AED] text-white">Continue to Submit</Button>
    </div>
  )
}
