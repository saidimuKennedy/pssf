import { Html, Head, Body, Container, Text, Link } from "@react-email/components"
import { EmailHeader } from "@/emails/header"

export default function WelcomeEmail({ variables }: { variables: Record<string, string> }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f5f5f5" }}>
        <Container style={{ backgroundColor: "#fff", padding: "0", borderRadius: "8px", overflow: "hidden" }}>
          <EmailHeader />
          <Container style={{ padding: "24px" }}>
          <Text style={{ fontSize: "18px", fontWeight: "bold", color: "#0D2137" }}>
            Welcome to PSSF Portal
          </Text>
          <Text>Hello {variables.full_name},</Text>
          <Text>Your PSSF account has been created.</Text>
          <Text>
            <strong>Email:</strong> {variables.email}
            <br />
            <strong>Temporary password:</strong> {variables.temp_password}
          </Text>
          <Text>Please sign in and change your password immediately.</Text>
          <Link href={variables.login_url}>Sign in to PSSF Portal</Link>
          </Container>
        </Container>
      </Body>
    </Html>
  )
}
