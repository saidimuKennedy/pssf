export const DEATH_STEPS = [
  "Deceased",
  "Details",
  "Claimants",
  "Home",
  "Option",
  "Payment",
  "Documents",
  "Witness",
  "Declaration",
  "Preview",
  "Confirm",
  "Done",
] as const

export const DEATH_OPTION_TEXT: Record<string, { title: string; description: string }> = {
  LUMPSUM_THIRD_ANNUITY: {
    title: "One-third lumpsum + annuity",
    description: "One-third paid as lumpsum, remainder as annuity to beneficiaries.",
  },
  LUMPSUM_THIRD_DRAWDOWN: {
    title: "One-third lumpsum + drawdown",
    description: "One-third paid as lumpsum, remainder through drawdown.",
  },
  FULL_ANNUITY: {
    title: "Full annuity",
    description: "Entire benefit paid as annuity to beneficiaries.",
  },
  FULL_DRAWDOWN: {
    title: "Full drawdown",
    description: "Entire benefit paid through drawdown arrangement.",
  },
  TRUST_FUND_MINORS: {
    title: "Trust fund for minors",
    description: "Benefits for minor claimants paid to a trust established by the Trustees.",
  },
  FULL_LUMPSUM: {
    title: "Full lumpsum",
    description: "Entire death benefit paid as a lumpsum to beneficiaries.",
  },
}

export function syncClaimantFlags(claimants: { relationship: string; is_minor: boolean }[]) {
  return {
    has_spouse_claimant: claimants.some(
      (c) => c.relationship.toLowerCase().includes("spouse") || c.relationship.toLowerCase() === "wife" || c.relationship.toLowerCase() === "husband"
    ),
    has_child_claimant: claimants.some(
      (c) => c.relationship.toLowerCase().includes("child") || c.relationship.toLowerCase() === "son" || c.relationship.toLowerCase() === "daughter"
    ),
    has_minor_claimant: claimants.some((c) => c.is_minor),
  }
}
