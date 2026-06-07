import { CaseStatus, CaseType, Role } from "@prisma/client"

export class AuthError extends Error {
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = code
    this.details = details
  }
}

const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  DRAFT: [CaseStatus.SUBMITTED],
  SUBMITTED: [CaseStatus.PENDING_EMPLOYER, CaseStatus.UNDER_REVIEW],
  PENDING_EMPLOYER: [CaseStatus.EMPLOYER_APPROVED, CaseStatus.EMPLOYER_REJECTED, CaseStatus.DRAFT],
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
  nextStatus: CaseStatus,
  caseType?: CaseType
): void {
  const validNext = VALID_TRANSITIONS[currentStatus]
  if (!validNext.includes(nextStatus)) {
    throw new AuthError(
      "INVALID_STATUS_TRANSITION",
      `Cannot transition from ${currentStatus} to ${nextStatus}`
    )
  }

  if (nextStatus === CaseStatus.AWAITING_TRUSTEE && caseType !== CaseType.DEATH_BENEFITS_CLAIM) {
    throw new AuthError(
      "INVALID_STATUS_TRANSITION",
      "AWAITING_TRUSTEE is only allowed for death benefits claims"
    )
  }

  if (
    nextStatus === CaseStatus.PAYMENT_PROCESSING &&
    caseType &&
    caseType !== CaseType.BENEFITS_CLAIM &&
    caseType !== CaseType.DEATH_BENEFITS_CLAIM
  ) {
    throw new AuthError(
      "INVALID_STATUS_TRANSITION",
      "PAYMENT_PROCESSING is only allowed for benefits claim cases"
    )
  }
}

const ROLE_PERMISSIONS: Record<string, Set<string>> = {
  MEMBER: new Set(["CREATE_CASE", "SUBMIT", "SUBMIT_CASE", "SUBMIT_ADDITIONAL_INFO", "ROUTE"]),
  CLAIMANT: new Set(["CREATE_CASE", "SUBMIT", "SUBMIT_CASE", "SUBMIT_ADDITIONAL_INFO", "ROUTE"]),
  EMPLOYER: new Set([
    "EMPLOYER_APPROVE",
    "EMPLOYER_REJECT",
    "EMPLOYER_REQUEST_CORRECTION",
    "EMPLOYER_DECIDE",
    "ROUTE",
  ]),
  PSSF_OFFICER: new Set([
    "PSSF_APPROVE",
    "PSSF_REJECT",
    "PSSF_REQUEST_MORE_INFO",
    "PSSF_DECIDE",
    "ROUTE",
    "ROUTE_TO_VERIFICATION",
    "ROUTE_TO_TRUSTEE",
    "MARK_PAYMENT_PROCESSING",
    "MARK_PAID",
    "CLOSE_CASE",
  ]),
  PSSF_SUPERVISOR: new Set([
    "PSSF_APPROVE",
    "PSSF_REJECT",
    "PSSF_REQUEST_MORE_INFO",
    "PSSF_DECIDE",
    "PSSF_REASSIGN",
    "PSSF_CLOSE",
    "CLOSE_CASE",
    "TRUSTEE_DECIDE",
    "ROUTE",
    "ROUTE_TO_VERIFICATION",
    "ROUTE_TO_TRUSTEE",
    "MARK_PAYMENT_PROCESSING",
    "MARK_PAID",
  ]),
  ADMIN: new Set(["ROUTE", "CLOSE_CASE"]),
}

export function assertRoleCanPerformAction(role: Role, action: string): void {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions?.has(action)) {
    throw new AuthError("FORBIDDEN", `Role ${role} cannot perform action ${action}`)
  }
}
