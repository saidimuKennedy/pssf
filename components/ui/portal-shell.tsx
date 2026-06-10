"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, FileText, Users, TrendingUp, Banknote, Heart,
  BarChart2, BarChart3, AlertTriangle, Clock, CheckSquare, FolderOpen,
  UserPlus, PiggyBank, Building2, Bell, FileSearch, LogOut, ChevronLeft,
  type LucideIcon,
} from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"
import { SupportFooter } from "@/components/ui/support-footer"
import { PssfLogo } from "@/components/pssf-logo"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, FileText, Users, TrendingUp, Banknote, Heart,
  BarChart2, BarChart3, AlertTriangle, Clock, CheckSquare, FolderOpen,
  UserPlus, PiggyBank, Building2, Bell, FileSearch,
}

export interface PortalNavItem {
  label: string
  href: string
  icon: string
}

interface PortalShellProps {
  nav: PortalNavItem[]
  subtitle: string
  userLabel: string
  userMeta?: string
  badge?: string
  notificationsHref: string
  children: React.ReactNode
}

export function PortalShell({
  nav,
  subtitle,
  userLabel,
  userMeta,
  badge,
  notificationsHref,
  children,
}: PortalShellProps) {
  const pathname = usePathname()
  const dashboardHref = nav[0]?.href ?? "/"
  const isHome = pathname === dashboardHref

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6]">

      {/* Top banner — sidebar color + logo */}
      <header className="bg-[#0D2137] text-white">
        {/* Brand row */}
        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/10">
          <div className="flex items-center gap-4">
            <PssfLogo variant="onDark" width={90} height={48} className="opacity-95" />
            <div className="hidden sm:block border-l border-white/20 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 leading-none">{subtitle}</p>
              {badge && (
                <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/10">
                  {badge}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell viewAllHref={notificationsHref} />
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[11px] font-black text-white">
                {userLabel.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-white leading-none truncate max-w-[140px]">{userLabel}</p>
                {userMeta && <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{userMeta}</p>}
              </div>
            </div>
            <form action="/api/auth/logout" method="POST" className="inline-flex">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-[11px] font-bold text-white/60 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Back to home row — shown on all pages except dashboard */}
        {!isHome && (
          <div className="px-4 md:px-8 py-2 border-t border-white/10">
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft className="size-4" />
              Home
            </Link>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-8 overflow-y-auto">
        {children}
      </main>

      {/* Mobile footer nav grid */}
      <div className="md:hidden">
        <SupportFooter nav={nav} />
      </div>
    </div>
  )
}
