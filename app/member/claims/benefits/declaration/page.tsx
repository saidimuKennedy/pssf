"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SignaturePad } from "@/components/ui/signature-pad"
import { BENEFITS_STEPS } from "@/lib/benefits/journey"
import { sendDeclarationOtpAction, verifyDeclarationOtpAction } from "./actions"

export default function BenefitsDeclarationPage() {
  const router = useRouter()
  const caseId = useSearchParams().get("case_id")

  const [accepted, setAccepted] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [masked, setMasked] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode() {
    if (!accepted) { setError("Accept the declaration before requesting a code."); return }
    setError(null)
    setSending(true)
    const res = await sendDeclarationOtpAction()
    setSending(false)
    if (res.error) { setError(res.error); return }
    setMasked(res.masked ?? null)
  }

  async function submit() {
    if (!accepted) { setError("Accept the declaration to proceed."); return }
    if (!otp) { setError("Enter the verification code sent to your phone."); return }
    setError(null)
    setVerifying(true)

    const verify = await verifyDeclarationOtpAction(otp)
    if (verify.error) { setError(verify.error); setVerifying(false); return }

    const getRes = await fetch(`/api/cases/${caseId}`)
    const existing = (await getRes.json()).form_data
    await fetch(`/api/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData: {
          ...existing,
          declaration_accepted: true,
          ...(signatureData ? { signature_data: signatureData } : {}),
        },
      }),
    })
    router.push(`/member/claims/benefits/preview?case_id=${caseId}`)
  }

  if (!caseId) return null

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={9} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Declaration</h1>
        <p className="text-sm text-gray-500 mt-1">Read and accept the declaration, then verify with the code sent to your phone.</p>
      </div>

      <div className="text-sm space-y-2 bg-gray-50 p-4 rounded border leading-relaxed">
        <p>Trustees have final discretion over benefit payments.</p>
        <p>My bank and M-Pesa details are correct.</p>
        <p>PSSF is not responsible for wrong payment details I provide.</p>
        <p>The information in this claim is true and correct.</p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="declaration"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(Boolean(v))}
        />
        <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
          I accept the declaration above.
        </Label>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-700">
          Drawn signature <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <SignaturePad onChange={setSignatureData} />
      </div>

      {/* OTP section */}
      <div className="space-y-3 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-bold text-[#0D2137]">Verification Code</Label>
            {masked
              ? <p className="text-xs text-gray-400 mt-0.5">Code sent to {masked}</p>
              : <p className="text-xs text-gray-400 mt-0.5">We'll send a code to your registered phone</p>
            }
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={sendCode}
            disabled={sending || !accepted}
            className="shrink-0 text-xs"
          >
            {sending ? "Sending…" : masked ? "Resend" : "Send Code"}
          </Button>
        </div>

        <Input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
          maxLength={6}
          className="text-center font-mono tracking-widest text-lg"
          placeholder="— — — — — —"
          autoComplete="one-time-code"
          disabled={!masked}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={submit}
        disabled={!accepted || !otp || verifying}
        className="w-full bg-[#7C3AED] hover:bg-[#6d28d9] text-white"
      >
        {verifying ? "Verifying…" : "Continue"}
      </Button>
    </div>
  )
}
