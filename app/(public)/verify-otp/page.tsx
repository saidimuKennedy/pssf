"use client"

import { useState, useActionState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { otpLoginAction } from "../login/actions"
import { resendOtpAction } from "./actions"
import { PssfLogo } from "@/components/pssf-logo"

const OTP_TTL = 300 // 5 minutes

function VerifyOtpContent() {
  const params = useSearchParams()
  const phone = params.get("phone") ?? ""
  const email = params.get("email") ?? ""
  const identifier = phone || email

  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [loginState, login, loginPending] = useActionState(otpLoginAction, null)
  const [resendState, resend, resendPending] = useActionState(resendOtpAction, null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [])

  const handleResend = () => {
    setSecondsLeft(OTP_TTL)
    const fd = new FormData()
    if (phone) fd.append("phone", phone)
    if (email) fd.append("email", email)
    resend(fd)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0")
  const ss = String(secondsLeft % 60).padStart(2, "0")

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <PssfLogo priority width={150} height={85} className="mx-auto" />
          <h1 className="text-2xl font-bold text-[#0D2137]">Enter your code</h1>
          <p className="text-sm text-[#6B7280]">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[#111827]">{identifier}</span>
          </p>
        </div>

        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-[#0D2137]">Verification code</CardTitle>
            <CardDescription>
              {secondsLeft > 0 ? (
                <>
                  Code expires in{" "}
                  <span className="font-mono text-[#0D2137]">{mm}:{ss}</span>
                </>
              ) : (
                <span className="text-[#DC2626]">Code expired. Request a new one.</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={login} className="space-y-4">
              <input type="hidden" name="phone" value={phone} />
              <div className="space-y-1">
                <Label htmlFor="code">6-digit code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  required
                  disabled={secondsLeft === 0}
                  className="tracking-widest text-center text-lg"
                  autoFocus
                />
              </div>

              {loginState?.error && (
                <p className="text-sm text-[#DC2626]">{loginState.error}</p>
              )}
              {resendState?.error && (
                <p className="text-sm text-[#DC2626]">{resendState.error}</p>
              )}
              {resendState?.success && (
                <p className="text-sm text-[#16A34A]">New code sent.</p>
              )}

              <Button
                type="submit"
                disabled={loginPending || secondsLeft === 0}
                className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
              >
                {loginPending ? "Verifying…" : "Verify"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendPending || secondsLeft > 240}
                className="text-sm text-[#1A7A4A] hover:underline disabled:opacity-40 disabled:no-underline"
              >
                {resendPending ? "Sending…" : "Resend code"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpContent />
    </Suspense>
  )
}
