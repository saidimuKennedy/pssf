import { z } from "zod"

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
const positiveAmount = z.number().positive("Amount must be greater than zero")

const kenyanPhone = z
  .string()
  .regex(/^\+254[17]\d{8}$/, "Phone must be a Kenyan number starting with +254")

const AVCMethodSchema = z.enum(["PAYROLL", "MOBILE_WALLET"])

export const PayrollMethodSchema = z.object({
  avc_method: z.literal("PAYROLL"),
})

export const MobileWalletMethodSchema = z.object({
  avc_method: z.literal("MOBILE_WALLET"),
  mobile_wallet_number: kenyanPhone,
})

export const NewAVCSchema = z
  .object({
    avc_action: z.literal("NEW"),
    new_amount: positiveAmount,
    commencement_date: isoDate,
    avc_method: AVCMethodSchema,
    mobile_wallet_number: kenyanPhone.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.avc_method === "MOBILE_WALLET" && !data.mobile_wallet_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile wallet number is required",
        path: ["mobile_wallet_number"],
      })
    }
  })

export const VaryAVCSchema = z
  .object({
    avc_action: z.literal("VARY"),
    current_amount: positiveAmount,
    new_amount: positiveAmount,
    effective_date: isoDate,
    avc_method: AVCMethodSchema,
    mobile_wallet_number: kenyanPhone.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.avc_method === "MOBILE_WALLET" && !data.mobile_wallet_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile wallet number is required",
        path: ["mobile_wallet_number"],
      })
    }
  })

export const CancelAVCSchema = z
  .object({
    avc_action: z.literal("CANCEL"),
    current_amount: positiveAmount.optional(),
    effective_date: isoDate,
    avc_method: AVCMethodSchema,
    mobile_wallet_number: kenyanPhone.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.avc_method === "MOBILE_WALLET" && !data.mobile_wallet_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mobile wallet number is required",
        path: ["mobile_wallet_number"],
      })
    }
  })

export const AVCFormDataSchema = z.discriminatedUnion("avc_action", [
  NewAVCSchema,
  VaryAVCSchema,
  CancelAVCSchema,
])

export const EmployerAVCApprovalSchema = z.object({
  effective_payroll_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Effective month must be YYYY-MM format"),
  officer_name: z.string().min(1, "Officer name is required"),
  designation: z.string().min(1, "Designation is required"),
})

export type NewAVCInput = z.infer<typeof NewAVCSchema>
export type VaryAVCInput = z.infer<typeof VaryAVCSchema>
export type CancelAVCInput = z.infer<typeof CancelAVCSchema>
export type AVCFormData = z.infer<typeof AVCFormDataSchema>
