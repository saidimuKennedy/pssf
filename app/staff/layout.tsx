import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Role } from "@prisma/client"
import {
  LayoutDashboard,
  FolderOpen,
  UserPlus,
  Users,
  PiggyBank,
  FileText,
  Heart,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"

const NAV = [
  { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { label: "All Cases", href: "/staff/cases", icon: FolderOpen },
  { label: "Enrolments", href: "/staff/queues/enrolments", icon: UserPlus },
  { label: "Beneficiaries", href: "/staff/queues/beneficiaries", icon: Users },
  { label: "AVC", href: "/staff/queues/avc", icon: PiggyBank },
  { label: "Claims", href: "/staff/queues/claims", icon: FileText },
  { label: "Death Claims", href: "/staff/queues/death-claims", icon: Heart },
  { label: "Missing Contributions", href: "/staff/queues/missing", icon: AlertTriangle },
  { label: "Discrepancies", href: "/staff/queues/discrepancies", icon: AlertTriangle },
  { label: "Reports", href: "/staff/reports", icon: BarChart3 },
]

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== Role.PSSF_OFFICER && session.user.role !== Role.PSSF_SUPERVISOR) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <aside className="w-64 bg-[#0D2137] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-[#1A7A4A] font-bold text-lg leading-tight">PSSF</div>
          <div className="text-white/60 text-xs mt-0.5">Staff Portal</div>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-6 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/50">
          {session.user.email ?? "PSSF Staff"}
          <div className="text-white/40">{session.user.role.replace(/_/g, " ")}</div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4">
          <NotificationBell viewAllHref="/member/notifications" />
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
