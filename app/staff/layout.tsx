import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { PortalShell, type PortalNavItem } from "@/components/ui/portal-shell"

const NAV: PortalNavItem[] = [
  { label: "Dashboard", href: "/staff/dashboard", icon: "LayoutDashboard" },
  { label: "All Cases", href: "/staff/cases", icon: "FolderOpen" },
  { label: "Enrolments", href: "/staff/queues/enrolments", icon: "UserPlus" },
  { label: "Beneficiaries", href: "/staff/queues/beneficiaries", icon: "Users" },
  { label: "AVC", href: "/staff/queues/avc", icon: "PiggyBank" },
  { label: "Claims", href: "/staff/queues/claims", icon: "FileText" },
  { label: "Death Claims", href: "/staff/queues/death-claims", icon: "Heart" },
  { label: "Missing Contributions", href: "/staff/queues/missing", icon: "AlertTriangle" },
  { label: "Discrepancies", href: "/staff/queues/discrepancies", icon: "AlertTriangle" },
  { label: "Reports", href: "/staff/reports", icon: "BarChart3" },
]

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== Role.PSSF_OFFICER && session.user.role !== Role.PSSF_SUPERVISOR) {
    redirect("/login")
  }

  return (
    <PortalShell
      nav={NAV}
      subtitle="Staff Portal"
      userLabel={session.user.email ?? "PSSF Staff"}
      userMeta={session.user.role.replace(/_/g, " ")}
      notificationsHref="/member/notifications"
    >
      {children}
    </PortalShell>
  )
}
