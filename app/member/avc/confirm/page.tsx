"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Loader2 } from "lucide-react"
import { AVC_STEPS } from "@/lib/avc/journey"
import { JourneyOtpForm } from "@/components/journey/journey-otp-form"
import { startAvcStkPush, getAvcPaymentStatus } from "../mpesa-actions"

type PayPhase = "idle" | "pushing" | "waiting" | "failed"

const POLL_INTERVAL_MS = 3_000
const MAX_POLLS = 40 // ~2min — wait for Safaricom's callback

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function AVCConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case_id")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [method, setMethod] = useState<string>("PAYROLL")
  const [amount, setAmount] = useState<number>(0)
  const [mpesaNumber, setMpesaNumber] = useState<string>("")
  const [payPhase, setPayPhase] = useState<PayPhase>("idle")
  const [payMessage, setPayMessage] = useState<string>("")

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/cases/${caseId}`)
      .then((r) => r.json())
      .then((d) => {
        const fd = (d.form_data as Record<string, unknown>) ?? {}
        setMethod(String(fd.avc_method ?? "PAYROLL"))
        setAmount(Number(fd.new_amount ?? 0))
        setMpesaNumber(String(fd.mobile_wallet_number ?? ""))
      })
      .catch(() => {})
  }, [caseId])

  const isMobileWallet = method === "MOBILE_WALLET" && amount > 0

  if (!caseId) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Invalid session. Please start your AVC request again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  async function submitCase() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarationAccepted: true, otpVerified: true }),
      })

      if (!res.ok) {
        const body = await res.json()
        if (body.code === "OTP_REQUIRED") {
          setError("OTP verification expired. Please verify again.")
          return
        }
        setError(body.error ?? "Submission failed.")
        return
      }

      const data = await res.json()
      sessionStorage.removeItem("avc_prefill")
      router.push(
        `/member/avc/submitted?reference=${encodeURIComponent(data.reference ?? caseId)}&status=${data.status ?? "SUBMITTED"}&method=${method ?? "PAYROLL"}`
      )
    } finally {
      setLoading(false)
    }
  }

  // For mobile-wallet contributions, collect the money via M-Pesa STK before
  // submitting the case. We poll stkpushquery because localhost can't receive
  // Safaricom's callback.
  async function collectThenSubmit() {
    setError(null)
    setPayPhase("pushing")
    setPayMessage("Sending M-Pesa request to " + mpesaNumber + "…")

    const start = await startAvcStkPush(caseId!)
    if (!start.success || !start.checkoutRequestId) {
      setPayPhase("failed")
      setPayMessage(start.message)
      return
    }

    setPayPhase("waiting")
    setPayMessage(start.message)

    // Poll our own DB; Safaricom's callback flips the case to PAID/FAILED.
    for (let i = 0; i < MAX_POLLS; i++) {
      await sleep(POLL_INTERVAL_MS)
      const status = await getAvcPaymentStatus(caseId!)
      if (status.status === "PAID") {
        setPayPhase("idle")
        setPayMessage(status.receipt ? `Payment confirmed (${status.receipt}).` : "Payment confirmed.")
        await submitCase()
        return
      }
      if (status.status === "FAILED") {
        setPayPhase("failed")
        setPayMessage(status.message || "Payment was cancelled or failed. Please try again.")
        return
      }
    }

    setPayPhase("failed")
    setPayMessage("Timed out waiting for M-Pesa confirmation. Please try again.")
  }

  async function handleVerified() {
    if (isMobileWallet) {
      await collectThenSubmit()
    } else {
      await submitCase()
    }
  }

  const busy = loading || payPhase === "pushing" || payPhase === "waiting"

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={6} />
      <h1 className="text-xl font-bold text-[#0D2137]">Confirm Submission</h1>

      {isMobileWallet && (
        <Alert className="border-emerald-200 bg-emerald-50">
          <Smartphone className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800">
            On confirming, an M-Pesa prompt for{" "}
            <span className="font-semibold">KES {amount.toLocaleString()}</span> will be sent to{" "}
            <span className="font-semibold">{mpesaNumber}</span>. Enter your PIN to complete the
            contribution.
          </AlertDescription>
        </Alert>
      )}

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {payPhase === "pushing" || payPhase === "waiting" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
          <p className="font-medium text-emerald-900">
            {payPhase === "pushing" ? "Sending M-Pesa request…" : "Waiting for your M-Pesa PIN…"}
          </p>
          <p className="text-sm text-emerald-700">{payMessage}</p>
          <p className="text-xs text-gray-500">Do not close this page.</p>
        </div>
      ) : payPhase === "failed" ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{payMessage}</AlertDescription>
          </Alert>
          <Button
            type="button"
            onClick={collectThenSubmit}
            className="w-full bg-[#16A34A] hover:bg-[#145f3a] text-white"
          >
            Retry M-Pesa payment
          </Button>
        </div>
      ) : (
        <JourneyOtpForm onVerified={handleVerified} loading={busy} />
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => router.push(`/member/avc/preview?case_id=${caseId}`)}
        disabled={busy}
      >
        Back
      </Button>
    </div>
  )
}
