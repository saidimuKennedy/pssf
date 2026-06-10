"use client"

import { useState } from "react"
import {
  Home, HelpCircle, Bot, Phone, Mail, MessageSquare,
  MapPin, Clock, X, type LucideIcon,
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
  "How do I nominate a beneficiary?",
  "How do I apply for AVC contributions?",
  "How do I track my application status?",
  "What documents are required for claims?",
  "How do I update my personal details?",
]

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
              {sheet === "help" && (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Frequently Asked Questions</p>
                  {FAQS.map((q) => (
                    <div key={q} className="rounded-xl border border-gray-100 px-3 py-2.5 text-xs font-medium text-[#0D2137] hover:bg-[#E8F5EE] hover:border-[#1A7A4A]/20 transition-colors cursor-pointer">
                      {q}
                    </div>
                  ))}
                </div>
              )}

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
