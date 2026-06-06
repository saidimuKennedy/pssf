import { auth } from "@/auth"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { CaseStatus } from "@prisma/client"
import { Clock, ArrowRight, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EmployerApprovalsPage() {
  const session = await auth()
  if (!session?.user) return null

  const pendingCases = await prisma.case.findMany({
    where: {
      employer_id: session.user.employer_id ?? undefined,
      status: CaseStatus.PENDING_EMPLOYER,
    },
    include: { member: { select: { full_name: true, national_id: true } } },
    orderBy: { created_at: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0D2137]">Pending Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Employee applications awaiting your review and action.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#0D2137] flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            {pendingCases.length} Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCases.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingCases.map((c) => (
                <Link
                  key={c.id}
                  href={`/employer/approvals/${c.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#1A7A4A] hover:shadow-sm transition-all"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-gray-900">{c.reference}</p>
                    <p className="text-xs text-gray-500">
                      {c.member?.full_name ?? "—"} · {c.member?.national_id ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {c.type.replace(/_/g, " ")} · Submitted {c.created_at.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                      Pending
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
