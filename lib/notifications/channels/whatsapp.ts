export interface CRMPayload {
  recipient_phone: string
  template_ref: string
  variables: Record<string, string>
}

export async function sendWhatsApp(payload: CRMPayload): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("[MOCK WhatsApp]", JSON.stringify(payload, null, 2))
    return
  }

  const url = process.env.CHATNATION_CRM_URL
  const apiKey = process.env.CHATNATION_CRM_API_KEY
  if (!url || !apiKey) {
    throw new Error("CHATNATION_CRM_URL or CHATNATION_CRM_API_KEY not configured")
  }

  const res = await fetch(`${url}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Chatnation CRM responded with ${res.status}: ${await res.text()}`)
  }
}
