import { Html, Body, Container, Text } from "@react-email/components"

export default function OtpEmail({ variables }: { variables: Record<string, string> }) {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Your PSSF verification code is: {variables.otp_code}</Text>
          <Text>This code expires in 5 minutes.</Text>
        </Container>
      </Body>
    </Html>
  )
}
