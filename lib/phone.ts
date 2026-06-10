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
