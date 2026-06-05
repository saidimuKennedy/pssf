import { CaseType } from "@prisma/client"
import { prisma } from "@/lib/db"

const TYPE_CODES: Record<CaseType, string> = {
  MEMBER_ENROLMENT: "ENR",
  BENEFICIARY_NOMINATION: "BEN",
  AVC: "AVC",
  BENEFITS_CLAIM: "CLM",
  DEATH_BENEFITS_CLAIM: "DCL",
  MISSING_CONTRIBUTION: "MCR",
  DISCREPANCY: "DIS",
}

export async function generateCaseReference(caseType: CaseType): Promise<string> {
  const typeCode = TYPE_CODES[caseType]
  const year = new Date().getFullYear()

  const count = await prisma.case.count({
    where: {
      type: caseType,
      created_at: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  })

  const sequence = String(count + 1).padStart(6, "0")
  return `${typeCode}-${year}-${sequence}`
}
