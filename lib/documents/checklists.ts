import { CaseType } from "@prisma/client"

export interface DocumentRequirement {
  type: string
  required: boolean
  condition?: string
}

export const DOCUMENT_CHECKLISTS: Record<CaseType, DocumentRequirement[]> = {
  MEMBER_ENROLMENT: [
    { type: "NATIONAL_ID", required: true },
  ],
  BENEFICIARY_NOMINATION: [
    { type: "NATIONAL_ID", required: true },
    { type: "BIRTH_CERTIFICATE", required: false, condition: "has_minor_beneficiary" },
    { type: "GUARDIAN_ID", required: false, condition: "has_minor_beneficiary" },
  ],
  BENEFITS_CLAIM: [
    { type: "EXIT_LETTER", required: true },
    { type: "NATIONAL_ID", required: true },
    { type: "ATM_CARD", required: true },
    { type: "KRA_PIN", required: true },
    { type: "PROOF_OF_RESIDENCY", required: false, condition: "reason_is_emigration" },
    { type: "OPTION_ELECTION", required: false, condition: "joined_at_45_plus" },
  ],
  DEATH_BENEFITS_CLAIM: [
    { type: "DEATH_CERTIFICATE", required: true },
    { type: "MARRIAGE_CERTIFICATE", required: false, condition: "has_spouse_claimant" },
    { type: "BIRTH_CERTIFICATE", required: false, condition: "has_child_claimant" },
    { type: "NATIONAL_ID", required: true },
    { type: "ATM_CARD", required: true },
  ],
  MISSING_CONTRIBUTION: [
    { type: "PAYSLIP", required: false },
    { type: "SUPPORTING", required: false },
  ],
  DISCREPANCY: [
    { type: "SUPPORTING", required: true },
  ],
  AVC: [],
}

export function getChecklist(caseType: CaseType): DocumentRequirement[] {
  return DOCUMENT_CHECKLISTS[caseType] ?? []
}

export function evaluateCondition(
  condition: string,
  formData: Record<string, unknown>
): boolean {
  switch (condition) {
    case "has_minor_beneficiary":
      return Boolean(formData.has_minor_beneficiary)
    case "has_spouse_claimant":
      return Boolean(formData.has_spouse_claimant)
    case "has_child_claimant":
      return Boolean(formData.has_child_claimant)
    case "reason_is_emigration":
      return formData.leaving_reason === "EMIGRATION"
    case "joined_at_45_plus":
      return Boolean(formData.joined_at_45_plus)
    default:
      return false
  }
}
