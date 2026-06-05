import { z } from "zod"

export const DOCUMENT_TYPES = [
  "NATIONAL_ID",
  "BIRTH_CERTIFICATE",
  "DEATH_CERTIFICATE",
  "MARRIAGE_CERTIFICATE",
  "EXIT_LETTER",
  "ATM_CARD",
  "KRA_PIN",
  "GUARDIAN_ID",
  "PROOF_OF_RESIDENCY",
  "OPTION_ELECTION",
  "PAYSLIP",
  "SUPPORTING",
] as const

export const DocumentTypeSchema = z.enum(DOCUMENT_TYPES)

export const UploadDocumentSchema = z.object({
  case_id: z.string().uuid("Invalid case ID"),
  document_type: DocumentTypeSchema,
})

export const RejectDocumentSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
})

export type DocumentType = (typeof DOCUMENT_TYPES)[number]
export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>
export type RejectDocumentInput = z.infer<typeof RejectDocumentSchema>
