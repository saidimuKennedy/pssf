// Extracts a usable phone number from a URL query param value.
//
// Campaign links arrive as `…/sign-up?phone=<value>`. Normally <value> is a
// bare number (e.g. "254712345678"), but a misconfigured broadcast can stuff
// the whole link in — e.g. "https://pssf.vercel.app/sign-up?phone=254712345678".
// This recovers the actual number regardless.
export function extractPhoneParam(raw: string | null | undefined): string {
  if (!raw) return ""
  let value = raw.trim()

  // Unwrap a nested link: take whatever follows the last `phone=`.
  const lastPhoneIdx = value.lastIndexOf("phone=")
  if (lastPhoneIdx !== -1) value = value.slice(lastPhoneIdx + "phone=".length)

  // Try to decode percent-encoding (e.g. %2B for +); ignore if malformed.
  try {
    value = decodeURIComponent(value)
  } catch {
    // leave as-is
  }

  // Keep only a leading + and digits; drop everything else (query junk, slashes).
  const cleaned = value.replace(/[^\d+]/g, "")
  const plus = cleaned.startsWith("+") ? "+" : ""
  const digits = cleaned.replace(/\+/g, "")
  return digits ? `${plus}${digits}` : ""
}

// Canonical phone format stored in the DB and used for lookups: `+254XXXXXXXXX`.
// Accepts 0…, 254…, +254…, or bare 7…/1… and returns the +254 form.
// Storing inconsistently (e.g. "254…" from a webview URL) breaks login, which
// always normalises before looking the user up.
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return ""
  let n = raw.trim().replace(/[^\d+]/g, "")
  if (n.startsWith("+")) return n
  if (n.startsWith("0")) return "+254" + n.slice(1)
  if (n.startsWith("254")) return "+" + n
  if (/^[17]\d{8}$/.test(n)) return "+254" + n // bare 7XXXXXXXX / 1XXXXXXXX
  return n ? "+" + n : ""
}
