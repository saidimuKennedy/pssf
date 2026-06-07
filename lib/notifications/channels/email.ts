import * as React from "react"
import { render } from "@react-email/render"
import { Resend } from "resend"
import { resolveEmailSubject } from "@/lib/notifications/templates"
import PendingEmployerEmail from "@/emails/pending-employer"
import EmployerApprovedEmail from "@/emails/employer-approved"
import EmployerRejectedEmail from "@/emails/employer-rejected"
import MoreInfoRequiredEmail from "@/emails/more-info-required"
import CaseApprovedEmail from "@/emails/case-approved"
import CaseRejectedEmail from "@/emails/case-rejected"
import PaymentProcessingEmail from "@/emails/payment-processing"
import CaseCompletedEmail from "@/emails/case-completed"
import TaskOverdueEmail from "@/emails/task-overdue"
import WelcomeEmail from "@/emails/welcome"
import OtpEmail from "@/emails/otp"

type EmailComponent = React.ComponentType<{ variables: Record<string, string> }>

const EMAIL_COMPONENTS: Record<string, EmailComponent> = {
  tpl_pending_employer_email: PendingEmployerEmail,
  tpl_employer_approved_email: EmployerApprovedEmail,
  tpl_employer_rejected_email: EmployerRejectedEmail,
  tpl_more_info_required_email: MoreInfoRequiredEmail,
  tpl_approved_email: CaseApprovedEmail,
  tpl_rejected_email: CaseRejectedEmail,
  tpl_payment_processing_email: PaymentProcessingEmail,
  tpl_case_completed_email: CaseCompletedEmail,
  tpl_task_overdue_email: TaskOverdueEmail,
  tpl_welcome_email: WelcomeEmail,
  tpl_statement_email: WelcomeEmail,
  tpl_otp_email: OtpEmail,
}

export interface EmailOptions {
  to: string
  template_ref: string
  variables: Record<string, string>
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (process.env.PSSF_MOCK_NOTIFICATIONS === "true") {
    console.log("[MOCK Email]", JSON.stringify({ to: options.to, template_ref: options.template_ref, variables: options.variables }, null, 2))
    return
  }

  const Component = EMAIL_COMPONENTS[options.template_ref]
  if (!Component) {
    throw new Error(`Unknown email template: ${options.template_ref}`)
  }

  const subject = resolveEmailSubject(options.template_ref, options.variables)
  const html = await render(React.createElement(Component, { variables: options.variables }))

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@pssf.go.ke",
    to: options.to,
    subject,
    html,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }
}
