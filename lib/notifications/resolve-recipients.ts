import { Role } from "@prisma/client"
import { prisma } from "@/lib/db"

type CaseWithRelations = {
  id: string
  assigned_to: string | null
  employer_id: string | null
  form_data: unknown
  member: { user_id: string } | null
}

export async function resolveRecipientIds(
  recipientType: string,
  caseRecord: CaseWithRelations
): Promise<string[]> {
  switch (recipientType) {
    case "MEMBER": {
      const fd = (caseRecord.form_data as Record<string, unknown>) ?? {}
      if (fd.claimant_user_id && typeof fd.claimant_user_id === "string") {
        return [fd.claimant_user_id]
      }
      if (caseRecord.member?.user_id) {
        return [caseRecord.member.user_id]
      }
      return []
    }
    case "EMPLOYER": {
      if (!caseRecord.employer_id) return []
      const officers = await prisma.employerOfficer.findMany({
        where: { employer_id: caseRecord.employer_id, is_active: true },
        select: { user_id: true },
      })
      return officers.map((o) => o.user_id)
    }
    case "PSSF_STAFF": {
      if (caseRecord.assigned_to) {
        return [caseRecord.assigned_to]
      }
      const officers = await prisma.user.findMany({
        where: {
          role: { in: [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR] },
          is_active: true,
        },
        select: { id: true },
      })
      return officers.map((u) => u.id)
    }
    default:
      return []
  }
}
