import { CaseStatus, Role } from "@prisma/client"

export class AuthError extends Error {
  constructor(code: string, message: string) {
    super(message)
    this.name = code
  }
}

const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  DRAFT: [CaseStatus.SUBMITTED],
  SUBMITTED: [CaseStatus.PENDING_EMPLOYER, CaseStatus.UNDER_REVIEW],
  PENDING_EMPLOYER: [CaseStatus.EMPLOYER_APPROVED, CaseStatus.EMPLOYER_REJECTED],
  EMPLOYER_APPROVED: [CaseStatus.UNDER_REVIEW],
  EMPLOYER_REJECTED: [CaseStatus.CLOSED],
  UNDER_REVIEW: [
    CaseStatus.MORE_INFO_REQUIRED,
    CaseStatus.UNDER_VERIFICATION,
    CaseStatus.APPROVED,
    CaseStatus.REJECTED,
  ],
  MORE_INFO_REQUIRED: [CaseStatus.UNDER_REVIEW],
  UNDER_VERIFICATION: [CaseStatus.AWAITING_TRUSTEE, CaseStatus.APPROVED, CaseStatus.REJECTED],
  AWAITING_TRUSTEE: [CaseStatus.APPROVED, CaseStatus.REJECTED],
  APPROVED: [CaseStatus.PAYMENT_PROCESSING, CaseStatus.COMPLETED],
  PAYMENT_PROCESSING: [CaseStatus.COMPLETED],
  COMPLETED: [CaseStatus.CLOSED],
  REJECTED: [CaseStatus.CLOSED],
  CLOSED: [],
}

export function assertValidTransition(
  currentStatus: CaseStatus,
  nextStatus: CaseStatus
): void {
  const validNext = VALID_TRANSITIONS[currentStatus]
  if (!validNext.includes(nextStatus)) {
    throw new AuthError(
      "INVALID_STATUS_TRANSITION",
      `Cannot transition from ${currentStatus} to ${nextStatus}`
    )
  }
}

const ROLE_PERMISSIONS: Record<string, Set<string>> = {
  MEMBER: new Set(["CREATE_CASE", "SUBMIT_CASE", "SUBMIT_ADDITIONAL_INFO"]),
  CLAIMANT: new Set(["CREATE_CASE", "SUBMIT_CASE", "SUBMIT_ADDITIONAL_INFO"]),
  EMPLOYER: new Set(["EMPLOYER_APPROVE", "EMPLOYER_REJECT"]),
  PSSF_OFFICER: new Set(["PSSF_APPROVE", "PSSF_REJECT", "PSSF_REQUEST_MORE_INFO"]),
  PSSF_SUPERVISOR: new Set([
    "PSSF_APPROVE",
    "PSSF_REJECT",
    "PSSF_REQUEST_MORE_INFO",
    "PSSF_REASSIGN",
    "PSSF_CLOSE",
    "TRUSTEE_DECIDE",
  ]),
  ADMIN: new Set([]),
}

export function assertRoleCanPerformAction(role: Role, action: string): void {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions?.has(action)) {
    throw new AuthError("FORBIDDEN", `Role ${role} cannot perform action ${action}`)
  }
}
