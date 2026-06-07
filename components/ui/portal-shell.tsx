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
  type LucideIcon,
} from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"
import { PssfLogo } from "@/components/pssf-logo"

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
      <div className="px-6 py-5 border-b border-white/10">
        <PssfLogo variant="onDark" width={120} height={68} />
        <div className="text-white/60 text-xs mt-1">{subtitle}</div>
        {badge && (
          <div className="text-xs mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded inline-block">
            {badge}
          </div>
        )}
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map(({ label, href, icon }) => {
          const Icon = ICONS[icon] ?? FileText
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-6 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-6 py-4 border-t border-white/10 text-xs text-white/50">
        {userLabel}
        {userMeta && <div className="text-white/40">{userMeta}</div>}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0D2137] text-white flex-col shrink-0">
        {sidebarBody}
      </aside>

      {/* Mobile slide-over drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#0D2137] text-white flex flex-col shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-white/70 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarBody}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between md:justify-end px-4 md:px-6 gap-4">
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-gray-600 hover:text-gray-900"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <NotificationBell viewAllHref={notificationsHref} />
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
