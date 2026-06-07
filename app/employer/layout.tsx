import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { PortalShell, type PortalNavItem } from "@/components/ui/portal-shell"

const NAV: PortalNavItem[] = [
  { label: "Dashboard", href: "/employer/dashboard", icon: "LayoutDashboard" },
  { label: "Pending Approvals", href: "/employer/approvals", icon: "Clock" },
  { label: "Completed", href: "/employer/completed", icon: "CheckSquare" },
  { label: "Discrepancy Verifications", href: "/employer/discrepancies", icon: "AlertTriangle" },
  { label: "Missing Contributions", href: "/employer/contributions", icon: "FileText" },
]

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== Role.EMPLOYER) redirect("/login")

  return (
    <PortalShell
      nav={NAV}
      subtitle="Employer Portal"
      userLabel={session.user.name ?? session.user.email ?? "Employer"}
      notificationsHref="/member/notifications"
    >
      {children}
    </PortalShell>
  )
}
