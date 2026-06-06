import { prisma } from "@/lib/db"
import Link from "next/link"

async function getHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return "healthy"
  } catch {
    return "degraded"
  }
}

export default async function AdminDashboardPage() {
  const [userCounts, caseCounts, employerCount, recentAudit, health] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { id: true }, where: { deleted_at: null } }),
    prisma.case.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.employer.count(),
    prisma.auditEvent.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
      include: { case: { select: { reference: true } }, actor: { select: { email: true } } },
    }),
    getHealth(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#0D2137]">Admin Dashboard</h1>
      <div className={`inline-flex px-3 py-1 rounded-full text-sm ${health === "healthy" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
        System: {health}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-medium mb-2">Users by role</h2>
          {userCounts.map((u) => <p key={u.role} className="text-sm">{u.role.replace(/_/g, " ")}: {u._count.id}</p>)}
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-medium mb-2">Cases by status</h2>
          {caseCounts.slice(0, 6).map((c) => <p key={c.status} className="text-sm">{c.status.replace(/_/g, " ")}: {c._count.id}</p>)}
          <Link href="/admin/reports" className="text-xs text-[#1A7A4A] mt-2 inline-block">View reports</Link>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-medium mb-2">Employers</h2>
          <p className="text-2xl font-bold">{employerCount}</p>
          <Link href="/admin/employers" className="text-xs text-[#1A7A4A]">Manage employers</Link>
        </div>
      </div>

      <div className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b font-medium">Recent audit events</div>
        <div className="divide-y">
          {recentAudit.map((e) => (
            <div key={e.id} className="px-4 py-2 text-sm flex justify-between">
              <span>{e.action} — {e.case?.reference ?? "—"}</span>
              <span className="text-gray-400">{e.created_at.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t"><Link href="/admin/audit" className="text-sm text-[#1A7A4A]">Full audit trail</Link></div>
      </div>
    </div>
  )
}
