"use client"

import { useState, useActionState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestOtpAction, verifyIdentityAction, otpLoginAction } from "./actions"
import { extractPhoneParam } from "@/lib/phone"
import { PssfLogo } from "@/components/pssf-logo"
import Link from "next/link"
import { Lock, Smartphone, ShieldCheck, ArrowRight, ArrowLeft, IdCard } from "lucide-react"

function LoginForm() {
  const searchParams = useSearchParams()
  const phoneFromUrl = extractPhoneParam(searchParams.get("phone"))

  const [step, setStep] = useState<"phone" | "identity" | "otp">(
    phoneFromUrl ? "identity" : "phone"
  )
  const [phone, setPhone] = useState(phoneFromUrl)
  const [code, setCode] = useState("")
  const [savedIdentity, setSavedIdentity] = useState<{ nationalId: string; yearOfBirth: string } | null>(null)

  const [otpRequestState, requestOtp, requestOtpPending] = useActionState(requestOtpAction, null)
  const [identityState, verifyIdentity, identityPending] = useActionState(verifyIdentityAction, null)
  const [otpLoginState, submitLogin, otpLoginPending] = useActionState(otpLoginAction, null)

  useEffect(() => {
    if (otpRequestState?.success) setStep("identity")
  }, [otpRequestState])

  useEffect(() => {
    if (identityState?.success) {
      setStep("otp")
      setCode("")
    }
  }, [identityState])

  function handleResend() {
    if (!savedIdentity) return
    const fd = new FormData()
    fd.append("phone", phone)
    fd.append("national_id", savedIdentity.nationalId)
    fd.append("year_of_birth", savedIdentity.yearOfBirth)
    verifyIdentity(fd)
  }

  const fromWhatsApp = !!phoneFromUrl

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200/80 shadow-premium overflow-hidden grid grid-cols-1 lg:grid-cols-[58%_42%]">

        {/* Left Column */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">

            <div className="lg:hidden flex justify-center mb-4">
              <PssfLogo priority width={120} height={68} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-[#0D2137]">Welcome back</h1>
              <p className="text-sm text-gray-500">
                {step === "phone" && "Enter your registered mobile number to continue."}
                {step === "identity" && "Verify your identity before we send your one-time code."}
                {step === "otp" && "We sent a 6-character code to your phone. Enter it below."}
              </p>
            </div>

            {/* Step 1: Phone — only shown when not coming from WhatsApp */}
            {step === "phone" && (
              <form
                action={async (fd) => {
                  setPhone(fd.get("phone") as string)
                  await requestOtp(fd)
                }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Smartphone className="size-4" />
                    </span>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. +254700000000"
                      defaultValue={phone}
                      required
                      autoFocus
                      className="pl-10 h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A]"
                    />
                  </div>
                </div>

                {otpRequestState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {otpRequestState.error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={requestOtpPending}
                  className="w-full bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {requestOtpPending ? "Checking…" : "Continue"}
                </Button>
              </form>
            )}

            {/* Step 2: Identity — National ID + Year of Birth */}
            {step === "identity" && (
              <form
                action={async (fd) => {
                  fd.append("phone", phone)
                  setSavedIdentity({
                    nationalId: fd.get("national_id") as string,
                    yearOfBirth: fd.get("year_of_birth") as string,
                  })
                  await verifyIdentity(fd)
                }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="national_id" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    National ID / Passport Number
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <IdCard className="size-4" />
                    </span>
                    <Input
                      id="national_id"
                      name="national_id"
                      type="text"
                      placeholder="e.g. 12345678"
                      required
                      autoFocus
                      className="pl-10 h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year_of_birth" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Year of Birth
                  </Label>
                  <Input
                    id="year_of_birth"
                    name="year_of_birth"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 1983"
                    required
                    className="h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A]"
                  />
                </div>

                {identityState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {identityState.error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={identityPending}
                  className="w-full bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {identityPending ? "Verifying…" : "Verify & Send Code"}
                </Button>

                {!fromWhatsApp && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1A7A4A] hover:underline"
                    >
                      <ArrowLeft className="size-3" />
                      Change number
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Step 3: OTP */}
            {step === "otp" && (
              <form action={submitLogin} className="space-y-4 pt-2">
                <input type="hidden" name="phone" value={phone} />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Verification Code
                    </Label>
                    <button
                      type="button"
                      onClick={() => setStep("identity")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1A7A4A] hover:underline"
                    >
                      <ArrowLeft className="size-3" />
                      Back
                    </button>
                  </div>

                  <Input
                    id="code"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                    maxLength={6}
                    placeholder="ENTER CODE"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="tracking-widest text-center text-lg font-bold h-12 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A]"
                  />

                  <p className="text-[10px] text-gray-500">
                    One-time code sent to <span className="font-semibold text-gray-700">{phone}</span>.
                  </p>
                </div>

                {otpLoginState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {otpLoginState.error}
                  </p>
                )}
                {identityState?.success && (
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
                    New verification code sent successfully.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={otpLoginPending || code.length < 4}
                  className="w-full bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {otpLoginPending ? "Verifying…" : "Sign In"}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={identityPending || !savedIdentity}
                    className="text-xs font-bold text-[#1A7A4A] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {identityPending ? "Sending new code…" : "Resend one-time code"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-150 text-center">
            <p className="text-xs text-gray-500">
              New public service member?{" "}
              <Link href="/sign-up" className="text-[#1A7A4A] font-extrabold hover:underline inline-flex items-center gap-0.5">
                Activate your account
                <ArrowRight className="size-3 mt-0.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column — Brand Banner */}
        <div className="relative bg-[#0D2137] text-white p-10 flex flex-col justify-between overflow-hidden hidden lg:flex">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 size-64 rounded-full bg-[#1A7A4A]/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 size-64 rounded-full bg-blue-500/5 blur-2xl" />
            <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] opacity-15" />
          </div>

          <div className="relative">
            <PssfLogo variant="onDark" width={120} height={70} className="opacity-95" />
          </div>

          <div className="relative space-y-6 my-auto pt-6">
            <h2 className="text-xl font-bold leading-tight">
              Access your secure pension portal
            </h2>
            <div className="space-y-4">
              {[
                "Always verify the site address is pssf.go.ke before signing in.",
                "PSSF will never ask you for your personal details or verification code over the phone.",
                "Ensure your registered mobile device is nearby to receive OTP alerts."
              ].map((text, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-300">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#1A7A4A] text-white shrink-0 mt-0.5">
                    <ShieldCheck className="size-3" />
                  </span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Lock className="size-3 text-[#5BD99A]" />
            Security Shield Enabled
          </div>
        </div>

      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
