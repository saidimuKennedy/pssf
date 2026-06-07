import { CaseType, CaseStatus } from "@prisma/client"

export function getInitialRoute(caseType: CaseType, formData: Record<string, unknown>): CaseStatus {
  if (caseType === CaseType.MISSING_CONTRIBUTION) {
    const contributionType = formData.contribution_type as string | undefined
    if (
      contributionType === "EMPLOYER" ||
      contributionType === "BOTH" ||
      contributionType === "employer" ||
      contributionType === "both"
    ) {
      return CaseStatus.PENDING_EMPLOYER
    }
    return CaseStatus.UNDER_REVIEW
  }

  if (caseType === CaseType.DISCREPANCY) {
    const category = formData.field_category as string | undefined
    if (category === "EMPLOYMENT") {
      return CaseStatus.PENDING_EMPLOYER
    }
    return CaseStatus.UNDER_REVIEW
  }

  // Journeys that route to employer first
  const employerFirstJourneys = [
    CaseType.MEMBER_ENROLMENT,
    CaseType.AVC,
    CaseType.BENEFITS_CLAIM,
  ]

  if ((employerFirstJourneys as CaseType[]).includes(caseType)) {
    // AVC payroll routes to employer; mobile wallet routes directly to PSSF
    if (caseType === CaseType.AVC && formData.avc_method === "MOBILE_WALLET") {
      return CaseStatus.UNDER_REVIEW
    }
    return CaseStatus.PENDING_EMPLOYER
  }

  // All other journeys route directly to PSSF review
  return CaseStatus.UNDER_REVIEW
}
