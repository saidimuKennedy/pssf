"use client"

import Link from "next/link"
import { BadgeCheck, CheckCircle2, Clock, FileText, Lock, Search, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PssfLogo } from "@/components/pssf-logo"
import { cn } from "@/lib/utils"

const BADGES = [
  {
    icon: Shield,
    label: "Secure & Encrypted",
    sub: "Bank-level data security protocols",
    highlighted: false,
  },
  {
    icon: BadgeCheck,
    label: "Statutory Compliant",
    sub: "100% compliant with PSSF regulations",
    highlighted: true,
  },
  {
    icon: Clock,
    label: "Always Available",
    sub: "24/7 self-service portal access",
    highlighted: false,
  },
  {
    icon: FileText,
    label: "Paperless Process",
    sub: "Submit and track online instantly",
    highlighted: false,
  },
]

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-[#E8F5EE]/40 via-white to-[#EFF6FF]/40 pt-24 pb-20">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(26,122,74,0.12),rgba(255,255,255,0))]" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-[#1A7A4A]/8 blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 -left-32 size-96 rounded-full bg-[#0D2137]/5 blur-3xl" />
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_100%)] opacity-70" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[54%_46%] gap-12 lg:gap-10 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5EE] px-3.5 py-1.5 text-xs font-bold text-[#1A7A4A] border border-[#1A7A4A]/10">
              <Sparkles className="size-3.5 text-[#1A7A4A]" />
              PSSF Smart Self-Service
            </div>

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

            {/* Quick Stats sub-row */}
            <div className="flex items-center gap-8 py-3 border-y border-gray-150/70 max-w-md">
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#0D2137]">100%</p>
                <p className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">Compliant</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#0D2137]">24/7</p>
                <p className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">Self-Service</p>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#0D2137]">Real-Time</p>
                <p className="text-[10px] text-gray-500 font-bold tracking-wide uppercase">Tracking</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Button
                asChild
                size="lg"
                className="group bg-[#0D2137] hover:bg-[#12304b] text-white h-12 px-7 shadow-lg shadow-[#0D2137]/15 hover:shadow-xl hover:shadow-[#0D2137]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl duration-200 font-bold text-sm"
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
                className="glass-panel border-gray-250 text-[#0D2137] hover:bg-white/90 h-12 px-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl duration-200 font-bold text-sm"
              >
                <Link href="/track">
                  <Search className="size-4 mr-1.5 text-[#1A7A4A]" />
                  Track Request
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column — Branded preview card */}
          <div className="relative animate-float lg:pl-6">
            {/* Outer decorative glowing shadow */}
            <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr from-[#1A7A4A]/15 to-[#0D9488]/15 blur-2xl" aria-hidden />
            
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
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
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

            {/* Floating Guide / Watch Button (mockup style) */}
            <button className="absolute -left-6 bottom-12 group flex items-center gap-3 rounded-full bg-white p-2.5 pr-6 shadow-2xl border border-gray-100 transition-all duration-300 hover:scale-105 active:scale-98 cursor-pointer">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#1A7A4A] text-white transition-transform group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4.5 ml-0.5" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <div className="text-left">
                <p className="text-xs font-extrabold text-[#0D2137]">Watch Guide</p>
                <p className="text-[10px] text-gray-500">How it works (2 min)</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlapping Trust Badges Grid (bottom) */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 -mb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BADGES.map(({ icon: Icon, label, sub, highlighted }) => (
            <div
              key={label}
              className={cn(
                "group flex flex-col gap-2 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 shadow-premium hover:shadow-xl border",
                highlighted
                  ? "bg-[#0D2137] text-white border-transparent"
                  : "bg-white/95 border-gray-150/70 text-[#0D2137]"
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 shadow-inner",
                  highlighted
                    ? "bg-[#1A7A4A] text-white"
                    : "bg-[#E8F5EE] text-[#1A7A4A]"
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className={cn("text-sm font-bold mt-2", highlighted ? "text-[#5BD99A]" : "text-[#0D2137]")}>
                {label}
              </h3>
              <p className={cn("text-xs leading-normal", highlighted ? "text-gray-300" : "text-gray-500")}>
                {sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
