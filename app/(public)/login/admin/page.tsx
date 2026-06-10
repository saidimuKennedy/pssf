"use client"

import { useState, useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { passwordLoginAction, passwordOtpLoginAction } from "../actions"
import { PssfLogo } from "@/components/pssf-logo"
import Link from "next/link"
import { Lock, Mail, ShieldAlert, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react"

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
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-10">
      {/* Outer Layout Wrapper — Two-Column Card (Mockup Style) */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200/80 shadow-premium overflow-hidden grid grid-cols-1 lg:grid-cols-[58%_42%]">
        
        {/* Left Column — Credentials / Verification Forms */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex justify-center mb-4">
              <PssfLogo priority width={120} height={68} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-[#0D2137]">Staff sign in</h1>
              <p className="text-sm text-gray-500">
                {step === "credentials"
                  ? "Enter your official credentials to request secondary verification."
                  : "Enter the code sent to your registered security phone."}
              </p>
            </div>

            {step === "credentials" ? (
              <form
                action={async (fd) => {
                  setEmail(fd.get("email") as string)
                  setPassword(fd.get("password") as string)
                  await submitPassword(fd)
                }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Official Email
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Mail className="size-4" />
                    </span>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="officer@pssf.go.ke"
                      required
                      autoFocus
                      className="pl-10 h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Password
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Lock className="size-4" />
                    </span>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pl-10 pr-10 h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-[#0D2137] cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {passwordState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {passwordState.error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={passwordPending}
                  className="w-full bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {passwordPending ? "Checking credentials…" : "Verify Credentials"}
                </Button>
              </form>
            ) : (
              <form action={submitStaffOtp} className="space-y-4 pt-2">
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="password" value={password} />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Verification Code
                    </Label>
                    <button
                      type="button"
                      onClick={() => setStep("credentials")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1A7A4A] hover:underline"
                    >
                      <ArrowLeft className="size-3" />
                      Back to credentials
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
                    Secondary OTP code sent to official registered mobile device for <span className="font-semibold text-gray-700">{email}</span>.
                  </p>
                </div>

                {staffOtpState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                    {staffOtpState.error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={staffOtpPending || code.length < 4}
                  className="w-full bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {staffOtpPending ? "Signing in…" : "Confirm Access"}
                </Button>
              </form>
            )}
          </div>

          {/* Footer Back Link */}
          <div className="mt-8 pt-4 border-t border-gray-150 text-center">
            <p className="text-xs text-gray-500">
              Regular public service member?{" "}
              <Link href="/login" className="text-[#1A7A4A] font-extrabold hover:underline inline-flex items-center gap-0.5">
                Sign in here
                <ArrowRight className="size-3 mt-0.5" />
              </Link>
            </p>
          </div>

        </div>

        {/* Right Column — Administration Info Panel (Mockup Style) */}
        <div className="relative bg-[#0D2137] text-white p-10 flex flex-col justify-between overflow-hidden hidden lg:flex">
          {/* Background decorations */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 size-64 rounded-full bg-[#1A7A4A]/20 blur-2xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 size-64 rounded-full bg-blue-500/5 blur-2xl" />
            <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] opacity-15" />
          </div>

          {/* Top Logo */}
          <div className="relative">
            <PssfLogo variant="onDark" width={120} height={70} className="opacity-95" />
          </div>

          {/* Mid security text checklist */}
          <div className="relative space-y-6 my-auto pt-6">
            <h2 className="text-xl font-bold leading-tight">
              Authorized PSSF staff portal
            </h2>
            <div className="space-y-4">
              {[
                "This is a restricted access administration console for PSSF operators.",
                "All login attempts and updates are cryptographically signed and logged for audit.",
                "Report credential anomalies immediately to IT Security Operations (SOC)."
              ].map((text, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-300">
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-white shrink-0 mt-0.5">
                    <ShieldAlert className="size-3" />
                  </span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom security designation */}
          <div className="relative flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Lock className="size-3 text-red-500" />
            Administrative Domain
          </div>

        </div>

      </div>
    </main>
  )
}
