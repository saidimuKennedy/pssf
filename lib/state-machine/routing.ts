import { CaseType, CaseStatus } from "@prisma/client"

export function getInitialRoute(caseType: CaseType, formData: Record<string, unknown>): CaseStatus {
  // Journeys that route to employer first
  const employerFirstJourneys = [
    CaseType.MEMBER_ENROLMENT,
    CaseType.AVC,
    CaseType.BENEFITS_CLAIM,
  ]

  if ((employerFirstJourneys as CaseType[]).includes(caseType)) {
    // Special case: AVC with MOBILE_WALLET routes directly to PSSF
    if (caseType === CaseType.AVC && formData.method === "MOBILE_WALLET") {
      return CaseStatus.UNDER_REVIEW
    }
    return CaseStatus.PENDING_EMPLOYER
  }

  // All other journeys route directly to PSSF review
  return CaseStatus.UNDER_REVIEW
}
