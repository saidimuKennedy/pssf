"use server"

import { prisma } from "@/lib/db"
import { generateOTP } from "@/lib/kra/otp"

export async function resendOtpAction(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string | null

  if (!phone) return { error: "Missing phone number." }

  const user = await prisma.user.findFirst({ where: { phone } })

  if (!user) return { error: "Account not found." }

  const result = await generateOTP(phone)
  
  if (!result.success) {
      return { error: "Could not send your verification code. Please try again." }
  }

  return { success: true }
}
