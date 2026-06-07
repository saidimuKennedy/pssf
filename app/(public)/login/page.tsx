"use client"

import { useState, useActionState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestOtpAction, otpLoginAction, passwordLoginAction, passwordOtpLoginAction } from "./actions"
import { PssfLogo } from "@/components/pssf-logo"
import Link from "next/link"

export default function LoginPage() {
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone")
  const [phoneValue, setPhoneValue] = useState("")
  const [staffStep, setStaffStep] = useState<"credentials" | "otp">("credentials")
  const [staffEmail, setStaffEmail] = useState("")
  const [staffPassword, setStaffPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [otpRequestState, requestOtp, requestOtpPending] = useActionState(requestOtpAction, null)
  const [otpLoginState, otpLogin, otpLoginPending] = useActionState(otpLoginAction, null)
  const [passwordState, submitPassword, passwordPending] = useActionState(passwordLoginAction, null)
  const [staffOtpState, submitStaffOtp, staffOtpPending] = useActionState(passwordOtpLoginAction, null)

  useEffect(() => {
    if (otpRequestState?.success) setPhoneStep("otp")
  }, [otpRequestState])

  useEffect(() => {
    if (passwordState?.success) setStaffStep("otp")
  }, [passwordState])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + heading */}
        <div className="text-center space-y-1">
          <PssfLogo priority width={150} height={85} className="mx-auto" />
          <h1 className="text-2xl font-bold text-[#0D2137]">Welcome back</h1>
          <p className="text-sm text-[#6B7280]">Sign in to your account to continue</p>
        </div>

        <Tabs defaultValue="member" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="member">Member / Claimant</TabsTrigger>
            <TabsTrigger value="staff">Staff / Employer</TabsTrigger>
          </TabsList>

          {/* ── OTP tab ── */}
          <TabsContent value="member">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-[#0D2137]">Sign in with OTP</CardTitle>
                <CardDescription>Enter your registered phone number. We'll send you a one-time code via WhatsApp.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {phoneStep === "phone" ? (
                  <form
                    action={async (fd) => {
                      setPhoneValue(fd.get("phone") as string)
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
                        defaultValue={phoneValue}
                        required
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
                  <form action={otpLogin} className="space-y-4">
                    <input type="hidden" name="phone" value={phoneValue} />
                    <div className="space-y-1">
                      <Label htmlFor="otp-code">6-digit code</Label>
                      <Input
                        id="otp-code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        required
                        className="tracking-widest text-center text-lg"
                      />
                      <p className="text-xs text-[#6B7280]">
                        Sent to {phoneValue}.{" "}
                        <button
                          type="button"
                          onClick={() => setPhoneStep("phone")}
                          className="text-[#1A7A4A] underline"
                        >
                          Change
                        </button>
                      </p>
                    </div>
                    {otpLoginState?.error && (
                      <p className="text-sm text-[#DC2626]">{otpLoginState.error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={otpLoginPending}
                      className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                    >
                      {otpLoginPending ? "Verifying…" : "Sign in"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Password + OTP tab ── */}
          <TabsContent value="staff">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-[#0D2137]">Staff sign in</CardTitle>
                <CardDescription>Enter your email and password. An OTP will be sent to your registered phone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {staffStep === "credentials" ? (
                  <form
                    action={async (fd) => {
                      setStaffEmail(fd.get("email") as string)
                      setStaffPassword(fd.get("password") as string)
                      await submitPassword(fd)
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" name="email" type="email" placeholder="officer@pssf.go.ke" required />
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
                    <input type="hidden" name="email" value={staffEmail} />
                    <input type="hidden" name="password" value={staffPassword} />
                    <div className="space-y-1">
                      <Label htmlFor="staff-code">6-digit code</Label>
                      <Input
                        id="staff-code"
                        name="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        required
                        className="tracking-widest text-center text-lg"
                      />
                      <p className="text-xs text-[#6B7280]">
                        Sent to {staffEmail}.{" "}
                        <button
                          type="button"
                          onClick={() => setStaffStep("credentials")}
                          className="text-[#1A7A4A] underline"
                        >
                          Back
                        </button>
                      </p>
                    </div>
                    {staffOtpState?.error && (
                      <p className="text-sm text-[#DC2626]">{staffOtpState.error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={staffOtpPending}
                      className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                    >
                      {staffOtpPending ? "Verifying…" : "Sign in"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
