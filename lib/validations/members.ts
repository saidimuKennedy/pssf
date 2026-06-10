import { z } from "zod"

export const ValidateMemberSchema = z.object({
  national_id: z.string().min(1, "National ID is required"),
  year_of_birth: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit year"),
})

const kenyanPhone = z
  .string()
  .regex(/^\+254[17]\d{8}$/, "Phone must be a Kenyan number starting with +254")

export const UpdateContactSchema = z.object({
  mobile_number: kenyanPhone.optional(),
  email: z.string().email("Invalid email address").optional(),
  postal_address: z.string().max(255).optional(),
  postal_code: z.string().max(10).optional(),
  town: z.string().max(100).optional(),
  communication_pref: z.enum(["WHATSAPP", "EMAIL", "PORTAL"]).optional(),
})

export const EnrolmentFormDataSchema = z.object({
  national_id: z.string().min(1, "National ID is required"),
  date_of_birth: z.string().min(1),
  full_name: z.string().min(1, "Full name is required"),
  mobile_number: kenyanPhone,
  email: z.string().email().optional(),
  kra_pin: z
    .string()
    .regex(/^[A-Z]\d{9}[A-Z]$/, "KRA PIN must be in format A000000000X")
    .optional(),
  postal_address: z.string().optional(),
  postal_code: z.string().optional(),
  town: z.string().optional(),
  declaration_accepted: z.boolean().refine((v) => v === true, {
    message: "You must accept the declaration",
  }),
})

export type ValidateMemberInput = z.infer<typeof ValidateMemberSchema>
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>
export type EnrolmentFormData = z.infer<typeof EnrolmentFormDataSchema>
