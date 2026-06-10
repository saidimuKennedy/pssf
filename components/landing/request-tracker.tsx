"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Mail,
  MessageSquare,
  Monitor,
  Smartphone,
} from "lucide-react"

const REQUESTS = [
  {
    name: "Beneficiary Update",
    id: "BF-2024-000123",
    status: "Approved",
    statusColor: "#10B981",
    statusBg: "rgba(16, 185, 129, 0.15)",
    pulseColor: "bg-emerald-400",
    dotColor: "bg-emerald-500",
    detail: "Completed on 12 May 2024",
    icon: CheckCircle2,
    iconColor: "#10B981",
  },
  {
    name: "AVC Application",
    id: "AVC-2024-000456",
    status: "Under Review",
    statusColor: "#F59E0B",
    statusBg: "rgba(245, 158, 11, 0.15)",
    pulseColor: "bg-amber-400",
    dotColor: "bg-amber-500",
    detail: "Last updated today, 09:42 AM",
    icon: Clock,
    iconColor: "#F59E0B",
  },
  {
    name: "Missing Contribution",
    id: "MC-2024-000789",
    status: "More Info Required",
    statusColor: "#3B82F6",
    statusBg: "rgba(59, 130, 246, 0.15)",
    pulseColor: "bg-blue-400",
    dotColor: "bg-blue-500",
    detail: "Updated on 10 May 2024",
    icon: Info,
    iconColor: "#3B82F6",
  },
]

const CHANNELS = [
  { icon: Smartphone, label: "SMS" },
  { icon: MessageSquare, label: "WhatsApp" },
  { icon: Mail, label: "Email" },
  { icon: Monitor, label: "Portal" },
]

export function RequestTracker() {
  return (
    <section className="bg-[#0D2137] py-20 lg:py-24 relative overflow-hidden border-y border-white/5 text-white">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-10 size-96 rounded-full bg-[#1A7A4A]/10 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 left-10 size-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_100%)] opacity-15" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] gap-12 lg:gap-16 items-center">
          {/* Left Column — Header & Status Lists */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#5BD99A]">
                Stay informed
              </p>
              <h2 className="mt-2.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Track your requests from anywhere, anytime
              </h2>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-md">
                Follow every statutory application, claims request, and voluntary contribution updates from submission to approval.
              </p>
            </div>
            
            {/* Dark glass status list */}
            <div className="space-y-4 pt-2">
              {REQUESTS.map((req) => {
                const Icon = req.icon
                return (
                  <div
                    key={req.id}
                    className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:border-white/10 hover:bg-white/10 hover:shadow-lg"
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/5 shadow-inner transition-transform duration-300 group-hover:scale-105"
                    >
                      <Icon className="size-5.5" style={{ color: req.iconColor }} aria-hidden />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-white">{req.name}</p>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border"
                          style={{ 
                            backgroundColor: req.statusBg, 
                            color: req.statusColor, 
                            borderColor: `${req.statusColor}20` 
                          }}
                        >
                          <span className="relative flex size-1.5">
                            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 animate-duration-1000", req.pulseColor)} />
                            <span className={cn("relative inline-flex rounded-full size-1.5", req.dotColor)} />
                          </span>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">{req.id}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{req.detail}</p>
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                )
              })}
            </div>
            
            <div className="pt-2">
              <Link
                href="/track"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5BD99A] hover:text-[#5BD99A]/80 transition-colors"
              >
                Track existing request
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          {/* Right Column — Notification Registration Form (Mockup Style) */}
          <div className="relative">
            <div aria-hidden className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-[#1A7A4A]/20 to-blue-500/20 blur-xl" />
            
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-md">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 mb-6 shadow-inner animate-pulse-slow">
                <Bell className="size-5.5 text-[#5BD99A]" aria-hidden />
              </div>
              
              <h3 className="text-xl font-bold">Get real-time updates</h3>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                Choose your preferred channel to receive instant progress alerts:
              </p>
              
              {/* Channel Selector Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {CHANNELS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/20 transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    <Icon className="size-4 text-[#5BD99A]" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
              
              {/* Form Input fields (Mockup Style) */}
              <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-3.5">
                <div>
                  <label htmlFor="contact-field" className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                    Phone Number or Email Address
                  </label>
                  <input
                    id="contact-field"
                    type="text"
                    placeholder="e.g. +254 700 000 000 or email@domain.com"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#5BD99A]/50 focus:border-[#5BD99A]/50 transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1A7A4A] hover:bg-[#1A7A4A]/90 active:scale-99 transition-all text-xs font-bold py-3 text-white shadow-lg cursor-pointer"
                >
                  Subscribe to Notifications
                </button>
              </form>
              
              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5BD99A] hover:text-[#5BD99A]/80 transition-colors"
                >
                  Manage alert preferences
                  <ChevronRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
