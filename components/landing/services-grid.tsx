"use client"

import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  BarChart2,
  Building,
  FileText,
  Heart,
  TrendingUp,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react"
import { PssfCarousel } from "@/components/ui/pssf-carousel"

const SERVICES = [
  {
    name: "Member Enrolment",
    desc: "Register and activate your pension membership online.",
    icon: UserPlus,
    color: "#1A7A4A",
    bg: "#E8F5EE",
    href: "/member/enrolment",
  },
  {
    name: "Beneficiary Nomination",
    desc: "Nominate beneficiaries and manage allocations.",
    icon: Users,
    color: "#2563EB",
    bg: "#EFF6FF",
    href: "/member/beneficiaries",
  },
  {
    name: "AVC Contributions",
    desc: "Start, vary or cancel additional voluntary contributions.",
    icon: TrendingUp,
    color: "#16A34A",
    bg: "#ECFDF5",
    href: "/member/avc",
  },
  {
    name: "Benefits Claim",
    desc: "Submit your retirement or exit benefits claim.",
    icon: FileText,
    color: "#7C3AED",
    bg: "#F5F3FF",
    href: "/member/claims/benefits",
  },
  {
    name: "Death Benefits Claim",
    desc: "File a claim on behalf of a deceased member.",
    icon: Heart,
    color: "#E11D48",
    bg: "#FFF1F2",
    href: "/member/claims/death",
  },
  {
    name: "Contribution Statement",
    desc: "View and download your contribution history.",
    icon: BarChart2,
    color: "#0D2137",
    bg: "#F1F5F9",
    href: "/member/statements",
  },
  {
    name: "My Requests",
    desc: "Track all your submitted applications.",
    icon: Building,
    color: "#0891B2",
    bg: "#ECFEFF",
    href: "/member/requests",
  },
  {
    name: "Missing Contribution",
    desc: "Report contributions missing from your statement.",
    icon: AlertCircle,
    color: "#D97706",
    bg: "#FFFBEB",
    href: "/member/discrepancy",
  },
  {
    name: "My Profile",
    desc: "Update your personal and contact details.",
    icon: UserCircle,
    color: "#6B7280",
    bg: "#F9FAFB",
    href: "/member/profile",
  },
]

export function ServicesGrid() {
  return (
    <section id="services" className="relative bg-[#F9FAFB] pt-28 pb-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#1A7A4A]">
              Services & Features
            </p>
            <h2 className="mt-2.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2137] leading-tight">
              We provide the best self-service pension solutions
            </h2>
          </div>
          <div className="lg:text-right space-y-3">
            <p className="text-sm leading-relaxed text-gray-500 max-w-md lg:ml-auto">
              Access secure online tools to update details, nominate beneficiaries, submit claims, and track contributions.
            </p>
          </div>
        </div>

        {/* Two-column layout: carousel left, cards right on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 items-start">

          {/* PSSF Carousel */}
          <div className="lg:sticky lg:top-24">
            <PssfCarousel size="tall" />
            <div className="mt-4 rounded-2xl border border-[#1A7A4A]/20 bg-[#E8F5EE] px-5 py-4">
              <p className="text-xs font-black text-[#1A7A4A] uppercase tracking-wider mb-1">Quick Access</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Already a member? Sign in to access all services instantly.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1A7A4A] px-4 py-2 text-xs font-black text-white hover:bg-[#145f3a] transition-colors"
              >
                Access Portal <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Service cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {SERVICES.map(({ name, desc, href, icon: Icon, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 p-5 rounded-2xl border border-gray-200/60 bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="flex size-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                    style={{ background: bg }}
                  >
                    <Icon className="size-5" style={{ color }} />
                  </span>
                  <ArrowRight className="size-3.5 text-gray-200 group-hover:text-gray-400 transition-colors mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0D2137] leading-snug">{name}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-snug">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
