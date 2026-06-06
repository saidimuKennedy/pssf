import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { CaseType } from "@prisma/client"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"

export default async function EmployerContributionsPage() {
  const session = await auth()
  if (!session?.user?.employer_id) return null

  const cases = await prisma.case.findMany({
    where: {
      employer_id: session.user.employer_id,
      type: CaseType.MISSING_CONTRIBUTION,
    },
    orderBy: { submitted_at: "desc" },
    include: { member: { select: { full_name: true } } },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Missing Contribution Queries</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-4 py-2">Reference</th><th className="text-left px-4 py-2">Member</th><th className="text-left px-4 py-2">Month</th><th className="text-left px-4 py-2">Status</th><th className="text-left px-4 py-2">Action</th>
          </tr></thead>
          <tbody className="divide-y">
            {cases.map((c) => {
              const fd = c.form_data as Record<string, unknown>
              return (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-mono">{c.reference}</td>
                  <td className="px-4 py-2">{c.member?.full_name}</td>
                  <td className="px-4 py-2">{String(fd.month ?? "—")}</td>
                  <td className="px-4 py-2"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-2"><Link href={`/employer/approvals/${c.id}`} className="text-[#1A7A4A] hover:underline">Review</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
