"use client"

import { useState } from "react"
import {
  Home, HelpCircle, Bot, Phone, Mail, MessageSquare,
  MapPin, Clock, X, ChevronDown, type LucideIcon,
  LayoutDashboard, FileText, Users, TrendingUp, Banknote,
  Heart, BarChart2, BarChart3, AlertTriangle, Clock as ClockIcon,
  CheckSquare, FolderOpen, UserPlus, PiggyBank, Building2,
  Bell, FileSearch,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, FileText, Users, TrendingUp, Banknote, Heart,
  BarChart2, BarChart3, AlertTriangle, Clock: ClockIcon, CheckSquare,
  FolderOpen, UserPlus, PiggyBank, Building2, Bell, FileSearch,
}

export interface FooterNavItem {
  label: string
  href: string
  icon: string
}

type Sheet = "help" | "agent" | null

const FAQS = [
  {
    q: "How do I nominate a beneficiary?",
    a: "Sign in, go to Beneficiary Nomination, complete the form with nominees' details and allocations, then submit for PSSF review.",
  },
  {
    q: "How do I apply for AVC contributions?",
    a: "Go to AVC Contributions, choose your contribution method (payroll or direct), enter the amount, and your employer will be notified.",
  },
  {
    q: "How do I track my application status?",
    a: "Go to My Requests. Each submission shows its current status — Draft, Pending Employer, Under Review, Approved, or Completed.",
  },
  {
    q: "What documents are required for claims?",
    a: "Benefits claims need your National ID, employment letter, and bank details. Death claims also require a death certificate and next-of-kin ID.",
  },
  {
    q: "How do I update my personal details?",
    a: "Visit My Profile in the portal to update contact info. Core identity changes (name, ID) require supporting documents.",
  },
]

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-1.5 max-h-64 overflow-y-auto">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Frequently Asked Questions</p>
      {FAQS.map(({ q, a }, i) => (
        <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-[#0D2137] hover:bg-[#E8F5EE] transition-colors cursor-pointer text-left gap-2"
          >
            <span>{q}</span>
            <ChevronDown className={cn("size-3.5 shrink-0 text-gray-400 transition-transform", open === i && "rotate-180")} />
          </button>
          {open === i && (
            <div className="px-3 pb-3 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2">
              {a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

interface SupportFooterProps {
  nav: FooterNavItem[]
}

export function SupportFooter({ nav }: SupportFooterProps) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const pathname = usePathname()

  function toggle(s: Sheet) {
    setSheet((prev) => (prev === s ? null : s))
  }

  return (
    <>

      {/* The footer panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64">
        <div className="rounded-t-3xl border-t border-x border-gray-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.08)] overflow-hidden">

          {/* Drag handle */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-8 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Expanded content */}
          {sheet && (
            <div className="px-4 pb-3 animate-in slide-in-from-bottom-2 duration-200">
              {sheet === "help" && <FaqAccordion />}

              {sheet === "agent" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contact Support</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a href="tel:+254201234567" className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 py-3 text-[11px] font-bold text-[#0D2137] hover:bg-[#E8F5EE] transition-colors">
                      <Phone className="size-5 text-[#1A7A4A]" />Call
                    </a>
                    <a href="mailto:support@pssf.go.ke" className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 py-3 text-[11px] font-bold text-[#0D2137] hover:bg-[#E8F5EE] transition-colors">
                      <Mail className="size-5 text-[#1A7A4A]" />Email
                    </a>
                    <a href="https://wa.me/254201234567" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 py-3 text-[11px] font-bold text-[#0D2137] hover:bg-[#E8F5EE] transition-colors">
                      <MessageSquare className="size-5 text-[#1A7A4A]" />WhatsApp
                    </a>
                  </div>
                  <div className="rounded-2xl border border-gray-100 px-3 py-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#0D2137]">
                      <MapPin className="size-3.5 text-[#1A7A4A] shrink-0" />Nairobi HQ — Upper Hill
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pl-5">
                      <Clock className="size-3 shrink-0" />Mon–Fri 8am–5pm · +254 20 123 4567
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab bar */}
          <div className="grid grid-cols-3 h-14 border-t border-gray-100">
            <Link
              href="/member/dashboard"
              onClick={() => setSheet(null)}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#1A7A4A] transition-colors"
            >
              <Home className="size-5" />
              Main Menu
            </Link>

            <button
              onClick={() => toggle("help")}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors cursor-pointer",
                sheet === "help" ? "text-[#1A7A4A]" : "text-gray-400 hover:text-[#1A7A4A]"
              )}
            >
              <HelpCircle className="size-5" />Help & Support
            </button>

            <button
              onClick={() => toggle("agent")}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors cursor-pointer",
                sheet === "agent" ? "text-[#1A7A4A]" : "text-gray-400 hover:text-[#1A7A4A]"
              )}
            >
              <Bot className="size-5" />Connect Agent
            </button>
          </div>
        </div>
      </div>

    </>
  )
}
