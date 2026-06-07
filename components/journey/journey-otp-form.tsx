"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const OTP_EXPIRY_SECONDS = 300

interface JourneyOtpFormProps {
  onVerified: () => void | Promise<void>
  submitLabel?: string
  loading?: boolean
  disabled?: boolean
}

export function JourneyOtpForm({
  onVerified,
  submitLabel = "Submit Application",
  loading = false,
  disabled = false,
}: JourneyOtpFormProps) {
  const [phone, setPhone] = useState<string | null>(null)
  const [otp, setOtp] = useState("")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const requestOtp = useCallback(async () => {
    if (!phone) {
      setError("No mobile number on your profile. Update your profile before submitting.")
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error === "RATE_LIMIT_EXCEEDED"
          ? "Too many OTP requests. Please try again later."
          : "Could not send verification code. Please try again.")
        return
      }
      setCountdown(body.expires_in ?? OTP_EXPIRY_SECONDS)
      setVerified(false)
    } finally {
      setSending(false)
    }
  }, [phone])

  useEffect(() => {
    fetch("/api/member/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        const mobile = profile?.mobile_number as string | undefined
        if (mobile) {
          setPhone(mobile)
        }
      })
      .catch(() => setError("Could not load your profile."))
  }, [])

  useEffect(() => {
    if (phone && countdown === 0 && !verified) {
      requestOtp()
    }
  }, [phone, countdown, verified, requestOtp])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [countdown])

  async function verifyAndSubmit() {
    setError(null)
    if (!phone) {
      setError("No mobile number on file.")
      return
    }
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code sent to your phone.")
      return
    }

    setVerifying(true)
    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: phone, code: otp }),
      })
      const verifyBody = await verifyRes.json()
      if (!verifyRes.ok) {
        if (verifyBody.error === "OTP_EXPIRED") {
          setError("Your verification code has expired. Please request a new one.")
        } else if (verifyBody.error === "OTP_INVALID") {
          const remaining = verifyBody.attempts_remaining
          setError(
            remaining != null && remaining > 0
              ? `Invalid code. ${remaining} attempt(s) remaining.`
              : "Invalid code. Please request a new one."
          )
        } else {
          setError("Verification failed. Please try again.")
        }
        return
      }

      setVerified(true)
      await onVerified()
    } finally {
      setVerifying(false)
    }
  }

  const busy = loading || verifying || sending

  return (
    <div className="space-y-4">
      {phone && (
        <p className="text-sm text-gray-500">
          A verification code will be sent to <strong>{phone}</strong>
        </p>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="journey-otp">Verification Code</Label>
        <Input
          id="journey-otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-widest font-mono"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          disabled={busy}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        {countdown > 0 ? (
          <span>Resend available in {countdown}s</span>
        ) : (
          <span>Code expired or not sent</span>
        )}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[#1A7A4A]"
          disabled={countdown > 0 || sending || !phone}
          onClick={requestOtp}
        >
          {sending ? "Sending…" : "Resend code"}
        </Button>
      </div>

      <Button
        type="button"
        disabled={busy || disabled || otp.length !== 6}
        onClick={verifyAndSubmit}
        className="w-full bg-[#1A7A4A] hover:bg-[#145f3a] text-white"
      >
        {verifying || loading ? "Submitting…" : submitLabel}
      </Button>
    </div>
  )
}
