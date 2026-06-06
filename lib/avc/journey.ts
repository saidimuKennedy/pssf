import { AVCAction } from "@prisma/client"

export const AVC_STEPS = [
  "Identity",
  "Details",
  "AVC Details",
  "Declaration",
  "Preview",
  "Confirm",
  "Done",
] as const

export const AVC_ACTION_LABELS: Record<AVCAction, string> = {
  NEW: "New Contribution",
  VARY: "Vary Contribution",
  CANCEL: "Cancel Contributions",
}

export const AVC_ACTION_DESCRIPTIONS: Record<AVCAction, string> = {
  NEW: "Start making additional voluntary contributions to your pension.",
  VARY: "Change the amount of your existing AVC deductions.",
  CANCEL: "Stop your additional voluntary contributions from a specified date.",
}

export function routingDestinationLabel(method: string | undefined): string {
  return method === "MOBILE_WALLET"
    ? "This will be sent directly to PSSF for processing"
    : "This will be sent to your employer HR for confirmation"
}

export function submittedNextSteps(method: string | undefined): string {
  return method === "MOBILE_WALLET"
    ? "PSSF will process your contribution request."
    : "Your employer HR will confirm the payroll deduction."
}
