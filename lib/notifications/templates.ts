type Variables = Record<string, string>

function sub(template: string, vars: Variables): string {
  return template.replace(/\[(\w+)\]/g, (_, key) => vars[key] ?? `[${key}]`)
}

const PORTAL_TEMPLATES: Record<string, (vars: Variables) => string> = {
  tpl_case_submitted_portal_member: (v) =>
    sub(
      "Your [case_type_label] (Ref: [case_reference]) has been submitted successfully. We will notify you of any updates.",
      v
    ),
  tpl_case_submitted_portal_staff: (v) =>
    sub(
      "New submission: [case_type_label] from [member_name] (Ref: [case_reference]).",
      v
    ),
  tpl_pending_employer_portal: (v) =>
    sub(
      "Action required: [member_name] has submitted a [case_type_label] (Ref: [case_reference]) that requires your confirmation.",
      v
    ),
  tpl_employer_approved_portal: (v) =>
    sub(
      "Your [case_type_label] (Ref: [case_reference]) has been confirmed by your employer and is now under PSSF review.",
      v
    ),
  tpl_employer_rejected_portal: (v) =>
    sub(
      "Your [case_type_label] (Ref: [case_reference]) could not be confirmed by your employer. Reason: [rejection_reason]. Please contact PSSF for guidance.",
      v
    ),
  tpl_more_info_required_portal: (v) =>
    sub(
      "Additional information is required for your [case_type_label] (Ref: [case_reference]). [info_requested]. Please log in to respond.",
      v
    ),
  tpl_case_approved_portal: (v) =>
    sub("Your [case_type_label] (Ref: [case_reference]) has been approved.", v),
  tpl_case_rejected_portal: (v) =>
    sub(
      "Your [case_type_label] (Ref: [case_reference]) has been rejected. Reason: [rejection_reason]. Please contact PSSF for further guidance.",
      v
    ),
  tpl_payment_processing_portal: (v) =>
    sub(
      "Payment is being processed for your [case_type_label] (Ref: [case_reference]). You will be notified once the payment is complete.",
      v
    ),
  tpl_case_completed_portal: (v) =>
    sub(
      "Your [case_type_label] (Ref: [case_reference]) has been completed successfully.",
      v
    ),
  tpl_document_rejected_portal: (v) =>
    sub(
      "Your [document_type_label] for case [case_reference] was rejected. Reason: [rejection_reason]. Please upload a replacement document.",
      v
    ),
  tpl_case_reassigned_portal: (v) =>
    sub(
      "Case [case_reference] ([case_type_label]) has been assigned to you by [reassigned_by].",
      v
    ),
}

const WHATSAPP_TEMPLATES: Record<string, (vars: Variables) => string> = {
  tpl_employer_approved_wa: (v) =>
    sub(
      "Your PSSF [case_type_label] (Ref: [case_reference]) has been confirmed by your employer. It is now under PSSF review. We will notify you when there is an update.",
      v
    ),
  tpl_more_info_required_wa: (v) =>
    sub(
      "PSSF requires more information for your [case_type_label] (Ref: [case_reference]). Please log in to the PSSF portal to provide the requested details.",
      v
    ),
  tpl_case_approved_wa: (v) =>
    sub(
      "Good news! Your PSSF [case_type_label] (Ref: [case_reference]) has been approved. You will receive further updates on next steps.",
      v
    ),
  tpl_payment_processing_wa: (v) =>
    sub(
      "Your PSSF benefits payment for [case_type_label] (Ref: [case_reference]) is being processed. We will notify you once it is complete.",
      v
    ),
  tpl_case_completed_wa: (v) =>
    sub(
      "Your PSSF [case_type_label] (Ref: [case_reference]) is complete. Thank you for using the PSSF Smart Self-Service Platform.",
      v
    ),
  tpl_otp_wa: (v) =>
    sub(
      "Your PSSF verification code is [otp_code]. It expires in [expires_in_minutes] minutes. Do not share this code with anyone.",
      v
    ),
}

const EMAIL_SUBJECTS: Record<string, (vars: Variables) => string> = {
  tpl_pending_employer_email: (v) =>
    sub("Action Required — [case_type_label] Confirmation for [member_name]", v),
  tpl_employer_rejected_email: (v) =>
    sub("Update on Your [case_type_label] — Ref: [case_reference]", v),
  tpl_approved_email: (v) =>
    sub("Your [case_type_label] Has Been Approved — Ref: [case_reference]", v),
  tpl_rejected_email: (v) =>
    sub("Update on Your [case_type_label] — Ref: [case_reference]", v),
  tpl_task_overdue_email: (v) =>
    sub("Reminder — Pending Action Required for [member_name]", v),
  tpl_welcome_email: () => "Welcome to PSSF Portal",
  tpl_statement_email: () => "Your PSSF Contribution Statement",
}

export function resolvePortalMessage(templateRef: string, variables: Variables): string {
  const fn = PORTAL_TEMPLATES[templateRef]
  if (!fn) return `Notification: ${templateRef}`
  return fn(variables)
}

export function resolveWhatsAppMessage(templateRef: string, variables: Variables): string {
  const fn = WHATSAPP_TEMPLATES[templateRef]
  if (!fn) return `Notification: ${templateRef}`
  return fn(variables)
}

export function resolveEmailSubject(templateRef: string, variables: Variables): string {
  const fn = EMAIL_SUBJECTS[templateRef]
  if (!fn) return "PSSF Notification"
  return fn(variables)
}

export function resolveMessage(
  templateRef: string,
  channel: "PORTAL" | "WHATSAPP" | "EMAIL",
  variables: Variables
): string {
  if (channel === "PORTAL") return resolvePortalMessage(templateRef, variables)
  if (channel === "WHATSAPP") return resolveWhatsAppMessage(templateRef, variables)
  return resolveEmailSubject(templateRef, variables)
}
