function cleanPhone(phone: string): string {
  let n = phone.trim().replace(/[^\d]/g, "")
  if (n.startsWith("0")) n = "254" + n.slice(1)
  else if (!n.startsWith("254")) n = "254" + n
  return n
}

export interface KraMemberResult {
  success: boolean
  name?: string
  yob?: string
  kra_pin?: string
  national_id?: string
  error?: string
}

export async function lookupById(
  idNumber: string,
  phone: string,
  yearOfBirth: string,
  type: "citizen" | "alien" = "citizen"
): Promise<KraMemberResult> {
  const base = process.env.KRA_API_URL
  const mock = !base || process.env.KRA_MOCK === "true"
  if (mock) {
    if (process.env.NODE_ENV === "production") throw new Error("KRA_API_URL is not configured")
    console.warn(`[KRA Members] DEV mock: bypassing id-lookup for ${idNumber}`)
    return { success: true, national_id: idNumber.trim() }
  }

  const msisdn = cleanPhone(phone)

  let res: Response
  try {
    res = await fetch(`${base}/ussd/id-lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-source-for": "whatsapp",
        "x-forwarded-for": "whatsapp",
      },
      body: JSON.stringify({ id_number: idNumber.trim(), msisdn, type }),
    })
  } catch (err) {
    console.error(`[KRA Members] Network error for id-lookup ${idNumber}:`, err)
    return { success: false, error: "Network error contacting KRA identity service" }
  }

  let body: Record<string, unknown> = {}
  try {
    body = await res.json()
  } catch {
    // non-JSON
  }

  if (!res.ok || !body.name || !body.yob) {
    const msg = (body.message as string | undefined) ?? `HTTP ${res.status}`
    console.error(`[KRA Members] id-lookup failed for ${idNumber}: ${msg}`)
    return { success: false, error: msg }
  }

  const returnedYob = String(body.yob)
  if (returnedYob !== yearOfBirth.trim()) {
    return { success: false, error: "Identity details do not match our records. Please check your information." }
  }

  return {
    success: true,
    name: body.name as string,
    yob: returnedYob,
    kra_pin: body.pin as string | undefined,
    national_id: (body.id_number as string | undefined) ?? idNumber.trim(),
  }
}
