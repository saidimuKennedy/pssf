"use client"

import { useState, useActionState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestOtpAction, otpLoginAction } from "./actions"
import { PssfLogo } from "@/components/pssf-logo"
import Link from "next/link"

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")

  const [otpRequestState, requestOtp, requestOtpPending] = useActionState(requestOtpAction, null)
  const [otpLoginState, submitLogin, otpLoginPending] = useActionState(otpLoginAction, null)

  useEffect(() => {
    if (otpRequestState?.success) {
      setStep("otp")
      setCode("")
    }
  }, [otpRequestState])

  function handleResend() {
    const fd = new FormData()
    fd.append("phone", phone)
    requestOtp(fd)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <PssfLogo priority width={150} height={85} className="mx-auto" />
          <h1 className="text-2xl font-bold text-[#0D2137]">Welcome back</h1>
          <p className="text-sm text-[#6B7280]">Sign in to your account to continue</p>
        </div>

        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-[#0D2137]">Sign in with OTP</CardTitle>
            <CardDescription>
              {step === "phone"
                ? "Enter your registered phone number. We'll send you a one-time code."
                : `Code sent to ${phone}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "phone" ? (
              <form
                action={async (fd) => {
                  setPhone(fd.get("phone") as string)
                  await requestOtp(fd)
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+254700000000"
                    defaultValue={phone}
                    required
                    autoFocus
                  />
                </div>
                {otpRequestState?.error && (
                  <p className="text-sm text-[#DC2626]">{otpRequestState.error}</p>
                )}
                <Button
                  type="submit"
                  disabled={requestOtpPending}
                  className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                >
                  {requestOtpPending ? "Sending…" : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form action={submitLogin} className="space-y-4">
                <input type="hidden" name="phone" value={phone} />
                <div className="space-y-1">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                    maxLength={6}
                    placeholder="ABC123"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="tracking-widest text-center text-lg"
                  />
                  <p className="text-xs text-[#6B7280] pt-1">
                    Sent to {phone}.{" "}
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-[#1A7A4A] underline"
                    >
                      Change
                    </button>
                  </p>
                </div>

                {otpLoginState?.error && (
                  <p className="text-sm text-[#DC2626]">{otpLoginState.error}</p>
                )}
                {otpRequestState?.error && (
                  <p className="text-sm text-[#DC2626]">{otpRequestState.error}</p>
                )}
                {otpRequestState?.success && (
                  <p className="text-sm text-[#16A34A]">New code sent.</p>
                )}

                <Button
                  type="submit"
                  disabled={otpLoginPending || code.length < 4}
                  className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                >
                  {otpLoginPending ? "Verifying…" : "Sign in"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={requestOtpPending}
                    className="text-sm text-[#1A7A4A] hover:underline disabled:opacity-40 disabled:no-underline"
                  >
                    {requestOtpPending ? "Sending…" : "Resend code"}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-[#6B7280]">
          New member?{" "}
          <Link href="/sign-up" className="text-[#1A7A4A] font-medium hover:underline">
            Activate your account
          </Link>
        </p>
      </div>
    </main>
  )
}
