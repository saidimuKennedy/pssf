"use client"

import { useState, useActionState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { passwordLoginAction, passwordOtpLoginAction } from "../actions"
import { PssfLogo } from "@/components/pssf-logo"
import Link from "next/link"

export default function AdminLoginPage() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState("")

  const [passwordState, submitPassword, passwordPending] = useActionState(passwordLoginAction, null)
  const [staffOtpState, submitStaffOtp, staffOtpPending] = useActionState(passwordOtpLoginAction, null)

  useEffect(() => {
    if (passwordState?.success) {
      setStep("otp")
      setCode("")
    }
  }, [passwordState])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <PssfLogo priority width={150} height={85} className="mx-auto" />
          <h1 className="text-2xl font-bold text-[#0D2137]">Staff sign in</h1>
          <p className="text-sm text-[#6B7280]">
            {step === "credentials"
              ? "Enter your email and password to continue."
              : "Enter the code sent to your registered phone."}
          </p>
        </div>

        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-[#0D2137]">
              {step === "credentials" ? "Credentials" : "Verification"}
            </CardTitle>
            <CardDescription>
              {step === "credentials"
                ? "An OTP will be sent to your registered phone number after verification."
                : `Code sent to your registered phone.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "credentials" ? (
              <form
                action={async (fd) => {
                  setEmail(fd.get("email") as string)
                  setPassword(fd.get("password") as string)
                  await submitPassword(fd)
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" placeholder="officer@pssf.go.ke" required autoFocus />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#6B7280] hover:text-[#0D2137]"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {passwordState?.error && (
                  <p className="text-sm text-[#DC2626]">{passwordState.error}</p>
                )}
                <Button
                  type="submit"
                  disabled={passwordPending}
                  className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                >
                  {passwordPending ? "Checking…" : "Continue"}
                </Button>
              </form>
            ) : (
              <form action={submitStaffOtp} className="space-y-4">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="password" value={password} />
                <div className="space-y-1">
                  <Label htmlFor="code">Verification code</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                    maxLength={6}
                    placeholder="Enter code"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="tracking-widest text-center text-lg"
                  />
                  <p className="text-xs text-[#6B7280] pt-1">
                    <button
                      type="button"
                      onClick={() => setStep("credentials")}
                      className="text-[#1A7A4A] underline"
                    >
                      Back to credentials
                    </button>
                  </p>
                </div>
                {staffOtpState?.error && (
                  <p className="text-sm text-[#DC2626]">{staffOtpState.error}</p>
                )}
                <Button
                  type="submit"
                  disabled={staffOtpPending || code.length < 4}
                  className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                >
                  {staffOtpPending ? "Verifying…" : "Sign in"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-[#6B7280]">
          Member?{" "}
          <Link href="/login" className="text-[#1A7A4A] font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  )
}
