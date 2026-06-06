import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Role } from "@prisma/client"
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  Banknote,
  Heart,
  BarChart2,
  AlertTriangle,
} from "lucide-react"
import { NotificationBell } from "@/components/ui/notification-bell"

const NAV = [
  { label: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
  { label: "My Requests", href: "/member/requests", icon: FileText },
  { label: "Member Enrolment", href: "/member/enrolment", icon: Users },
  { label: "Beneficiary Nomination", href: "/member/beneficiaries", icon: Users },
  { label: "AVC Contributions", href: "/member/avc", icon: TrendingUp },
  { label: "Benefits Claim", href: "/member/claims/benefits", icon: Banknote },
  { label: "Death Benefits Claim", href: "/member/claims/death", icon: Heart },
  { label: "Contribution Statement", href: "/member/statements", icon: BarChart2 },
  { label: "Discrepancy / Missing", href: "/member/discrepancy", icon: AlertTriangle },
  { label: "My Profile", href: "/member/profile", icon: Users },
]

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const allowed: Role[] = [Role.MEMBER, Role.CLAIMANT]
  if (!(allowed as Role[]).includes(session.user.role)) redirect("/login")

  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <aside className="w-64 bg-[#0D2137] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-[#1A7A4A] font-bold text-lg leading-tight">PSSF</div>
          <div className="text-white/60 text-xs mt-0.5">Smart Self-Service Platform</div>
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
          {session.user.name ?? session.user.email ?? "Member"}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4">
          <NotificationBell viewAllHref="/member/notifications" />
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
