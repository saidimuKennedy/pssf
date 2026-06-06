import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Role } from "@prisma/client"
import { LayoutDashboard, Clock, CheckSquare, AlertTriangle, FileText } from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"

const NAV = [
  { label: "Dashboard", href: "/employer/dashboard", icon: LayoutDashboard },
  { label: "Pending Approvals", href: "/employer/approvals", icon: Clock },
  { label: "Completed", href: "/employer/completed", icon: CheckSquare },
  { label: "Discrepancy Verifications", href: "/employer/discrepancies", icon: AlertTriangle },
  { label: "Missing Contributions", href: "/employer/contributions", icon: FileText },
]

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== Role.EMPLOYER) redirect("/login")

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <aside className="w-64 bg-[#0D2137] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-[#1A7A4A] font-bold text-lg leading-tight">PSSF</div>
          <div className="text-white/60 text-xs mt-0.5">Employer Portal</div>
        </div>
        <nav className="flex-1 py-4">
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
          {session.user.name ?? session.user.email ?? "Employer"}
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
