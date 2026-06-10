"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
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
import { Button } from "@/components/ui/button"

interface ServiceCard {
  name: string
  description: string
  icon: LucideIcon
  color: string
  bg: string
  href: string
  hoverGlow: string
}

const SERVICES: ServiceCard[] = [
  {
    name: "Member Enrolment",
    description: "Register and activate your pension membership online.",
    icon: UserPlus,
    color: "#1A7A4A",
    bg: "#E8F5EE",
    href: "/member/enrolment",
    hoverGlow: "hover:shadow-[#1A7A4A]/10 hover:border-[#1A7A4A]/30",
  },
  {
    name: "Beneficiary Nomination",
    description: "Nominate beneficiaries and manage allocations.",
    icon: Users,
    color: "#2563EB",
    bg: "#EFF6FF",
    href: "/member/beneficiaries",
    hoverGlow: "hover:shadow-[#2563EB]/10 hover:border-[#2563EB]/30",
  },
  {
    name: "AVC Contributions",
    description: "Start, vary or cancel additional voluntary contributions.",
    icon: TrendingUp,
    color: "#16A34A",
    bg: "#ECFDF5",
    href: "/member/avc",
    hoverGlow: "hover:shadow-[#16A34A]/10 hover:border-[#16A34A]/30",
  },
  {
    name: "Benefits Claim",
    description: "Submit your retirement or exit benefits claim.",
    icon: FileText,
    color: "#7C3AED",
    bg: "#F5F3FF",
    href: "/member/claims/benefits",
    hoverGlow: "hover:shadow-[#7C3AED]/10 hover:border-[#7C3AED]/30",
  },
  {
    name: "Death Benefits Claim",
    description: "File a claim on behalf of a deceased member.",
    icon: Heart,
    color: "#E11D48",
    bg: "#FFF1F2",
    href: "/member/claims/death",
    hoverGlow: "hover:shadow-[#E11D48]/10 hover:border-[#E11D48]/30",
  },
  {
    name: "Contribution Statement",
    description: "View and download your contribution history.",
    icon: Building,
    color: "#0D2137",
    bg: "#F1F5F9",
    href: "/member/statements",
    hoverGlow: "hover:shadow-[#0D2137]/10 hover:border-[#0D2137]/30",
  },
  {
    name: "Missing Contribution",
    description: "Report contributions missing from your statement.",
    icon: AlertCircle,
    color: "#D97706",
    bg: "#FFFBEB",
    href: "/member/statements/missing",
    hoverGlow: "hover:shadow-[#D97706]/10 hover:border-[#D97706]/30",
  },
]

export function ServicesGrid() {
  return (
    <section id="services" className="relative bg-white pt-40 pb-20 lg:pt-48 lg:pb-24 overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 size-[500px] rounded-full bg-[#1A7A4A]/3 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-[500px] rounded-full bg-[#2563EB]/3 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Split Header layout (Mockup Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#1A7A4A]">
              Services & Features
            </p>
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2137] max-w-lg leading-tight">
              We provide the best self-service pension solutions
            </h2>
          </div>
          <div className="lg:text-right space-y-3">
            <p className="text-sm leading-relaxed text-gray-500 max-w-md lg:ml-auto">
              Access secure online tools to update details, nominate beneficiaries, submit claims, and track contributions.
            </p>
            <a 
              href="#how-it-works" 
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A7A4A] hover:text-[#1A7A4A]/80 transition-colors"
            >
              See how it works
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.href}
                href={service.href}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/50 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 shadow-premium hover:shadow-xl hover:bg-white",
                  service.hoverGlow
                )}
              >
                {/* Accent bar */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  style={{ backgroundColor: service.color }}
                />
                
                {/* Circular Icon Container (Mockup Style) */}
                <div
                  className="mb-6 flex size-14 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105 shadow-sm border border-transparent group-hover:border-gray-100"
                  style={{ backgroundColor: service.bg }}
                >
                  <Icon className="size-6 transition-transform duration-300 group-hover:rotate-3" style={{ color: service.color }} aria-hidden />
                </div>
                
                <h3 className="mb-2.5 text-lg font-bold leading-snug text-[#0D2137] transition-colors group-hover:text-black">
                  {service.name}
                </h3>
                
                <p className="flex-1 text-sm leading-relaxed text-gray-500">
                  {service.description}
                </p>
                
                <div className="mt-6">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-gray-250 hover:bg-[#0D2137] hover:text-white transition-all text-xs font-bold text-[#0D2137] h-9 px-4 cursor-pointer"
                  >
                    <div>
                      Get started
                      <ArrowRight className="size-3 ml-1.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Button>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
