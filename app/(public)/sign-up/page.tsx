"use client"

import { useState, useActionState, useEffect, useTransition, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateMemberAction, sendSignUpOtpAction, activateAccountAction } from "./actions"
import { extractPhoneParam } from "@/lib/phone"
import { PssfLogo } from "@/components/pssf-logo"
import Link from "next/link"
import { 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Info, 
  Sparkles,
  Smartphone,
  Mail,
  Home,
  UserCheck
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "validate" | "review" | "access" | "otp" | "activated"

const STEPS: { key: Step; label: string }[] = [
  { key: "validate", label: "Verify" },
  { key: "review", label: "Profile" },
  { key: "access", label: "Access" },
  { key: "otp", label: "OTP Code" },
  { key: "activated", label: "Complete" },
]

function SignUpForm() {
  const searchParams = useSearchParams()
  const phoneFromUrl = extractPhoneParam(searchParams.get("phone"))

  const [step, setStep] = useState<Step>("validate")
  const [memberData, setMemberData] = useState<Record<string, string> | null>(null)
  const [phone, setPhone] = useState(phoneFromUrl)
  const [email, setEmail] = useState("")
  const [postalAddress, setPostalAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [town, setTown] = useState("")
  const [accessMethod, setAccessMethod] = useState<"otp" | "password">("otp")
  const [commPref, setCommPref] = useState<"PORTAL" | "WHATSAPP" | "EMAIL">("PORTAL")
  const [password, setPassword] = useState("")

  const [, startTransition] = useTransition()

  const [validateState, validate, validatePending] = useActionState(validateMemberAction, null)
  const [otpSendState, sendOtp, otpSendPending] = useActionState(sendSignUpOtpAction, null)
  const [activateState, activate, activatePending] = useActionState(activateAccountAction, null)

  function handleResend() {
    const fd = new FormData()
    fd.append("phone", phone)
    startTransition(() => sendOtp(fd))
  }

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
    if (activateState?.success) {
      if (activateState.registered) {
        window.location.href = "/login?registered=true"
      } else {
        setStep("activated")
      }
    }
  }, [activateState])

  const currentIdx = STEPS.findIndex((s) => s.key === step)

  function getValidateError(): string | null {
    if (!validateState?.error) return null
    const err = validateState.error
    if (typeof err === "string") return err
    const fieldErrors = (err as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {}
    return Object.values(fieldErrors).flat()[0] ?? "Validation failed."
  }

  const matchStatus = validateState?.matchStatus

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-12">
      {/* Outer Layout Wrapper — Multi-Step Wizard Card (Mockup Style) */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-200/80 shadow-premium overflow-hidden grid grid-cols-1 lg:grid-cols-[60%_40%]">
        
        {/* Left Column — Step Flow Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-8">
            
            {/* Mobile Header Logo */}
            <div className="lg:hidden flex justify-center mb-4">
              <PssfLogo priority width={120} height={68} />
            </div>

            {/* Custom Mockup Wizard Step Tracker */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 overflow-x-auto">
              {STEPS.map((s, idx) => {
                const done = idx < currentIdx
                const active = idx === currentIdx
                return (
                  <div key={s.key} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm",
                          done
                            ? "bg-[#1A7A4A] text-white"
                            : active
                              ? "bg-[#0D2137] text-white ring-4 ring-[#0D2137]/10"
                              : "bg-white border border-gray-200 text-gray-400"
                        )}
                      >
                        {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          active ? "text-[#0D2137]" : "text-gray-400"
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 w-6 sm:w-10 mx-2 mb-6 transition-colors",
                          idx < currentIdx ? "bg-[#1A7A4A]" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Step 1: Validate */}
            {step === "validate" && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-[#0D2137]">Verify your identity</h2>
                  <p className="text-xs text-gray-500">
                    Enter details exactly as they appear on your official records.
                  </p>
                </div>
                <form action={validate} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="national_id" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      National ID number
                    </Label>
                    <Input id="national_id" name="national_id" placeholder="e.g. 12345678" required className="h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="year_of_birth" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Year of birth
                    </Label>
                    <Input
                      id="year_of_birth"
                      name="year_of_birth"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                      placeholder="e.g. 1983"
                      required
                      className="h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone_validate" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Phone number
                    </Label>
                    <Input
                      id="phone_validate"
                      name="phone"
                      type="tel"
                      placeholder="+254700000000"
                      defaultValue={phoneFromUrl}
                      readOnly={!!phoneFromUrl}
                      required
                      className={cn(
                        "h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]",
                        phoneFromUrl && "bg-gray-50 text-gray-500 cursor-not-allowed"
                      )}
                    />
                  </div>

                  {matchStatus === "DOB_MISMATCH" && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-xl">
                      <AlertTriangle className="h-4 w-4 text-red-650" />
                      <AlertDescription className="text-xs text-red-700">
                        The birth year does not match records for this ID. Please double check, or{" "}
                        <Link href="/member/discrepancy" className="underline font-bold">
                          report a discrepancy
                        </Link>
                        .
                      </AlertDescription>
                    </Alert>
                  )}
                  {matchStatus === "NOT_FOUND" && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-xl">
                      <AlertTriangle className="h-4 w-4 text-red-650" />
                      <AlertDescription className="text-xs text-red-700">{getValidateError()}</AlertDescription>
                    </Alert>
                  )}
                  {matchStatus === "ALREADY_REGISTERED" && (
                    <Alert className="border-emerald-250 bg-emerald-50 rounded-xl">
                      <AlertDescription className="text-xs text-emerald-800">
                        An account already exists for this ID.{" "}
                        <Link href="/login" className="underline font-bold text-[#1A7A4A]">
                          Sign in instead
                        </Link>
                        .
                      </AlertDescription>
                    </Alert>
                  )}
                  {matchStatus === "NO_CONTACT" && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-xl">
                      <AlertTriangle className="h-4 w-4 text-red-650" />
                      <AlertDescription className="text-xs text-red-700">{getValidateError()}</AlertDescription>
                    </Alert>
                  )}
                  {!matchStatus && getValidateError() && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">{getValidateError()}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={validatePending}
                    className="w-full bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer mt-2"
                  >
                    {validatePending ? "Verifying Identity…" : "Verify Identity"}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Review */}
            {step === "review" && memberData && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-[#0D2137]">Review your details</h2>
                  <p className="text-xs text-gray-500">
                    Locked fields are verified from databases. Correct contact details below if needed.
                  </p>
                </div>
                
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {/* Verified Blocks */}
                  <div className="grid grid-cols-2 gap-3.5 bg-gray-50 border border-gray-150 p-4 rounded-2xl">
                    <p className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <UserCheck className="size-3.5 text-[#1A7A4A]" />
                      Verified Records
                    </p>
                    {[
                      { label: "Full name", value: memberData.full_name, span: true },
                      { label: "National ID", value: memberData.national_id, span: false },
                      { label: "Member Number", value: memberData.member_number, span: false },
                      { label: "Employer", value: memberData.employer_name, span: true }
                    ].map(({ label, value, span }) => (
                      <div key={label} className={cn("space-y-1", span ? "col-span-2" : "col-span-1")}>
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          {label}
                          <Lock className="size-2.5 text-gray-400" />
                        </Label>
                        <p className="text-xs font-bold text-[#0D2137] truncate">{value || "—"}</p>
                      </div>
                    ))}
                  </div>

                  <Alert className="border-amber-100 bg-amber-50 rounded-xl">
                    <AlertDescription className="text-amber-800 text-[11px] leading-normal">
                      Something wrong with locked records?{" "}
                      <Link href="/member/discrepancy" className="underline font-bold hover:text-amber-950">
                        Report discrepancy
                      </Link>{" "}
                      so PSSF can update it.
                    </AlertDescription>
                  </Alert>

                  <Separator className="bg-gray-150" />

                  {/* Form fields */}
                  <div className="space-y-3.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact details</p>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-gray-400">Mobile number</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Smartphone className="size-4" />
                        </span>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="pl-9 h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-400">Email address</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Mail className="size-4" />
                        </span>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="postal_address" className="text-xs font-bold uppercase tracking-wider text-gray-400">Postal address</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Home className="size-4" />
                        </span>
                        <Input
                          id="postal_address"
                          placeholder="P.O. Box 1234"
                          value={postalAddress}
                          onChange={(e) => setPostalAddress(e.target.value)}
                          className="pl-9 h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label htmlFor="postal_code" className="text-xs font-bold uppercase tracking-wider text-gray-400">Postal code</Label>
                        <Input
                          id="postal_code"
                          placeholder="00100"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="town" className="text-xs font-bold uppercase tracking-wider text-gray-400">Town / city</Label>
                        <Input
                          id="town"
                          placeholder="Nairobi"
                          value={town}
                          onChange={(e) => setTown(e.target.value)}
                          className="h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setStep("validate")}
                    className="flex-1 border-gray-250 hover:bg-gray-50 rounded-full h-11 text-xs font-bold text-[#0D2137] cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={!phone}
                    onClick={() => setStep("access")}
                    className="flex-1 bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold cursor-pointer transition-all active:scale-98 shadow-md"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Access */}
            {step === "access" && memberData && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-[#0D2137]">Set up access</h2>
                  <p className="text-xs text-gray-500">
                    Define authentication details and notification preferences.
                  </p>
                </div>

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Sign-in method</p>
                    <RadioGroup
                      value={accessMethod}
                      onValueChange={(v) => setAccessMethod(v as "otp" | "password")}
                      className="space-y-3"
                    >
                      <div className={cn("flex items-start gap-3 rounded-2xl border p-4 transition-all hover:bg-gray-50", accessMethod === "otp" && "border-[#1A7A4A] bg-[#E8F5EE]/10")}>
                        <RadioGroupItem value="otp" id="access-otp" className="mt-0.5" />
                        <Label htmlFor="access-otp" className="cursor-pointer space-y-0.5 flex-1">
                          <span className="text-xs font-extrabold text-[#0D2137]">One-Time Password (OTP) only</span>
                          <p className="text-[11px] text-gray-500 font-medium">
                            Request a cryptographically secure code to mobile on every login session.
                          </p>
                        </Label>
                      </div>
                      <div className={cn("flex items-start gap-3 rounded-2xl border p-4 transition-all hover:bg-gray-50", accessMethod === "password" && "border-[#1A7A4A] bg-[#E8F5EE]/10")}>
                        <RadioGroupItem value="password" id="access-password" className="mt-0.5" />
                        <Label htmlFor="access-password" className="cursor-pointer space-y-0.5 flex-1">
                          <span className="text-xs font-extrabold text-[#0D2137]">Password + OTP Verification</span>
                          <p className="text-[11px] text-gray-500 font-medium">
                            Secure your portal with a static password and confirm sessions via OTP.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {accessMethod === "password" && (
                    <div className="space-y-1.5 animate-in fade-in-50 duration-150">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-400">Choose a password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="h-11 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A]"
                        minLength={8}
                        required
                      />
                    </div>
                  )}

                  <Separator className="bg-gray-150" />

                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Notification preference</p>
                    <RadioGroup
                      value={commPref}
                      onValueChange={(v) => setCommPref(v as typeof commPref)}
                      className="space-y-3"
                    >
                      {[
                        { k: "PORTAL", label: "Portal Workspace only", desc: "Access messages and notification records directly inside the user dashboard." },
                        { k: "WHATSAPP", label: "WhatsApp Alerts", desc: "Receive immediate case milestones and tracking status alerts on your phone." },
                        { k: "EMAIL", label: "Direct Email Updates", desc: "Get detailed progress summaries and case letters sent directly to your inbox." }
                      ].map((item) => (
                        <div key={item.k} className={cn("flex items-start gap-3 rounded-2xl border p-4 transition-all hover:bg-gray-50", commPref === item.k && "border-[#1A7A4A] bg-[#E8F5EE]/10")}>
                          <RadioGroupItem value={item.k} id={`pref-${item.k}`} className="mt-0.5" />
                          <Label htmlFor={`pref-${item.k}`} className="cursor-pointer space-y-0.5 flex-1">
                            <span className="text-xs font-extrabold text-[#0D2137]">{item.label}</span>
                            <p className="text-[11px] text-gray-500 font-medium">{item.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                {otpSendState?.error && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">{otpSendState.error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setStep("review")}
                    className="flex-1 border-gray-250 hover:bg-gray-50 rounded-full h-11 text-xs font-bold text-[#0D2137] cursor-pointer"
                  >
                    Back
                  </Button>
                  <form action={sendOtp} className="flex-1">
                    <input type="hidden" name="phone" value={phone} />
                    <input type="hidden" name="email" value={email} />
                    <Button
                      type="submit"
                      disabled={
                        otpSendPending ||
                        !phone ||
                        (accessMethod === "password" && password.length < 8)
                      }
                      className="w-full bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold cursor-pointer transition-all active:scale-98 shadow-md"
                    >
                      {otpSendPending ? "Sending OTP…" : "Request OTP Code"}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Step 4: OTP verify */}
            {step === "otp" && memberData && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-[#0D2137]">Verify your account</h2>
                  <p className="text-xs text-gray-500">
                    Verify possession of your reviewed phone number to activate.
                  </p>
                </div>
                <form action={activate} className="space-y-4">
                  <input type="hidden" name="phone" value={phone} />
                  <input type="hidden" name="national_id" value={memberData.national_id} />
                  <input type="hidden" name="full_name" value={memberData.full_name} />
                  <input type="hidden" name="year_of_birth" value={memberData.year_of_birth ?? ""} />
                  <input type="hidden" name="kra_pin" value={memberData.kra_pin ?? ""} />
                  <input type="hidden" name="member_number" value={memberData.member_number ?? ""} />
                  <input type="hidden" name="personal_number" value={memberData.personal_number ?? ""} />
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="postal_address" value={postalAddress} />
                  <input type="hidden" name="postal_code" value={postalCode} />
                  <input type="hidden" name="town" value={town} />
                  <input type="hidden" name="access_method" value={accessMethod} />
                  <input type="hidden" name="communication_pref" value={commPref} />
                  {accessMethod === "password" && (
                    <input type="hidden" name="password" value={password} />
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-code" className="text-xs font-bold uppercase tracking-wider text-gray-400">Verification code</Label>
                    <Input
                      id="signup-code"
                      name="code"
                      type="text"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="ENTER CODE"
                      required
                      autoFocus
                      className="tracking-widest text-center text-lg font-bold h-12 rounded-xl border-gray-250 focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A]"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase()
                      }}
                    />
                    <p className="text-[10px] text-gray-500">
                      OTP code sent to mobile number <span className="font-semibold text-gray-750">{phone}</span>.
                    </p>
                  </div>

                  {activateState?.error && (
                    <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">{activateState.error}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("access")}
                      className="flex-1 border-gray-250 hover:bg-gray-50 rounded-full h-11 text-xs font-bold text-[#0D2137] cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={activatePending}
                      className="flex-1 bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full h-11 text-xs font-bold cursor-pointer transition-all active:scale-98 shadow-md"
                    >
                      {activatePending ? "Activating account…" : "Confirm Activation"}
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={otpSendPending}
                      className="text-xs font-bold text-[#1A7A4A] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {otpSendPending ? "Sending new code…" : "Resend one-time code"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 5: Activated */}
            {step === "activated" && (
              <div className="text-center space-y-5 py-4">
                <div className="flex justify-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-[#1A7A4A]">
                    <CheckCircle2 className="size-8" />
                  </span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-[#0D2137]">Account Activated!</h2>
                  <p className="text-xs leading-relaxed text-gray-500 max-w-sm mx-auto">
                    Your PSSF Smart Self-Service account is successfully activated. You can now access all pension tools, submit claim applications, nominate beneficiaries, and track requests.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button asChild className="w-full bg-[#1A7A4A] hover:bg-[#1A7A4A]/90 text-white rounded-full h-11 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-98">
                    <Link href="/member/dashboard">Go to Portal Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Footer sign in link */}
          {step !== "activated" && (
            <div className="mt-8 pt-4 border-t border-gray-150 text-center">
              <p className="text-xs text-gray-500">
                Already activated your account?{" "}
                <Link href="/login" className="text-[#1A7A4A] font-extrabold hover:underline inline-flex items-center gap-0.5">
                  Sign in here
                  <ArrowRight className="size-3 mt-0.5" />
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Right Column — Dynamic Context Sidebar Panel (Mockup Style) */}
        <div className="relative bg-[#0D2137] text-white p-10 flex flex-col justify-between overflow-hidden hidden lg:flex">
          {/* Background decorations */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 size-64 rounded-full bg-[#1A7A4A]/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 size-64 rounded-full bg-blue-500/5 blur-2xl" />
            <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] opacity-15" />
          </div>

          {/* Top Logo */}
          <div className="relative">
            <PssfLogo variant="onDark" width={120} height={70} className="opacity-95" />
          </div>

          {/* Dynamic help panels depending on the active step */}
          <div className="relative space-y-6 my-auto pt-6">
            
            {step === "validate" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h2 className="text-xl font-bold leading-tight">Identity verification</h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  To secure your statutory benefits, PSSF checks your identity records prior to registration.
                </p>
                <div className="space-y-3.5 pt-2">
                  {[
                    "Matches National ID and birth year with government HR payroll records.",
                    "Protects details from unauthorized access claims.",
                    "Provides secure foundation for digital pension statements."
                  ].map((txt, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
                      <span className="flex size-4.5 items-center justify-center rounded-full bg-[#1A7A4A] text-white shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                      <p>{txt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h2 className="text-xl font-bold leading-tight">Verify PSSF details</h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Double check locked records. If something appears incorrect, we will flag it for corrective action.
                </p>
                <div className="space-y-3.5 pt-2">
                  {[
                    "Locked name, ID, and employer details are official records from your ministry.",
                    "Contact info is used for direct verification and statements.",
                    "You can correct spelling and discrepancy flags via the helpline."
                  ].map((txt, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
                      <span className="flex size-4.5 items-center justify-center rounded-full bg-[#1A7A4A] text-white shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                      <p>{txt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "access" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h2 className="text-xl font-bold leading-tight">Access & updates</h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Choose an authentication workflow that suits your daily usage.
                </p>
                <div className="space-y-3.5 pt-2">
                  {[
                    "OTP authentication sends verification alerts for maximum compliance.",
                    "Password sign-in enables faster credential logging.",
                    "WhatsApp notifications provide real-time updates directly on your chat."
                  ].map((txt, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
                      <span className="flex size-4.5 items-center justify-center rounded-full bg-[#1A7A4A] text-white shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                      <p>{txt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h2 className="text-xl font-bold leading-tight">Security check</h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Confirm possession of the mobile number you verified in the profile step.
                </p>
                <div className="space-y-3.5 pt-2">
                  {[
                    "Protects your credentials from spoofing and account hijacking.",
                    "Verification code expires within 10 minutes.",
                    "You can resend a fresh verification token if it does not arrive."
                  ].map((txt, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
                      <span className="flex size-4.5 items-center justify-center rounded-full bg-[#1A7A4A] text-white shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                      <p>{txt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === "activated" && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <h2 className="text-xl font-bold leading-tight">Activation complete</h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  You are all set! Welcome to your digital PSSF portal workspace.
                </p>
                <div className="space-y-3.5 pt-2">
                  {[
                    "Instantly file pension statements and check contributions.",
                    "Update allocations and manage claims paper-free.",
                    "IT support and security guardrails active 24/7."
                  ].map((txt, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed">
                      <span className="flex size-4.5 items-center justify-center rounded-full bg-[#1A7A4A] text-white shrink-0 mt-0.5 text-[10px] font-bold">✓</span>
                      <p>{txt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Badge */}
          <div className="relative flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Lock className="size-3 text-[#5BD99A]" />
            Verification Guard active
          </div>

        </div>

      </div>
    </main>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading…</div>}>
      <SignUpForm />
    </Suspense>
  )
}
