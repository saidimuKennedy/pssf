import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { CaseStatus } from "@prisma/client"
import {
  LayoutDashboard, FileText, Users, TrendingUp, Banknote,
  Heart, BarChart2, AlertTriangle, UserCircle,
} from "lucide-react"

const SERVICES = [
  { label: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
  { label: "My Requests", href: "/member/requests", icon: FileText },
  { label: "Member Enrolment", href: "/member/enrolment", icon: Users },
  { label: "Beneficiary Nomination", href: "/member/beneficiaries", icon: Users },
  { label: "AVC Contributions", href: "/member/avc", icon: TrendingUp },
  { label: "Benefits Claim", href: "/member/claims/benefits", icon: Banknote },
  { label: "Death Benefits Claim", href: "/member/claims/death", icon: Heart },
  { label: "Contribution Statement", href: "/member/statements", icon: BarChart2 },
  { label: "Discrepancy / Missing", href: "/member/discrepancy", icon: AlertTriangle },
  { label: "My Profile", href: "/member/profile", icon: UserCircle },
]

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

export default async function MemberDashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const member = await prisma.member.findFirst({ where: { user_id: session.user.id } })
  const firstName = member?.full_name.split(" ")[0] ?? "there"

  const activeCases = await prisma.case.findMany({
    where: { member_id: member?.id },
    orderBy: { updated_at: "desc" },
    take: 3,
  })

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Greeting */}
      <div className="pt-1">
        <h1 className="text-lg font-black text-[#0D2137]">Hello, {firstName}</h1>
        <p className="text-xs text-gray-400 font-medium">What would you like to do today?</p>
      </div>

      {/* Nav grid card */}
      <div className="rounded-3xl bg-[#0D2137] p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Navigate</p>
        <div className="grid grid-cols-3 gap-2">
          {SERVICES.map(({ label, href, icon: Icon }) => {
            const active = href === "/member/dashboard"
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-2 rounded-2xl px-2 py-3 text-center text-[10px] font-bold transition-all ${
                  active ? "bg-[#1A7A4A] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                <span className="leading-tight">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Active cases */}
      {activeCases.length > 0 && (
        <div className="rounded-3xl bg-white border border-gray-100 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-[#0D2137] uppercase tracking-wider">Active Requests</p>
            <Link href="/member/requests" className="text-[11px] text-[#1A7A4A] font-bold hover:underline">
              View all
            </Link>
          </div>
          {activeCases.map((c) => {
            const s = STATUS_LABELS[c.status]
            return (
              <Link
                key={c.id}
                href={`/member/requests/${c.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-gray-800">{c.reference}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{c.type.replace(/_/g, " ")}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s?.color ?? "bg-gray-100 text-gray-600"}`}>
                  {s?.label ?? c.status}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
