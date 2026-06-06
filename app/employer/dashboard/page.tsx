import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { CaseStatus } from "@prisma/client"
import { Clock, CheckSquare, ArrowRight, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EmployerDashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const pendingCount = await prisma.case.count({
    where: {
      employer_id: session.user.employer_id ?? undefined,
      status: CaseStatus.PENDING_EMPLOYER,
    },
  })

  const recentCases = await prisma.case.findMany({
    where: { employer_id: session.user.employer_id ?? undefined },
    orderBy: { updated_at: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0D2137]">Employer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage employee enrolment approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0D2137]">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pending Approvals</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6 text-[#1A7A4A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0D2137]">{recentCases.length}</p>
              <p className="text-sm text-gray-500">Recent Activity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending approvals CTA */}
      {pendingCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-amber-800">
              You have {pendingCount} application{pendingCount !== 1 ? "s" : ""} awaiting your review.
            </p>
            <Link
              href="/employer/approvals"
              className="text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0D2137]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCases.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/employer/approvals/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-md border border-gray-100 hover:border-gray-300 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.reference}</p>
                    <p className="text-xs text-gray-400">{c.type.replace(/_/g, " ")}</p>
                  </div>
                  <span className="text-xs text-gray-500">{c.status.replace(/_/g, " ")}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
