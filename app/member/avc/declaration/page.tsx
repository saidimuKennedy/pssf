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
import { AVC_STEPS } from "@/lib/avc/journey"


export default function AVCDeclarationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")

  const [accepted, setAccepted] = useState(false)
  const [otp, setOtp] = useState("")
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start your AVC request again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  async function handleContinue() {
    if (!accepted) {
      setError("You must accept the statutory declaration to proceed.")
      return
    }
    if (otp.length !== 6) {
      setError("Please enter the 6-character verification code sent to your phone.")
      return
    }


    setError(null)
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
            declaration_accepted: true,
            declaration_otp_verified: true,
            ...(signatureData ? { signature_data: signatureData } : {}),
          },
        }),
      })

      if (!res.ok) {
        setError("Failed to save declaration. Please try again.")
        return
      }

      router.push(`/member/avc/preview?case_id=${caseId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={4} />

      <div>
        <h1 className="text-xl font-bold text-[#0D2137]">Statutory Declaration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Read the declaration below, accept it, and confirm with the OTP sent to your mobile.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700 space-y-3 leading-relaxed">
        <p>
          I declare that the information provided in this AVC application is complete and correct
          in every respect.
        </p>
        <p>
          I understand that regular voluntary contributions must be preserved until I am eligible
          for benefits under the Scheme.
        </p>
        <p>
          I agree to be bound by the Public Service Superannuation Scheme Regulations and all
          related laws governing additional voluntary contributions.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="declaration"
          checked={accepted}
          onCheckedChange={(v) => setAccepted(Boolean(v))}
        />
        <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
          I have read, understood, and accept all three declaration points above.
        </Label>
      </div>



      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-700">
          Drawn signature <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <SignaturePad onChange={setSignatureData} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp">Verification Code</Label>
        <Input
          id="otp"
          type="text"
          maxLength={6}
          placeholder="ABC123"
          className="text-center text-xl tracking-widest font-mono"
          value={otp}
          autoComplete="one-time-code"
          onChange={(e) => setOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/member/avc/action?case_id=${caseId}`)}
        >
          Back
        </Button>
        <Button
          type="button"
          disabled={loading || !accepted || otp.length !== 6}
          onClick={handleContinue}
          className="flex-1 bg-[#16A34A] hover:bg-[#145f3a] text-white"
        >
          {loading ? "Verifying…" : "Verify & Continue"}
        </Button>
      </div>
    </div>
  )
}
