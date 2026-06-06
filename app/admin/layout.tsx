import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Role } from "@prisma/client"
import { LayoutDashboard, Users, Building2, Bell, FileSearch, BarChart3 } from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Employers", href: "/admin/employers", icon: Building2 },
  { label: "Notification Rules", href: "/admin/notifications", icon: Bell },
  { label: "Audit Trail", href: "/admin/audit", icon: FileSearch },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== Role.ADMIN) redirect("/login")

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <aside className="w-64 bg-[#0D2137] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-[#1A7A4A] font-bold text-lg">PSSF</div>
          <div className="text-xs mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded inline-block">Admin</div>
        </div>
        <nav className="flex-1 py-4">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-6 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white">
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b flex items-center justify-end px-6 gap-4">
          <NotificationBell viewAllHref="/member/notifications" />
          <form action="/api/auth/logout" method="POST"><button type="submit" className="text-sm text-gray-600">Sign out</button></form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
