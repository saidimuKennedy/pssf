import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { PortalShell, type PortalNavItem } from "@/components/ui/portal-shell"

const NAV: PortalNavItem[] = [
  { label: "Dashboard", href: "/member/dashboard", icon: "LayoutDashboard" },
  { label: "My Requests", href: "/member/requests", icon: "FileText" },
  { label: "Member Enrolment", href: "/member/enrolment", icon: "Users" },
  { label: "Beneficiary Nomination", href: "/member/beneficiaries", icon: "Users" },
  { label: "AVC Contributions", href: "/member/avc", icon: "TrendingUp" },
  { label: "Benefits Claim", href: "/member/claims/benefits", icon: "Banknote" },
  { label: "Death Benefits Claim", href: "/member/claims/death", icon: "Heart" },
  { label: "Contribution Statement", href: "/member/statements", icon: "BarChart2" },
  { label: "Discrepancy / Missing", href: "/member/discrepancy", icon: "AlertTriangle" },
  { label: "My Profile", href: "/member/profile", icon: "Users" },
]

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const allowed: Role[] = [Role.MEMBER, Role.CLAIMANT]
  if (!allowed.includes(session.user.role)) redirect("/login")

  return (
    <PortalShell
      nav={NAV}
      subtitle="Smart Self-Service Platform"
      userLabel={session.user.name ?? session.user.email ?? "Member"}
      notificationsHref="/member/notifications"
    >
      {children}
    </PortalShell>
  )
}
