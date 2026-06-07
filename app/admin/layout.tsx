import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { PortalShell, type PortalNavItem } from "@/components/ui/portal-shell"

const NAV: PortalNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Employers", href: "/admin/employers", icon: "Building2" },
  { label: "Notification Rules", href: "/admin/notifications", icon: "Bell" },
  { label: "Audit Trail", href: "/admin/audit", icon: "FileSearch" },
  { label: "Reports", href: "/admin/reports", icon: "BarChart3" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== Role.ADMIN) redirect("/login")

  return (
    <PortalShell
      nav={NAV}
      subtitle="Administration"
      badge="Admin"
      userLabel={session.user.email ?? "Administrator"}
      notificationsHref="/member/notifications"
    >
      {children}
    </PortalShell>
  )
}
