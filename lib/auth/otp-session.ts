import { prisma } from "@/lib/db"
import { AuthError } from "@/lib/state-machine/guards"

const OTP_SESSION_MS = 10 * 60 * 1000

export async function assertRecentOtpVerified(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true, email: true },
  })

  const since = new Date(Date.now() - OTP_SESSION_MS)
  const verified = await prisma.otpRequest.findFirst({
    where: {
      verified: true,
      created_at: { gt: since },
      OR: [
        { user_id: userId },
        ...(user?.phone ? [{ phone: user.phone }] : []),
        ...(user?.email ? [{ email: user.email }] : []),
      ],
    },
    orderBy: { created_at: "desc" },
  })

  if (!verified) {
    throw new AuthError(
      "OTP_REQUIRED",
      "OTP verification required. Please verify the code sent to your phone."
    )
  }
}
