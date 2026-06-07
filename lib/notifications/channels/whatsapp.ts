import { WA_META_TEMPLATES } from "@/lib/notifications/templates"
import { resolveWhatsAppMessage } from "@/lib/notifications/templates"

export interface CRMPayload {
  recipient_phone: string
  template_ref: string
  variables: Record<string, string>
}

// Sends a WhatsApp template message via the Chatnation Meta Proxy Ingress.
// Endpoint: POST /api/meta/v21.0/{phoneNumberId}/messages
// Auth:     Authorization: Bearer <CHATNATION_WA_ACCESS_TOKEN>
// Tenant resolved server-side by matching token + phoneNumberId to a CRM integration row.
// Routing through Chatnation (vs Meta direct) means Chatnation records the outbound message,
// so the Meta delivery-status webhook matches it and failure reasons are persisted/visible.
export async function sendWhatsApp(payload: CRMPayload): Promise<void> {
  if (process.env.PSSF_MOCK_NOTIFICATIONS === "true") {
    const message = resolveWhatsAppMessage(payload.template_ref, payload.variables)
    console.log("[MOCK WhatsApp]", { to: payload.recipient_phone, message })
    return
  }

  const apiUrl = process.env.CHATNATION_API_URL
  const phoneNumberId = process.env.CHATNATION_WA_PHONE_NUMBER_ID
  const accessToken = process.env.CHATNATION_WA_ACCESS_TOKEN
  if (!apiUrl || !phoneNumberId || !accessToken) {
    throw new Error("CHATNATION_API_URL, CHATNATION_WA_PHONE_NUMBER_ID, or CHATNATION_WA_ACCESS_TOKEN not configured")
  }

  const tmpl = WA_META_TEMPLATES[payload.template_ref]
  if (!tmpl) {
    throw new Error(`No Meta template mapping found for template_ref: ${payload.template_ref}`)
  }

  const body = {
    messaging_product: "whatsapp",
    to: payload.recipient_phone,
    type: "template",
    template: {
      name: tmpl.name,
      language: { code: tmpl.language },
      components: tmpl.components(payload.variables),
    },
  }

  const res = await fetch(`${apiUrl}/api/meta/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`Chatnation Meta proxy responded with ${res.status}: ${await res.text()}`)
  }
}
