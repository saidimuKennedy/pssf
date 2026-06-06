import { z } from "zod"

const kenyanPhone = z
  .string()
  .regex(/^\+254[17]\d{8}$/, "Phone must be a Kenyan number starting with +254")

export const DeathBenefitOptionSchema = z.enum([
  "LUMPSUM_THIRD_ANNUITY",
  "LUMPSUM_THIRD_DRAWDOWN",
  "FULL_ANNUITY",
  "FULL_DRAWDOWN",
  "TRUST_FUND_MINORS",
  "FULL_LUMPSUM",
])

export const DeathClaimantSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    relationship: z.string().min(1, "Relationship is required"),
    national_id: z.string().optional(),
    birth_cert_number: z.string().optional(),
    kra_pin: z
      .string()
      .regex(/^[A-Z]\d{9}[A-Z]$/, "KRA PIN must be in format A000000000X")
      .optional(),
    mobile_number: kenyanPhone,
    is_minor: z.boolean(),
    bank_account_number: z.string().optional(),
    bank_name: z.string().optional(),
    bank_branch: z.string().optional(),
    mpesa_number: kenyanPhone.optional(),
    declaration_confirmed: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_minor) {
      if (!data.birth_cert_number?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Birth certificate number is required for minors",
          path: ["birth_cert_number"],
        })
      }
    } else if (!data.national_id?.trim() && !data.birth_cert_number?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "National ID or birth certificate is required",
        path: ["national_id"],
      })
    }
  })

export const HomeParticularsSchema = z.object({
  county: z.string().min(1, "County is required"),
  subcounty: z.string().min(1, "Subcounty is required"),
  location: z.string().min(1, "Location is required"),
  sublocation: z.string().min(1, "Sublocation is required"),
  village: z.string().min(1, "Village is required"),
  chief_name: z.string().min(1, "Chief's name is required"),
})

export const DeathBenefitsClaimFormDataSchema = z.object({
  deceased_member_id: z.string().optional(),
  date_of_death: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  county: z.string().min(1),
  subcounty: z.string().min(1),
  location: z.string().min(1),
  sublocation: z.string().min(1),
  village: z.string().min(1),
  chief_name: z.string().min(1),
  benefit_option: DeathBenefitOptionSchema,
  claimants: z.array(DeathClaimantSchema).min(1).max(5),
  witness_name: z.string().min(1),
  witness_id: z.string().min(1),
  witness_signature: z.string().min(1),
  witness_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  has_spouse_claimant: z.boolean().optional(),
  has_child_claimant: z.boolean().optional(),
  has_minor_claimant: z.boolean().optional(),
  declaration_accepted: z.boolean().optional(),
})

export type DeathClaimant = z.infer<typeof DeathClaimantSchema>
