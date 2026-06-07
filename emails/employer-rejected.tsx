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

export default function EmployerRejectedEmail({ variables }: Props) {
  return (
    <Html>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
        <EmailHeader />
        <Container style={{ padding: "32px" }}>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            Dear Member,
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            Your {sub("[case_type_label]", variables)} (Ref:{" "}
            {sub("[case_reference]", variables)}) could not be confirmed by your employer.
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            <strong>Reason:</strong> {sub("[rejection_reason]", variables)}
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            Please contact PSSF for guidance on how to resolve this.
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
            Visit Portal
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
