"use client"

import { useState, useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestOtpAction, otpLoginAction } from "./actions"
import { PssfLogo } from "@/components/pssf-logo"
import Link from "next/link"
import { Lock, Smartphone, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react"

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
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-10">
      {/* Outer Layout Wrapper — Two-Column Card (Mockup Style) */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200/80 shadow-premium overflow-hidden grid grid-cols-1 lg:grid-cols-[58%_42%]">
        
        {/* Left Column — Interactive Form Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex justify-center mb-4">
              <PssfLogo priority width={120} height={68} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-[#0D2137]">Welcome back</h1>
              <p className="text-sm text-gray-500">
                {step === "phone" 
                  ? "Enter your registered mobile number to request a one-time password." 
                  : "We sent a 6-character code to your phone. Enter it below."}
              </p>
            </div>

            {step === "phone" ? (
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
                  {requestOtpPending ? "Sending code…" : "Send One-Time Code"}
                </Button>
              </form>
            ) : (
              <form action={submitLogin} className="space-y-4 pt-2">
                <input type="hidden" name="phone" value={phone} />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Verification Code
                    </Label>
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1A7A4A] hover:underline"
                    >
                      <ArrowLeft className="size-3" />
                      Change number
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
                    One-time code sent to verified mobile <span className="font-semibold text-gray-700">{phone}</span>.
                  </p>
                </div>

                {otpLoginState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {otpLoginState.error}
                  </p>
                )}
                {otpRequestState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {otpRequestState.error}
                  </p>
                )}
                {otpRequestState?.success && (
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
                    disabled={requestOtpPending}
                    className="text-xs font-bold text-[#1A7A4A] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {requestOtpPending ? "Sending new code…" : "Resend one-time code"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Activation Link */}
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

        {/* Right Column — Brand Branded Banner (Mockup Style) */}
        <div className="relative bg-[#0D2137] text-white p-10 flex flex-col justify-between overflow-hidden hidden lg:flex">
          {/* Background overlay decorations */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 size-64 rounded-full bg-[#1A7A4A]/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 size-64 rounded-full bg-blue-500/5 blur-2xl" />
            <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] opacity-15" />
          </div>

          {/* Top Branding Logo */}
          <div className="relative">
            <PssfLogo variant="onDark" width={120} height={70} className="opacity-95" />
          </div>

          {/* Mid branding & check list */}
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

          {/* Bottom Security Info */}
          <div className="relative flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Lock className="size-3 text-[#5BD99A]" />
            Security Shield Enabled
          </div>

        </div>

      </div>
    </main>
  )
}
