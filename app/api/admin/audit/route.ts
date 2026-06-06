import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"
import { buildCsv } from "@/lib/csv"

export async function GET(req: NextRequest) {
  const session = await auth()
  const allowed: Role[] = [Role.ADMIN, Role.PSSF_SUPERVISOR]
  if (!session?.user || !allowed.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const exportCsv = searchParams.get("export") === "true"
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)))

  const where: Record<string, unknown> = {}
  const caseId = searchParams.get("case_id")
  const actorId = searchParams.get("actor_id")
  const action = searchParams.get("action")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  if (caseId) where.case_id = caseId
  if (actorId) where.actor_id = actorId
  if (action) where.action = action
  if (from || to) {
    where.created_at = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    }
  }

  const [total, events] = await Promise.all([
    prisma.auditEvent.count({ where }),
    prisma.auditEvent.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: exportCsv ? 0 : (page - 1) * limit,
      take: exportCsv ? 10000 : limit,
      include: {
        case: { select: { reference: true } },
        actor: {
          select: {
            email: true,
            role: true,
            member: { select: { full_name: true } },
            employer_officer: { select: { full_name: true } },
          },
        },
      },
    }),
  ])

  const rows = events.map((e) => ({
    id: e.id,
    timestamp: e.created_at.toISOString(),
    actor_name:
      e.actor?.member?.full_name ??
      e.actor?.employer_officer?.full_name ??
      e.actor?.email ??
      "System",
    actor_role: e.actor_role ?? e.actor?.role ?? "",
    action: e.action,
    case_reference: e.case?.reference ?? "",
    from_status: e.from_status ?? "",
    to_status: e.to_status ?? "",
    ip_address: e.ip_address ?? "",
  }))

  if (exportCsv) {
    const csv = buildCsv(
      ["timestamp", "actor_name", "actor_role", "action", "case_reference", "from_status", "to_status", "ip_address"],
      rows.map((r) => [
        r.timestamp,
        r.actor_name,
        r.actor_role,
        r.action,
        r.case_reference,
        r.from_status,
        r.to_status,
        r.ip_address,
      ])
    )
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="audit-export.csv"',
      },
    })
  }

  return NextResponse.json({ total, page, limit, data: rows })
}
