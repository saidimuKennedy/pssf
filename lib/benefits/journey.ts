import { RETIREMENT_REASONS } from "@/lib/validations/benefits"

export const BENEFITS_STEPS = [
  "Identity",
  "Details",
  "Payment",
  "Leaving",
  "Option",
  "Transfer",
  "Summary",
  "Documents",
  "Declaration",
  "Preview",
  "Confirm",
  "Done",
] as const

export const OPTION_STEP = 5
export const TRANSFER_STEP = 6

export function isRetirementReason(reason: string | undefined): boolean {
  return reason ? RETIREMENT_REASONS.has(reason) : false
}

export function getBenefitsSkippedSteps(formData: Record<string, unknown>): number[] {
  const skipped: number[] = []
  const reason = formData.reason_for_leaving as string | undefined
  if (!isRetirementReason(reason)) {
    skipped.push(OPTION_STEP, TRANSFER_STEP)
  } else if (!formData.transfer_to_registered_scheme) {
    skipped.push(TRANSFER_STEP)
  }
  return skipped
}

export function nextAfterLeaving(caseId: string, reason: string): string {
  return isRetirementReason(reason)
    ? `/member/claims/benefits/option?case_id=${caseId}`
    : `/member/claims/benefits/summary?case_id=${caseId}`
}

export function nextAfterOption(caseId: string, transfer: boolean): string {
  return transfer
    ? `/member/claims/benefits/transfer?case_id=${caseId}`
    : `/member/claims/benefits/summary?case_id=${caseId}`
}

export const BENEFIT_OPTION_TEXT: Record<string, { title: string; description: string }> = {
  LUMPSUM_THIRD_ANNUITY: {
    title: "One-third lumpsum + annuity",
    description: "Receive one-third of your benefit as a lumpsum and the remainder as an annuity.",
  },
  LUMPSUM_THIRD_DRAWDOWN: {
    title: "One-third lumpsum + drawdown",
    description: "Receive one-third as a lumpsum and the remainder through a drawdown arrangement.",
  },
  FULL_ANNUITY: {
    title: "Full annuity",
    description: "Receive your entire benefit as an annuity payable for life.",
  },
  FULL_DRAWDOWN: {
    title: "Full drawdown",
    description: "Receive your entire benefit through a drawdown arrangement.",
  },
  FULL_LUMPSUM_TRIVIAL: {
    title: "Full lumpsum (trivial)",
    description: "Receive your entire benefit as a lumpsum where the amount is trivial.",
  },
}
