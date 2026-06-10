"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { generateOTP, validateOTP } from "@/lib/kra/otp"

async function getMemberPhone(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } })
  return user?.phone ?? null
}

export async function sendDeclarationOtpAction() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated." }

  const phone = await getMemberPhone(session.user.id)
  if (!phone) return { error: "No phone number on your account. Contact support." }

  const result = await generateOTP(phone)
  if (!result.success) return { error: "Could not send verification code. Please try again." }

  const masked = phone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2")
  return { success: true, masked }
}

export async function verifyDeclarationOtpAction(otp: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated." }

  const phone = await getMemberPhone(session.user.id)
  if (!phone) return { error: "No phone number on account." }

  const result = await validateOTP(phone, otp)
  if (!result.success) return { error: "Invalid or expired code. Please try again." }

  return { success: true }
}
