import { z } from "zod"

const BENEFIT_OPTION_VALUES = [
  "LUMPSUM_THIRD_ANNUITY",
  "LUMPSUM_THIRD_DRAWDOWN",
  "FULL_ANNUITY",
  "FULL_DRAWDOWN",
  "FULL_LUMPSUM_TRIVIAL",
] as const

const kenyanPhone = z
  .string()
  .regex(/^\+254[17]\d{8}$/, "Phone must be a Kenyan number starting with +254")

export const LeavingReasonSchema = z.enum([
  "NORMAL_RETIREMENT",
  "EARLY_RETIREMENT",
  "RULE_12_16_20",
  "RESIGNATION",
  "TERMINATION",
  "EMIGRATION",
  "OTHER",
])

export const BenefitOptionSchema = z.enum(BENEFIT_OPTION_VALUES)

export const RETIREMENT_REASONS = new Set([
  "NORMAL_RETIREMENT",
  "EARLY_RETIREMENT",
  "RULE_12_16_20",
])

export const PaymentDetailsSchema = z.object({
  bank_account_number: z.string().min(1, "Bank account number is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  bank_branch: z.string().min(1, "Bank branch is required"),
  mpesa_number: kenyanPhone.optional(),
  payment_confirmed: z.boolean().refine((v) => v === true, {
    message: "You must confirm payment details are correct",
  }),
})

export const TransferSchemeSchema = z
  .object({
    transfer_scheme_name: z.string().optional(),
    transfer_scheme_administrator: z.string().optional(),
    transfer_scheme_account_name: z.string().optional(),
    transfer_scheme_account_number: z.string().optional(),
    transfer_scheme_bank: z.string().optional(),
    transfer_scheme_branch: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const fields = [
      data.transfer_scheme_name,
      data.transfer_scheme_administrator,
      data.transfer_scheme_account_name,
      data.transfer_scheme_account_number,
      data.transfer_scheme_bank,
      data.transfer_scheme_branch,
    ]
    const anyPresent = fields.some((f) => f && f.trim().length > 0)
    const allPresent = fields.every((f) => f && f.trim().length > 0)
    if (anyPresent && !allPresent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "All transfer scheme fields are required when transferring to another scheme",
        path: ["transfer_scheme_name"],
      })
    }
  })

export const BenefitsClaimFormDataSchema = z
  .object({
    bank_account_number: z.string().min(1),
    bank_name: z.string().min(1),
    bank_branch: z.string().min(1),
    mpesa_number: kenyanPhone.optional(),
    date_of_leaving: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason_for_leaving: LeavingReasonSchema,
    benefit_option: BenefitOptionSchema.optional(),
    transfer_to_registered_scheme: z.boolean().optional(),
    transfer_scheme_name: z.string().optional(),
    transfer_scheme_administrator: z.string().optional(),
    transfer_scheme_account_name: z.string().optional(),
    transfer_scheme_account_number: z.string().optional(),
    transfer_scheme_bank: z.string().optional(),
    transfer_scheme_branch: z.string().optional(),
    payment_confirmed: z.boolean(),
    preview_payment_confirmed: z.boolean().optional(),
    declaration_accepted: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (RETIREMENT_REASONS.has(data.reason_for_leaving) && !data.benefit_option && !data.transfer_to_registered_scheme) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Benefit option or transfer selection is required for retirement claims",
        path: ["benefit_option"],
      })
    }
    const transferFields = [
      data.transfer_scheme_name,
      data.transfer_scheme_administrator,
      data.transfer_scheme_account_name,
      data.transfer_scheme_account_number,
      data.transfer_scheme_bank,
      data.transfer_scheme_branch,
    ]
    if (data.transfer_to_registered_scheme) {
      if (!transferFields.every((f) => f && f.trim().length > 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "All transfer scheme fields are required",
          path: ["transfer_scheme_name"],
        })
      }
    }
  })

export type LeavingReason = z.infer<typeof LeavingReasonSchema>
export type PaymentDetails = z.infer<typeof PaymentDetailsSchema>
