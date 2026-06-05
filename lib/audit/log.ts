import { prisma } from "@/lib/db"
import { CaseStatus, Role } from "@prisma/client"

export interface AuditEventParams {
  case_id?: string
  action: string
  actor_id?: string
  actor_role?: string
  from_status?: CaseStatus | null
  to_status?: CaseStatus | null
  metadata?: unknown
  ip_address?: string
}

export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    const metadata = params.metadata ?? {}
    await (prisma.auditEvent.create as any)({
      data: {
        case_id: params.case_id,
        action: params.action,
        actor_id: params.actor_id,
        actor_role: params.actor_role,
        from_status: params.from_status ?? null,
        to_status: params.to_status ?? null,
        metadata,
        ip_address: params.ip_address,
      },
    })
  } catch (error) {
    console.error("[Audit] Failed to log event:", params, error)
  }
}
