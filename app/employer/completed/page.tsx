import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { ApprovalType } from "@prisma/client"
import Link from "next/link"
import { CASE_TYPE_LABELS } from "@/components/ui/status-badge"
import { TableScroll } from "@/components/ui/table-scroll"

export default async function EmployerCompletedPage() {
  const session = await auth()
  if (!session?.user?.employer_id) return null

  const approvals = await prisma.approval.findMany({
    where: {
      type: ApprovalType.EMPLOYER,
      case: { employer_id: session.user.employer_id },
    },
    orderBy: { created_at: "desc" },
    take: 50,
    include: {
      case: {
        select: { id: true, reference: true, type: true, member: { select: { full_name: true } } },
      },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0D2137]">Completed Actions</h1>
      <TableScroll>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-4 py-2">Reference</th><th className="text-left px-4 py-2">Type</th><th className="text-left px-4 py-2">Member</th><th className="text-left px-4 py-2">Decision</th><th className="text-left px-4 py-2">Date</th>
          </tr></thead>
          <tbody className="divide-y">
            {approvals.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2"><Link href={`/employer/approvals/${a.case.id}`} className="text-[#1A7A4A] font-mono">{a.case.reference}</Link></td>
                <td className="px-4 py-2">{CASE_TYPE_LABELS[a.case.type]}</td>
                <td className="px-4 py-2">{a.case.member?.full_name}</td>
                <td className="px-4 py-2">{a.decision}</td>
                <td className="px-4 py-2">{a.created_at.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  )
}
