import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { CaseType } from "@prisma/client"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import { FIELD_LABELS, type DiscrepancyField } from "@/lib/validations/discrepancy"

export default async function EmployerDiscrepanciesPage() {
  const session = await auth()
  if (!session?.user?.employer_id) return null

  const cases = await prisma.case.findMany({
    where: {
      employer_id: session.user.employer_id,
      type: CaseType.DISCREPANCY,
    },
    orderBy: { submitted_at: "desc" },
    include: { member: { select: { full_name: true } } },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discrepancy Verifications</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-4 py-2">Reference</th><th className="text-left px-4 py-2">Member</th><th className="text-left px-4 py-2">Field</th><th className="text-left px-4 py-2">Submitted</th><th className="text-left px-4 py-2">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {cases.map((c) => {
              const fd = c.form_data as Record<string, unknown>
              const field = fd.field_name as DiscrepancyField
              return (
                <tr key={c.id}>
                  <td className="px-4 py-2"><Link href={`/employer/approvals/${c.id}`} className="text-[#1A7A4A] font-mono">{c.reference}</Link></td>
                  <td className="px-4 py-2">{c.member?.full_name}</td>
                  <td className="px-4 py-2">{FIELD_LABELS[field] ?? String(fd.field_name)}</td>
                  <td className="px-4 py-2">{c.submitted_at?.toLocaleDateString() ?? "—"}</td>
                  <td className="px-4 py-2"><StatusBadge status={c.status} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
