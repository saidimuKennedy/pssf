"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  Banknote,
  Heart,
  BarChart2,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckSquare,
  FolderOpen,
  UserPlus,
  PiggyBank,
  Building2,
  Bell,
  FileSearch,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"
import { PssfLogo } from "@/components/pssf-logo"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  Banknote,
  Heart,
  BarChart2,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckSquare,
  FolderOpen,
  UserPlus,
  PiggyBank,
  Building2,
  Bell,
  FileSearch,
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
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const sidebarBody = (
    <>
      <div className="px-6 py-5 border-b border-white/10 bg-[#0B1C2F]/30">
        <PssfLogo variant="onDark" width={110} height={60} className="opacity-95" />
        <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-2 leading-none">
          {subtitle}
        </div>
        {badge && (
          <div className="text-[10px] font-bold mt-2 px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/10 rounded-full inline-block uppercase tracking-wider">
            {badge}
          </div>
        )}
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto space-y-0.5">
        {nav.map(({ label, href, icon }) => {
          const Icon = ICONS[icon] ?? FileText
          const active = pathname === href || (href !== "/member/dashboard" && href !== "/staff/dashboard" && href !== "/employer/dashboard" && href !== "/admin/dashboard" && pathname.startsWith(href))
          
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 rounded-xl mx-3.5 cursor-pointer",
                active
                  ? "bg-[#1A7A4A] text-white shadow-lg shadow-[#1A7A4A]/25"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User Section (Mockup Style) */}
      <div className="px-5 py-4 border-t border-white/10 text-xs text-white/70 flex items-center gap-3 bg-[#0B1C2F]/50">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white shadow-inner">
          {userLabel.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-extrabold truncate leading-tight text-white">{userLabel}</p>
          {userMeta && <p className="text-white/40 truncate text-[10px] mt-0.5 font-bold uppercase tracking-wider">{userMeta}</p>}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0D2137] text-white flex-col shrink-0 border-r border-white/5">
        {sidebarBody}
      </aside>

      {/* Mobile slide-over drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#0D2137] text-white flex flex-col shadow-2xl border-r border-white/5 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3.5 top-4 text-white/50 hover:text-white cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarBody}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Mockup Style) */}
        <header className="h-16 bg-white border-b border-gray-200/60 flex items-center justify-between px-4 md:px-6 gap-4">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-gray-500 hover:text-gray-900 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb info (desktop) */}
          <div className="hidden md:flex flex-col text-left">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">PSSF Portal</p>
            <p className="text-sm font-black text-[#0D2137] mt-1.5">{subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell viewAllHref={notificationsHref} />
            <div className="h-4 w-px bg-gray-200" />
            <form action="/api/auth/logout" method="POST" className="inline-flex">
              <button 
                type="submit" 
                className="text-xs font-bold text-gray-500 hover:text-red-650 flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-200 hover:border-red-200 px-3.5 py-1.5 rounded-full hover:bg-red-50 bg-white shadow-sm active:scale-98"
              >
                <LogOut className="size-3.5 text-gray-400 group-hover:text-red-500" />
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Content main body */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
