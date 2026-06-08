import Link from "next/link"
import { BadgeCheck, CheckCircle2, Clock, FileText, Lock, Search, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PssfLogo } from "@/components/pssf-logo"

const TRUST_BADGES = [
  { icon: Shield, label: "Secure & Encrypted", sub: "Bank-level security" },
  { icon: BadgeCheck, label: "Statutory Compliant", sub: "100% compliant" },
  { icon: Clock, label: "Always Available", sub: "24/7 Self-service" },
  { icon: FileText, label: "Paperless Process", sub: "Save time & resources" },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F5EE]/40 via-white to-[#EFF6FF]/40 pt-24 pb-16">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(26,122,74,0.12),rgba(255,255,255,0))]" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-[#1A7A4A]/8 blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 -left-32 size-96 rounded-full bg-[#0D2137]/5 blur-3xl" />
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_100%)] opacity-70" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[54%_46%] gap-12 lg:gap-10 items-center">
          {/* Left */}
          <div className="space-y-7">
          

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight">
              <span className="text-[#0D2137]">Your pension.</span>
              <br />
              <span className="bg-gradient-to-r from-[#1A7A4A] via-[#0D9488] to-[#10B981] bg-clip-text text-transparent">
                Your future. Our priority.
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-gray-500">
              A secure, simple and faster way to manage your pension services online. Submit
              requests, upload documents, track progress and receive real-time updates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <Button
                asChild
                size="lg"
                className="group bg-[#0D2137] hover:bg-[#12304b] text-white h-12 px-7 shadow-lg shadow-[#0D2137]/15 hover:shadow-xl hover:shadow-[#0D2137]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl duration-200 font-medium"
              >
                <Link href="/login">
                  <Lock className="size-4 mr-1.5 transition-transform group-hover:scale-110" />
                  Access Portal
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="glass-panel border-gray-250 text-[#0D2137] hover:bg-white/90 h-12 px-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl duration-200 font-medium"
              >
                <Link href="/track">
                  <Search className="size-4 mr-1.5 text-[#1A7A4A]" />
                  Track Existing Request
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-150">
              {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="group flex flex-col gap-1.5 p-3 rounded-xl hover:bg-white/40 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-white/50">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#E8F5EE] to-[#EFF6FF] group-hover:scale-105 transition-transform">
                    <Icon className="size-4.5 text-[#1A7A4A]" aria-hidden />
                  </span>
                  <p className="text-xs font-bold text-[#0D2137]">{label}</p>
                  <p className="text-[10px] text-gray-500 leading-snug">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — branded preview card */}
          <div className="relative animate-float">
            {/* Outer decorative glowing shadow */}
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-[#1A7A4A]/15 to-[#0D9488]/15 blur-2xl" aria-hidden />
            
            {/* Main window container */}
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#0D2137] via-[#12304B] to-[#0D2137] p-6 sm:p-8 shadow-2xl ring-1 ring-white/10">
              
              {/* Simulated window controls */}
              <div className="absolute top-4 right-6 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-white/10" />
                <span className="size-2 rounded-full bg-white/10" />
                <span className="size-2 rounded-full bg-white/10" />
              </div>
              
              {/* Brand Logo & sync badge */}
              <div className="flex items-center justify-between border-b border-white/5 pb-5">
                <PssfLogo
                  variant="onDark"
                  width={110}
                  height={60}
                  priority
                  className="opacity-95"
                />
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Live Sync</span>
                </div>
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-[#5BD99A]/80">
                Request Tracker
              </p>

              {/* mock tracked request card */}
              <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-5 ring-1 ring-white/5 backdrop-blur-md shadow-inner">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Benefits Claim</p>
                    <p className="text-[11px] text-gray-400">Ref: BF-2024-000123</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 px-3 py-1 text-[11px] font-medium text-[#5BD99A] shadow-sm shadow-emerald-900/20">
                    <CheckCircle2 className="size-3" aria-hidden />
                    Approved
                  </span>
                </div>

                {/* progress timeline */}
                <div className="mt-5 flex items-center gap-2">
                  {[true, true, true, true, false].map((done, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${done ? "bg-[#1A7A4A] shadow-sm shadow-[#1A7A4A]" : "bg-white/15"}`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>Submitted</span>
                  <span>Completed</span>
                </div>
              </div>

              {/* mini stat row */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { k: "Channels", v: "4" },
                  { k: "Avg. update", v: "Real-time" },
                  { k: "Availability", v: "24/7" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white/5 border border-white/5 p-3 ring-1 ring-white/5 text-center">
                    <p className="text-sm font-bold text-white leading-tight">{s.v}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
