"use client"

import { useState, useActionState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { otpLoginAction } from "../login/actions"
import { resendOtpAction } from "./actions"
import { PssfLogo } from "@/components/pssf-logo"

function VerifyOtpContent() {
  const params = useSearchParams()
  const phone = params.get("phone") ?? ""
  const email = params.get("email") ?? ""
  const identifier = phone || email

  const [code, setCode] = useState("")

  const [loginState, login, loginPending] = useActionState(otpLoginAction, null)
  const [resendState, resend, resendPending] = useActionState(resendOtpAction, null)

  const handleResend = () => {
    const fd = new FormData()
    if (phone) fd.append("phone", phone)
    if (email) fd.append("email", email)
    resend(fd)
  }

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
            <CardDescription>Enter the code sent to {identifier}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={login} className="space-y-4">
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="code" value={code} />
              <div className="space-y-1">
                <Label htmlFor="code-input">6-character code</Label>
                <Input
                  id="code-input"
                  type="text"
                  maxLength={6}
                  placeholder="ABC123"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  className="tracking-widest text-center text-lg"
                  autoComplete="one-time-code"
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
                disabled={loginPending || code.length < 4}
                className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
              >
                {loginPending ? "Verifying…" : "Verify"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendPending}
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
