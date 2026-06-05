import { z } from "zod"
import { CaseType, ApprovalDecision } from "@prisma/client"

export const CreateCaseSchema = z.object({
  type: z.enum(Object.values(CaseType) as [string, ...string[]]),
  formData: z.record(z.string(), z.unknown()),
})

export const UpdateFormDataSchema = z.object({
  formData: z.record(z.string(), z.unknown()),
})

export const SubmitCaseSchema = z.object({
  declarationAccepted: z.boolean(),
  otpVerified: z.boolean(),
})

export const AdditionalInfoSchema = z.object({
  response: z.record(z.string(), z.unknown()),
})

export const AddNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
})

export const ReassignSchema = z.object({
  assigneeId: z.string().uuid("Invalid assignee ID"),
})

export const EmployerApprovalSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "REQUEST_CORRECTION"]),
  reason: z.string().optional(),
  comments: z.string().optional(),
})

export const PssfApprovalSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "REQUEST_MORE_INFO"]),
  reason: z.string().optional(),
  comments: z.string().optional(),
})

export const TrusteeDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().optional(),
  comments: z.string().optional(),
})

export type CreateCaseInput = z.infer<typeof CreateCaseSchema>
export type UpdateFormDataInput = z.infer<typeof UpdateFormDataSchema>
export type SubmitCaseInput = z.infer<typeof SubmitCaseSchema>
export type AdditionalInfoInput = z.infer<typeof AdditionalInfoSchema>
export type AddNoteInput = z.infer<typeof AddNoteSchema>
export type ReassignInput = z.infer<typeof ReassignSchema>
export type EmployerApprovalInput = z.infer<typeof EmployerApprovalSchema>
export type PssfApprovalInput = z.infer<typeof PssfApprovalSchema>
export type TrusteeDecisionInput = z.infer<typeof TrusteeDecisionSchema>
