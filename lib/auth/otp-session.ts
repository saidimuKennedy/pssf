import { prisma } from "@/lib/db"
import { AuthError } from "@/lib/state-machine/guards"

const OTP_SESSION_MS = 10 * 60 * 1000

export async function assertRecentOtpVerified(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { otp_verified_at: true },
  })

  const since = new Date(Date.now() - OTP_SESSION_MS)

  if (!user?.otp_verified_at || user.otp_verified_at < since) {
    throw new AuthError(
      "OTP_REQUIRED",
      "OTP verification required. Please verify the code sent to your phone."
    )
  }
}
