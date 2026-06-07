import * as React from "react"
import { Section, Img } from "@react-email/components"

// Logo must be served from a public URL — email clients (Gmail, Outlook) block
// base64 data URIs. In production set NEXT_PUBLIC_APP_URL to the deployed domain.
const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pssf.go.ke"

export function EmailHeader() {
  return (
    <Section
      style={{
        backgroundColor: "#ffffff",
        padding: "24px",
        borderBottom: "4px solid #1A7A4A",
      }}
    >
      <Img
        src={`${baseUrl}/pssf-logo.png`}
        alt="PSSF — Public Service Superannuation Fund"
        width="150"
        height="85"
        style={{ display: "block" }}
      />
    </Section>
  )
}
