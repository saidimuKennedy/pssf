import { z } from "zod"

export const RequestOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number"),
})

export const VerifyOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  code: z.string().min(4).max(6).regex(/^[A-Z0-9]+$/i, "Invalid OTP code"),
})

export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const SignUpSchema = z.object({
  national_id: z
    .string()
    .min(6, "National ID must be at least 6 characters")
    .max(20, "National ID is too long"),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number"),
})

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type SignUpInput = z.infer<typeof SignUpSchema>
