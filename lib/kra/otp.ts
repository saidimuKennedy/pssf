/**
 * KRA Pesaflow OTP client
 *
 * Single entry-point for all OTP calls to the Pesaflow USSD API.
 * No other file should call the Pesaflow API directly.
 *
 * Environment:
 *   KRA_API_URL  — base URL, no trailing slash
 *                  e.g. https://kraqa.pesaflow.com:30001/api
 */

function cleanPhone(phone: string): string {
  let n = phone.trim().replace(/[^\d]/g, "")
  if (n.startsWith("0")) n = "254" + n.slice(1)
  else if (!n.startsWith("254")) n = "254" + n
  return n
}

export interface KraOtpResult {
  success: boolean
  message?: string
}

/**
 * Request an OTP to be sent to the given MSISDN via Pesaflow.
 */
export async function generateOTP(rawMsisdn: string): Promise<KraOtpResult> {
  const base = process.env.KRA_API_URL
  if (!base) throw new Error("KRA_API_URL is not configured")

  const url = `${base}/ussd/otp`
  const msisdn = cleanPhone(rawMsisdn)

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msisdn }),
    })
  } catch (err) {
    console.error(`[KRA OTP] Network error sending OTP to ${msisdn}:`, err)
    return { success: false, message: "Network error contacting KRA OTP service" }
  }

  let body: Record<string, unknown> = {}
  try {
    body = await res.json()
  } catch {
    // non-JSON response — treat HTTP status as the indicator
  }

  if (!res.ok || body.success === false) {
    const message = (body.message as string | undefined) ?? `HTTP ${res.status}`
    console.error(`[KRA OTP] generateOTP failed for ${msisdn}: ${message}`)
    return { success: false, message }
  }

  console.log(`[KRA OTP] OTP requested for ${msisdn}`)
  return { success: true, message: (body.message as string | undefined) }
}

/**
 * Validate an OTP code for the given MSISDN via Pesaflow.
 */
export async function validateOTP(rawMsisdn: string, otp: string): Promise<KraOtpResult> {
  const base = process.env.KRA_API_URL
  if (!base) throw new Error("KRA_API_URL is not configured")

  const url = `${base}/ussd/validate-otp`
  const msisdn = cleanPhone(rawMsisdn)
  // Gateway codes are uppercase alphanumeric (e.g. NPGDVD) and case-sensitive.
  const otpCode = otp.trim().toUpperCase()

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msisdn, otp: otpCode }),
    })
  } catch (err) {
    console.error(`[KRA OTP] Network error validating OTP for ${msisdn}:`, err)
    return { success: false, message: "Network error contacting KRA OTP service" }
  }

  let body: Record<string, unknown> = {}
  try {
    body = await res.json()
  } catch {
    // non-JSON response — treat HTTP status as the indicator
  }

  if (!res.ok || body.success === false) {
    const message = (body.message as string | undefined) ?? `HTTP ${res.status}`
    console.error(`[KRA OTP] validateOTP failed for ${msisdn}: ${message}`)
    return { success: false, message }
  }

  console.log(`[KRA OTP] OTP validated for ${msisdn}`)
  return { success: true, message: (body.message as string | undefined) }
}
