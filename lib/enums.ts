// Plain const enums safe to import in both Server and Client Components.
// Values mirror the Prisma schema — update both if the schema changes.

export const Role = {
  MEMBER: "MEMBER",
  CLAIMANT: "CLAIMANT",
  EMPLOYER: "EMPLOYER",
  PSSF_OFFICER: "PSSF_OFFICER",
  PSSF_SUPERVISOR: "PSSF_SUPERVISOR",
  ADMIN: "ADMIN",
} as const
export type Role = (typeof Role)[keyof typeof Role]

export const CaseType = {
  MEMBER_ENROLMENT: "MEMBER_ENROLMENT",
  BENEFICIARY_NOMINATION: "BENEFICIARY_NOMINATION",
  AVC: "AVC",
  BENEFITS_CLAIM: "BENEFITS_CLAIM",
  DEATH_BENEFITS_CLAIM: "DEATH_BENEFITS_CLAIM",
  MISSING_CONTRIBUTION: "MISSING_CONTRIBUTION",
  DISCREPANCY: "DISCREPANCY",
} as const
export type CaseType = (typeof CaseType)[keyof typeof CaseType]

export const CaseStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  PENDING_EMPLOYER: "PENDING_EMPLOYER",
  EMPLOYER_APPROVED: "EMPLOYER_APPROVED",
  EMPLOYER_REJECTED: "EMPLOYER_REJECTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  MORE_INFO_REQUIRED: "MORE_INFO_REQUIRED",
  UNDER_VERIFICATION: "UNDER_VERIFICATION",
  AWAITING_TRUSTEE: "AWAITING_TRUSTEE",
  APPROVED: "APPROVED",
  PAYMENT_PROCESSING: "PAYMENT_PROCESSING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
} as const
export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus]
