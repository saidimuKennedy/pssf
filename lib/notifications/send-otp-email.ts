import * as React from "react"
import { render } from "@react-email/render"
import OtpEmail from "@/emails/otp"

// Renders and sends the styled OTP email via Resend, with retries.
// In development, a delivery failure is tolerated (the dev code is fixed and logged)
// so flows remain testable without a verified Resend sender domain.
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const html = await render(React.createElement(OtpEmail, { variables: { otp_code: code } }))
  const MAX_ATTEMPTS = 3
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "noreply@pssf.go.ke",
        to,
        subject: "Your sign-in verification code",
        html,
      })
      if (error) throw new Error(`Resend error: ${error.message}`)
      console.log(`[OTP] Email sent id=${data?.id} to=${to} (attempt ${attempt})`)
      return
    } catch (err) {
      lastErr = err
      console.warn(`[OTP] Email attempt ${attempt}/${MAX_ATTEMPTS} failed: ${err instanceof Error ? err.message : err}`)
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 500 * attempt))
    }
  }
  if (process.env.NODE_ENV === "development") {
    console.warn(`[OTP] Dev mode: email delivery failed but code is known. code=${code} to=${to}`)
    return
  }
  throw lastErr
}
