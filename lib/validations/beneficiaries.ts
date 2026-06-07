import { z } from "zod"

const kenyanPhone = z
  .string()
  .regex(/^\+254[17]\d{8}$/, "Phone must be a Kenyan number starting with +254")
  .optional()

export const RelationshipEnum = z.enum(["Child", "Spouse", "Parent", "Other"])

export const MinorBenefitOptionSchema = z.enum(["TRUST", "GUARDIAN"])

const baseBeneficiaryFields = {
  surname: z.string().min(1, "Surname is required"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  relationship: RelationshipEnum,
  relationship_other: z.string().optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  mobile_number: kenyanPhone,
  allocation_percent: z
    .number()
    .min(0.01, "Allocation must be at least 0.01%")
    .max(100, "Allocation cannot exceed 100%"),
  is_minor: z.boolean(),
}

export const BeneficiarySchema = z
  .object({
    ...baseBeneficiaryFields,
    national_id: z.string().optional(),
    birth_cert_number: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.relationship === "Other" && !data.relationship_other?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the relationship",
        path: ["relationship_other"],
      })
    }
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
        message: "National ID or birth certificate number is required",
        path: ["national_id"],
      })
    }
  })

export const MinorBeneficiarySchema = z.object({
  ...baseBeneficiaryFields,
  is_minor: z.literal(true),
  birth_cert_number: z.string().min(1, "Birth certificate number is required"),
  national_id: z.undefined().optional(),
})

export const GuardianSchema = z.object({
  guardian_name: z.string().min(1, "Guardian name is required"),
  guardian_relationship: z.string().min(1, "Relationship is required"),
  guardian_address: z.string().min(1, "Address is required"),
  guardian_postal_code: z.string().min(1, "Postal code is required"),
  guardian_town: z.string().min(1, "Town is required"),
  guardian_mobile: kenyanPhone.refine((v) => v !== undefined, "Mobile number is required"),
  minor_benefit_option: MinorBenefitOptionSchema,
})

export const WitnessSchema = z.object({
  witnessed_by: z.string().min(1, "Witness name is required"),
  witness_id_number: z.string().min(1, "Witness ID number is required"),
  witness_signature: z.string().min(1, "Witness signature is required"),
  witness_mobile: kenyanPhone.refine((v) => v !== undefined, "Witness mobile is required"),
  witness_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
})

export type BeneficiaryInput = z.infer<typeof BeneficiarySchema>
export type GuardianInput = z.infer<typeof GuardianSchema>
export type WitnessInput = z.infer<typeof WitnessSchema>
