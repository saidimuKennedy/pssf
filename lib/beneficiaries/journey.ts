export const BENEFICIARY_STEPS = [
  "Identity",
  "Details",
  "Beneficiaries",
  "Guardian",
  "Documents",
  "Witness",
  "Declaration",
  "Preview",
  "Confirm",
  "Done",
] as const

export const GUARDIAN_STEP_INDEX = 4

export function getSkippedSteps(hasMinor: boolean): number[] {
  return hasMinor ? [] : [GUARDIAN_STEP_INDEX]
}

export function nextAfterBeneficiaries(caseId: string, hasMinor: boolean): string {
  return hasMinor
    ? `/member/beneficiaries/guardian?case_id=${caseId}`
    : `/member/beneficiaries/documents?case_id=${caseId}`
}

export function backFromDocuments(caseId: string, hasMinor: boolean): string {
  return hasMinor
    ? `/member/beneficiaries/guardian?case_id=${caseId}`
    : `/member/beneficiaries/add?case_id=${caseId}`
}
