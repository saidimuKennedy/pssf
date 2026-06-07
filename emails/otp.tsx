import * as React from "react"
import { EmailHeader } from "@/emails/header"
import {
  Html,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components"

interface Props {
  variables: Record<string, string>
}

export default function OtpEmail({ variables }: Props) {
  const code = variables.otp_code ?? ""
  return (
    <Html>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
        <EmailHeader />
        <Container style={{ padding: "32px" }}>
          <Text style={{ fontSize: "22px", fontWeight: "bold", color: "#0D2137", margin: "0 0 16px" }}>
            Your sign-in verification code
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            Hello,
          </Text>
          <Text style={{ fontSize: "16px", color: "#0D2137" }}>
            You are signing in to your PSSF account. Your verification code is{" "}
            <strong>{code}</strong>. It expires in 5 minutes. If you did not try to
            sign in, you can ignore this email.
          </Text>
          <Section style={{ textAlign: "center", padding: "24px 0" }}>
            <Text
              style={{
                fontSize: "40px",
                fontWeight: "bold",
                letterSpacing: "12px",
                color: "#0D2137",
                margin: 0,
              }}
            >
              {code}
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e2e8f0", margin: "8px 0 24px" }} />
          <Text style={{ fontSize: "12px", color: "#64748b" }}>
            This code expires in 5 minutes. If you did not try to sign in, you can
            ignore this email. Do not share this code with anyone.
          </Text>
          <Text style={{ fontSize: "12px", color: "#0D2137", textAlign: "center", marginTop: "24px" }}>
            PSSF Smart Self-Service Platform
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
