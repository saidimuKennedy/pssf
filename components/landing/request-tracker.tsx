import Link from "next/link"
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
    statusColor: "#16A34A",
    detail: "Completed on 12 May 2024",
    icon: CheckCircle2,
    iconColor: "#16A34A",
  },
  {
    name: "AVC Application",
    id: "AVC-2024-000456",
    status: "Under Review",
    statusColor: "#D97706",
    detail: "Last updated today, 09:42 AM",
    icon: Clock,
    iconColor: "#D97706",
  },
  {
    name: "Missing Contribution",
    id: "MC-2024-000789",
    status: "More Information Required",
    statusColor: "#2563EB",
    detail: "Updated on 10 May 2024",
    icon: Info,
    iconColor: "#2563EB",
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
    <section className="bg-white dark:bg-gray-900 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          {/* Left */}
          <div>
            <h2 className="text-[28px] font-bold text-[#0D2137] dark:text-white">
              Track your requests
            </h2>
            <p className="mt-2 text-sm text-[#6B7280] dark:text-gray-400 mb-6">
              Stay updated in real time
            </p>
            <div className="space-y-3">
              {REQUESTS.map((req) => {
                const Icon = req.icon
                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 rounded-lg border border-[#E5E7EB] bg-white p-4 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <Icon className="size-5 shrink-0" style={{ color: req.iconColor }} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0D2137] dark:text-white">{req.name}</p>
                      <p className="text-[10px] text-[#6B7280] dark:text-gray-400">{req.id}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: req.statusColor }}>
                        {req.status}
                      </p>
                      <p className="text-[10px] text-[#6B7280] dark:text-gray-400">{req.detail}</p>
                    </div>
                    <ChevronRight className="size-4 text-[#6B7280] shrink-0" aria-hidden />
                  </div>
                )
              })}
            </div>
            <Link
              href="/track"
              className="inline-block mt-4 text-sm font-medium text-[#1A7A4A] hover:underline"
            >
              Track all requests →
            </Link>
          </div>

          {/* Right — notification card */}
          <div className="rounded-xl bg-[#0D2137] p-8 text-white">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#1A7A4A]/20 mb-4">
              <Bell className="size-6 text-[#1A7A4A]" aria-hidden />
            </div>
            <h3 className="text-lg font-bold">Get real-time updates</h3>
            <p className="mt-2 text-sm text-gray-300">
              Receive notifications on your preferred channel.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CHANNELS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1 text-xs"
                >
                  <Icon className="size-3.5" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm font-medium text-[#1A7A4A] hover:underline"
            >
              Manage notifications →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
