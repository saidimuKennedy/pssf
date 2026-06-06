import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  AlertCircle,
  ArrowRight,
  Building,
  FileText,
  Heart,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"

interface ServiceCard {
  name: string
  description: string
  icon: LucideIcon
  color: string
  bg: string
  href: string
}

const SERVICES: ServiceCard[] = [
  {
    name: "Member Enrolment",
    description: "Register and activate your pension membership online.",
    icon: UserPlus,
    color: "#1A7A4A",
    bg: "#E8F5EE",
    href: "/member/enrolment",
  },
  {
    name: "Beneficiary Nomination",
    description: "Nominate beneficiaries and manage allocations.",
    icon: Users,
    color: "#2563EB",
    bg: "#EFF6FF",
    href: "/member/beneficiaries",
  },
  {
    name: "AVC Contributions",
    description: "Start, vary or cancel additional voluntary contributions.",
    icon: TrendingUp,
    color: "#16A34A",
    bg: "#ECFDF5",
    href: "/member/avc",
  },
  {
    name: "Benefits Claim",
    description: "Submit your retirement or exit benefits claim.",
    icon: FileText,
    color: "#7C3AED",
    bg: "#F5F3FF",
    href: "/member/claims/benefits",
  },
  {
    name: "Death Benefits Claim",
    description: "File a claim on behalf of a deceased member.",
    icon: Heart,
    color: "#E11D48",
    bg: "#FFF1F2",
    href: "/member/claims/death",
  },
  {
    name: "Contribution Statement",
    description: "View and download your contribution history.",
    icon: Building,
    color: "#0D2137",
    bg: "#F1F5F9",
    href: "/member/statements",
  },
  {
    name: "Missing Contribution",
    description: "Report contributions missing from your statement.",
    icon: AlertCircle,
    color: "#D97706",
    bg: "#FFFBEB",
    href: "/member/statements/missing",
  },
]

export function ServicesGrid() {
  return (
    <section id="services" className="bg-white dark:bg-gray-900 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-[28px] font-bold text-[#0D2137] dark:text-white">
            How can we help you today?
          </h2>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-gray-400">
            Choose a service to get started
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.href}
                href={service.href}
                className="group flex flex-col rounded-lg border border-[#E5E7EB] bg-white p-4 transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
              >
                <div
                  className="mb-3 flex size-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: service.bg }}
                >
                  <Icon className="size-5" style={{ color: service.color }} aria-hidden />
                </div>
                <h3 className="text-sm font-bold text-[#0D2137] dark:text-white mb-1 leading-snug">
                  {service.name}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-gray-400 flex-1 leading-relaxed">
                  {service.description}
                </p>
                <ArrowRight
                  className="mt-3 size-4 transition-transform group-hover:translate-x-0.5"
                  style={{ color: service.color }}
                  aria-hidden
                />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
