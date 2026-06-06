import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { NotificationChannel, CaseStatus } from "@prisma/client"
import {
  Users,
  TrendingUp,
  Banknote,
  Heart,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  Bell,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STATUS_LABELS: Partial<Record<CaseStatus, { label: string; color: string }>> = {
  DRAFT: { label: "Draft", color: "text-gray-500 bg-gray-100" },
  SUBMITTED: { label: "Submitted", color: "text-indigo-600 bg-indigo-100" },
  PENDING_EMPLOYER: { label: "Pending Employer", color: "text-amber-600 bg-amber-100" },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-600 bg-amber-100" },
  MORE_INFO_REQUIRED: { label: "More Info Required", color: "text-blue-600 bg-blue-100" },
  APPROVED: { label: "Approved", color: "text-green-600 bg-green-100" },
  COMPLETED: { label: "Completed", color: "text-green-700 bg-green-100" },
  REJECTED: { label: "Rejected", color: "text-red-600 bg-red-100" },
  EMPLOYER_REJECTED: { label: "Employer Rejected", color: "text-red-600 bg-red-100" },
}

const SERVICES = [
  { label: "Member Enrolment", href: "/member/enrolment", icon: Users, color: "#1A7A4A" },
  { label: "Beneficiary Nomination", href: "/member/beneficiaries", icon: Users, color: "#2563EB" },
  { label: "AVC Contributions", href: "/member/avc", icon: TrendingUp, color: "#16A34A" },
  { label: "Benefits Claim", href: "/member/claims/benefits", icon: Banknote, color: "#7C3AED" },
  { label: "Death Benefits Claim", href: "/member/claims/death", icon: Heart, color: "#E11D48" },
  { label: "Contribution Statement", href: "/member/statements", icon: BarChart2, color: "#0D2137" },
  { label: "Missing / Discrepancy", href: "/member/discrepancy", icon: AlertTriangle, color: "#D97706" },
]

export default async function MemberDashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const member = await prisma.member.findFirst({ where: { user_id: session.user.id } })

  const activeCases = await prisma.case.findMany({
    where: { member_id: member?.id },
    orderBy: { updated_at: "desc" },
    take: 5,
  })

  const notifications = await prisma.notification.findMany({
    where: {
      recipient_id: session.user.id,
      channel: NotificationChannel.PORTAL,
      is_read: false,
    },
    orderBy: { created_at: "desc" },
    take: 3,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0D2137]">
          Welcome{member ? `, ${member.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-gray-500 text-sm mt-1">PSSF Smart Self-Service Platform</p>
      </div>

      {/* Quick services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0D2137]">Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SERVICES.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-[#1A7A4A] hover:shadow-sm transition-all text-center"
              >
                <Icon className="w-6 h-6" style={{ color }} />
                <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active cases */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-[#0D2137]">Active Requests</CardTitle>
            <Link href="/member/requests" className="text-xs text-[#1A7A4A] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {activeCases.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No active requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCases.map((c) => {
                  const s = STATUS_LABELS[c.status]
                  return (
                    <Link
                      key={c.id}
                      href={`/member/requests/${c.id}`}
                      className="flex items-center justify-between p-3 rounded-md border border-gray-100 hover:border-gray-300 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.reference}</p>
                        <p className="text-xs text-gray-400">{c.type.replace(/_/g, " ")}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s?.color ?? "bg-gray-100 text-gray-600"}`}>
                        {s?.label ?? c.status}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent notifications */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-[#0D2137]">Notifications</CardTitle>
            <Link href="/member/notifications" className="text-xs text-[#1A7A4A] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => {
                  const payload = n.payload as Record<string, unknown>
                  return (
                    <div key={n.id} className="p-3 rounded-md bg-blue-50 border border-blue-100">
                      <p className="text-sm text-gray-800">{String(payload.message ?? "")}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {n.created_at.toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
