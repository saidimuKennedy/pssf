import * as React from "react"
import { EmailHeader } from "@/emails/header"
import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components"

interface Props {
  variables: Record<string, string>
}

function sub(t: string, v: Record<string, string>) {
  return t.replace(/\[(\w+)\]/g, (_, k) => v[k] ?? `[${k}]`)
}

export default function CaseSubmittedEmail({ variables }: Props) {
  return (
    <Html>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
        <EmailHeader />
        <Container style={{ padding: "32px" }}>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            Dear Member,
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            Your {sub("[case_type_label]", variables)} has been submitted successfully.
          </Text>
          <Section
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: "8px",
              padding: "16px",
              margin: "24px 0",
            }}
          >
            <Text style={{ fontSize: "14px", color: "#166534", margin: 0 }}>
              <strong>Reference Number:</strong> {sub("[case_reference]", variables)}
            </Text>
          </Section>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            We will review your application and notify you of any updates. Please keep your
            reference number for your records.
          </Text>
          <Button
            href={process.env.NEXT_PUBLIC_APP_URL ?? "https://pssf.go.ke"}
            style={{
              backgroundColor: "#1A7A4A",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "4px",
              fontSize: "16px",
              textDecoration: "none",
            }}
          >
            View My Requests
          </Button>
          <Hr style={{ borderColor: "#e2e8f0", margin: "32px 0" }} />
          <Text style={{ fontSize: "12px", color: "#0D2137" }}>
            PSSF Smart Self-Service Platform
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
