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
    statusBg: "#ECFDF5",
    pulseColor: "bg-emerald-400",
    dotColor: "bg-emerald-500",
    detail: "Completed on 12 May 2024",
    icon: CheckCircle2,
    iconColor: "#10B981",
    iconBg: "from-emerald-50/40 to-emerald-100/10",
  },
  {
    name: "AVC Application",
    id: "AVC-2024-000456",
    status: "Under Review",
    statusColor: "#F59E0B",
    statusBg: "#FFFBEB",
    pulseColor: "bg-amber-400",
    dotColor: "bg-amber-500",
    detail: "Last updated today, 09:42 AM",
    icon: Clock,
    iconColor: "#F59E0B",
    iconBg: "from-amber-50/40 to-amber-100/10",
  },
  {
    name: "Missing Contribution",
    id: "MC-2024-000789",
    status: "More Information Required",
    statusColor: "#3B82F6",
    statusBg: "#EFF6FF",
    pulseColor: "bg-blue-400",
    dotColor: "bg-blue-500",
    detail: "Updated on 10 May 2024",
    icon: Info,
    iconColor: "#3B82F6",
    iconBg: "from-blue-50/40 to-blue-100/10",
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
    <section className="bg-white py-20 lg:py-24 relative overflow-hidden border-b border-gray-100">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 right-10 size-96 rounded-full bg-[#1A7A4A]/3 blur-3xl" />
        <div className="absolute top-1/3 left-10 size-96 rounded-full bg-[#0D2137]/3 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1A7A4A]">
              Stay informed
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#0D2137]">
              Track your requests
            </h2>
            <p className="mt-3 mb-8 text-base text-gray-500">
              Follow every submission from start to finish, in real time.
            </p>
            
            <div className="space-y-4">
              {REQUESTS.map((req) => {
                const Icon = req.icon
                return (
                  <div
                    key={req.id}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200/50 bg-white/60 p-4 transition-all duration-300 hover:border-gray-200 hover:bg-white hover:shadow-lg"
                  >
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: "#F9FAFB" }}
                    >
                      <Icon className="size-5" style={{ color: req.iconColor }} aria-hidden />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-[#0D2137]">{req.name}</p>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border shadow-sm"
                          style={{ 
                            backgroundColor: req.statusBg, 
                            color: req.statusColor, 
                            borderColor: `${req.statusColor}15` 
                          }}
                        >
                          <span className="relative flex size-1.5">
                            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", req.pulseColor)} />
                            <span className={cn("relative inline-flex rounded-full size-1.5", req.dotColor)} />
                          </span>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">{req.id}</p>
                      <p className="text-[11px] text-gray-500 mt-1">{req.detail}</p>
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </div>
                )
              })}
            </div>
            
            <Link
              href="/track"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#1A7A4A] hover:gap-2.5 transition-all"
            >
              Track all requests
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>

          {/* Right — notification card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2137] via-[#12304b] to-[#0D2137] p-8 text-white shadow-2xl border border-white/5">
            <div aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-[#1A7A4A]/25 blur-3xl animate-pulse-slow" />
            <div aria-hidden className="absolute -bottom-16 -left-16 size-56 rounded-full bg-[#0D2137]/40 blur-3xl" />
            
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 mb-6 shadow-inner animate-pulse-slow">
                <Bell className="size-5.5 text-[#5BD99A]" aria-hidden />
              </div>
              <h3 className="text-xl font-bold">Get real-time updates</h3>
              <p className="mt-2.5 text-sm text-gray-300 leading-relaxed">
                Receive notifications on your preferred channel — no need to check back manually.
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                {CHANNELS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium ring-1 ring-white/10 hover:bg-white/10 transition-all cursor-default shadow-sm"
                  >
                    <Icon className="size-4 text-[#5BD99A]" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
              
              <Link
                href="/login"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5BD99A] hover:gap-2.5 transition-all"
              >
                Manage notifications
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
