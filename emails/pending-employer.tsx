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

export default function PendingEmployerEmail({ variables }: Props) {
  return (
    <Html>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
        <EmailHeader />
        <Container style={{ padding: "32px" }}>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            Dear {sub("[employer_name]", variables)} HR Team,
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            A {sub("[case_type_label]", variables)} has been submitted by{" "}
            {sub("[member_name]", variables)} and requires your confirmation before it can be
            processed.
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            <strong>Reference:</strong> {sub("[case_reference]", variables)}
            <br />
            <strong>Required by:</strong> {sub("[due_by]", variables)}
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
            Review on Employer Portal
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
