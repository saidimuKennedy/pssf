"use client"

import { useState, useActionState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { validateMemberAction, sendSignUpOtpAction, activateAccountAction } from "./actions"
import Link from "next/link"
import { CheckCircle2, Lock } from "lucide-react"

type Step = "validate" | "review" | "access" | "otp" | "activated"

const STEPS: { key: Step; label: string }[] = [
  { key: "validate", label: "Validate" },
  { key: "review", label: "Review" },
  { key: "access", label: "Access" },
  { key: "otp", label: "Verify" },
  { key: "activated", label: "Done" },
]

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("validate")
  const [memberData, setMemberData] = useState<Record<string, string> | null>(null)
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [postalAddress, setPostalAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [town, setTown] = useState("")
  const [accessMethod, setAccessMethod] = useState<"otp" | "password">("otp")
  const [password, setPassword] = useState("")

  const [validateState, validate, validatePending] = useActionState(validateMemberAction, null)
  const [otpSendState, sendOtp, otpSendPending] = useActionState(sendSignUpOtpAction, null)
  const [activateState, activate, activatePending] = useActionState(activateAccountAction, null)

  useEffect(() => {
    if (validateState?.success && validateState.member) {
      const m = validateState.member as Record<string, string>
      setMemberData(m)
      setPhone(m.mobile_number ?? "")
      setEmail(m.email ?? "")
      setPostalAddress(m.postal_address ?? "")
      setPostalCode(m.postal_code ?? "")
      setTown(m.town ?? "")
      setStep("review")
    }
  }, [validateState])

  useEffect(() => {
    if (otpSendState?.success) setStep("otp")
  }, [otpSendState])

  useEffect(() => {
    if (activateState?.success) setStep("activated")
  }, [activateState])

  const currentIdx = STEPS.findIndex((s) => s.key === step)

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1A7A4A]" />
            <span className="text-xl font-bold text-[#0D2137]">PSSF</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0D2137]">Activate your account</h1>
          <p className="text-sm text-[#6B7280]">
            New to the platform? Verify your identity to get started.
          </p>
        </div>

        <div className="flex items-center justify-between px-2 overflow-x-auto">
          {STEPS.map((s, idx) => {
            const done = idx < currentIdx
            const active = idx === currentIdx
            return (
              <div key={s.key} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      done
                        ? "bg-[#1A7A4A] text-white"
                        : active
                        ? "bg-[#0D2137] text-white"
                        : "bg-white border-2 border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs ${active ? "text-[#0D2137] font-medium" : "text-[#6B7280]"}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-8 sm:w-12 mx-1 sm:mx-2 mb-5 transition-colors ${idx < currentIdx ? "bg-[#1A7A4A]" : "bg-[#E5E7EB]"}`} />
                )}
              </div>
            )
          })}
        </div>

        {step === "validate" && (
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-[#0D2137]">Verify your identity</CardTitle>
              <CardDescription>
                Enter your National ID number and date of birth exactly as they appear on your records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={validate} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="national_id">National ID number</Label>
                  <Input id="national_id" name="national_id" placeholder="e.g. 12345678" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date_of_birth">Date of birth</Label>
                  <Input id="date_of_birth" name="date_of_birth" type="date" required />
                </div>
                {validateState?.error != null && (() => {
                  const err = validateState.error
                  const msg = typeof err === "string"
                    ? err
                    : Object.values((err as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {}).flat()[0] ?? "Validation failed."
                  return <p className="text-sm text-[#DC2626]">{msg}</p>
                })()}
                <Button
                  type="submit"
                  disabled={validatePending}
                  className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                >
                  {validatePending ? "Checking…" : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "review" && memberData && (
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-[#0D2137]">Review your details</CardTitle>
              <CardDescription>
                Locked fields cannot be changed here — open a discrepancy report if something is wrong.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { label: "Full name", value: memberData.full_name, locked: true },
                  { label: "National ID", value: memberData.national_id, locked: true },
                  { label: "Date of birth", value: memberData.date_of_birth, locked: true },
                  { label: "Employer", value: memberData.employer_name, locked: true },
                  { label: "Member number", value: memberData.member_number, locked: true },
                ].map(({ label, value, locked }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Label className="text-xs text-[#6B7280]">{label}</Label>
                      {locked && <Lock className="w-3 h-3 text-[#6B7280]" />}
                    </div>
                    <div className={`px-3 py-2 rounded-md text-sm border ${locked ? "bg-[#F5F5F5] border-[#E5E7EB] text-[#6B7280]" : "bg-white border-[#E5E7EB]"}`}>
                      {value || "—"}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#0D2137]">Contact details</p>
                <div className="space-y-1">
                  <Label htmlFor="phone">Mobile number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254700000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postal_address">Postal address</Label>
                  <Input
                    id="postal_address"
                    placeholder="P.O. Box 1234"
                    value={postalAddress}
                    onChange={(e) => setPostalAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="postal_code">Postal code</Label>
                    <Input
                      id="postal_code"
                      placeholder="00100"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="town">Town / city</Label>
                    <Input
                      id="town"
                      placeholder="Nairobi"
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep("validate")}
                  className="flex-1 border-[#0D2137] text-[#0D2137]"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  disabled={!phone}
                  onClick={() => setStep("access")}
                  className="flex-1 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "access" && memberData && (
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-[#0D2137]">Set up access</CardTitle>
              <CardDescription>
                Choose how you would like to sign in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={accessMethod}
                onValueChange={(v) => setAccessMethod(v as "otp" | "password")}
                className="space-y-3"
              >
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <RadioGroupItem value="otp" id="access-otp" className="mt-0.5" />
                  <Label htmlFor="access-otp" className="cursor-pointer space-y-0.5">
                    <span className="font-medium">OTP only</span>
                    <p className="text-xs text-[#6B7280] font-normal">
                      Sign in with a one-time code sent to your mobile each time.
                    </p>
                  </Label>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <RadioGroupItem value="password" id="access-password" className="mt-0.5" />
                  <Label htmlFor="access-password" className="cursor-pointer space-y-0.5">
                    <span className="font-medium">Password + OTP</span>
                    <p className="text-xs text-[#6B7280] font-normal">
                      Set a password for faster sign-in, confirmed with OTP.
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {accessMethod === "password" && (
                <div className="space-y-1">
                  <Label htmlFor="password">Choose a password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                  />
                </div>
              )}

              {otpSendState?.error && (
                <p className="text-sm text-[#DC2626]">{otpSendState.error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setStep("review")}
                  className="flex-1 border-[#0D2137] text-[#0D2137]"
                >
                  Back
                </Button>
                <form action={sendOtp} className="flex-1">
                  <input type="hidden" name="phone" value={phone} />
                  <Button
                    type="submit"
                    disabled={
                      otpSendPending ||
                      !phone ||
                      (accessMethod === "password" && password.length < 8)
                    }
                    className="w-full bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                  >
                    {otpSendPending ? "Sending…" : "Send OTP"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "otp" && memberData && (
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-[#0D2137]">Verify your phone</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-[#111827]">{phone}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={activate} className="space-y-4">
                <input type="hidden" name="phone" value={phone} />
                <input type="hidden" name="national_id" value={memberData.national_id} />
                <input type="hidden" name="full_name" value={memberData.full_name} />
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="postal_address" value={postalAddress} />
                <input type="hidden" name="postal_code" value={postalCode} />
                <input type="hidden" name="town" value={town} />
                <input type="hidden" name="access_method" value={accessMethod} />
                {accessMethod === "password" && (
                  <input type="hidden" name="password" value={password} />
                )}
                <div className="space-y-1">
                  <Label htmlFor="signup-code">6-digit code</Label>
                  <Input
                    id="signup-code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    required
                    autoFocus
                    className="tracking-widest text-center text-lg"
                  />
                </div>
                {process.env.NODE_ENV === "development" && (
                  <p className="text-xs text-[#6B7280] bg-[#F5F5F5] rounded-md px-3 py-2">
                    Development mode — use OTP: <strong>123456</strong>
                  </p>
                )}
                {activateState?.error && (
                  <p className="text-sm text-[#DC2626]">{activateState.error}</p>
                )}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("access")}
                    className="flex-1 border-[#0D2137] text-[#0D2137]"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={activatePending}
                    className="flex-1 bg-[#0D2137] hover:bg-[#0D2137]/90 text-white"
                  >
                    {activatePending ? "Activating…" : "Activate account"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "activated" && (
          <Card className="border-[#E5E7EB]">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-[#1A7A4A]" />
              </div>
              <h2 className="text-lg font-semibold text-[#0D2137]">Account activated</h2>
              <p className="text-sm text-[#6B7280]">
                Your account is ready. You are signed in and can access the member portal.
              </p>
              <Badge variant="outline" className="text-[#1A7A4A] border-[#1A7A4A]">Active</Badge>
              <Button asChild className="w-full bg-[#1A7A4A] hover:bg-[#145f3a] text-white">
                <Link href="/member/dashboard">Go to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-[#6B7280]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#1A7A4A] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
