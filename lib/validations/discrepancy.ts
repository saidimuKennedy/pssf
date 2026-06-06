import { z } from "zod"

export const DiscrepancyFieldSchema = z.enum([
  "NAME",
  "DATE_OF_BIRTH",
  "ID_PASSPORT",
  "EMPLOYER",
  "EMPLOYMENT_NUMBER",
  "DATE_OF_EMPLOYMENT",
  "KRA_PIN",
  "OTHER",
])

export type DiscrepancyField = z.infer<typeof DiscrepancyFieldSchema>

export const FIELD_LABELS: Record<DiscrepancyField, string> = {
  NAME: "Name",
  DATE_OF_BIRTH: "Date of Birth",
  ID_PASSPORT: "ID / Passport Number",
  EMPLOYER: "Employer",
  EMPLOYMENT_NUMBER: "Employment Number",
  DATE_OF_EMPLOYMENT: "Date of Employment",
  KRA_PIN: "KRA PIN",
  OTHER: "Other",
}

const EMPLOYMENT_FIELDS = new Set<DiscrepancyField>([
  "EMPLOYER",
  "EMPLOYMENT_NUMBER",
  "DATE_OF_EMPLOYMENT",
])

export function deriveFieldCategory(
  field: DiscrepancyField
): "IDENTITY" | "EMPLOYMENT" | "KRA" | "OTHER" {
  if (EMPLOYMENT_FIELDS.has(field)) return "EMPLOYMENT"
  if (field === "KRA_PIN") return "KRA"
  if (field === "OTHER") return "OTHER"
  return "IDENTITY"
}

export function getRoutingNote(field: DiscrepancyField): string {
  const category = deriveFieldCategory(field)
  if (category === "EMPLOYMENT") {
    return "This will be sent to your employer for verification"
  }
  return "This will be sent to PSSF for verification"
}

export const DiscrepancyFormDataSchema = z.object({
  field_name: DiscrepancyFieldSchema,
  correct_information: z.string().min(1, "Correct information is required"),
  explanation: z.string().min(1, "Explanation is required"),
  field_category: z.enum(["IDENTITY", "EMPLOYMENT", "KRA", "OTHER"]).optional(),
})

export const MissingContributionTypeSchema = z.enum(["EMPLOYEE", "EMPLOYER", "BOTH"])

export const MissingContributionFormDataSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM"),
  contribution_type: MissingContributionTypeSchema,
  explanation: z.string().min(1, "Explanation is required"),
  employer_name: z.string().min(1, "Employer name is required"),
})

export type DiscrepancyFormData = z.infer<typeof DiscrepancyFormDataSchema>
export type MissingContributionFormData = z.infer<typeof MissingContributionFormDataSchema>
