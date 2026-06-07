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
  tpl_employer_rejected_wa: (v) =>
    sub(
      "Your PSSF [case_type_label] (Ref: [case_reference]) could not be confirmed by your employer. Reason: [rejection_reason]. Please log in to the PSSF portal for guidance.",
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
  tpl_case_rejected_wa: (v) =>
    sub(
      "Your PSSF [case_type_label] (Ref: [case_reference]) has been rejected. Reason: [rejection_reason]. Please contact PSSF for further guidance.",
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
      "Your PSSF verification code is [otp_code]. It expires in 5 minutes. Do not share this code with anyone.",
      v
    ),
  tpl_statement_wa: (v) =>
    sub(
      "Hello [full_name], your PSSF contribution statement for [period_from] to [period_to] is ready. Your total balance is [total_balance]. Log in to the PSSF portal to view the full statement.",
      v
    ),
}

const EMAIL_SUBJECTS: Record<string, (vars: Variables) => string> = {
  tpl_pending_employer_email: (v) =>
    sub("Action Required — [case_type_label] Confirmation for [member_name]", v),
  tpl_employer_approved_email: (v) =>
    sub("Employer Confirmed — Your [case_type_label] Is Under PSSF Review (Ref: [case_reference])", v),
  tpl_employer_rejected_email: (v) =>
    sub("Update on Your [case_type_label] — Ref: [case_reference]", v),
  tpl_more_info_required_email: (v) =>
    sub("Action Required — Additional Information Needed for [case_type_label] (Ref: [case_reference])", v),
  tpl_approved_email: (v) =>
    sub("Your [case_type_label] Has Been Approved — Ref: [case_reference]", v),
  tpl_rejected_email: (v) =>
    sub("Update on Your [case_type_label] — Ref: [case_reference]", v),
  tpl_payment_processing_email: (v) =>
    sub("Payment Processing — [case_type_label] Ref: [case_reference]", v),
  tpl_case_completed_email: (v) =>
    sub("Your [case_type_label] Is Complete — Ref: [case_reference]", v),
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

// ---------------------------------------------------------------------------
// Meta WhatsApp Cloud API template definitions
// Each entry maps an internal template_ref to the approved Meta template name
// and a components builder that produces the parameters array for the API call.
// Template names must match exactly what is registered in the CRM template manager.
// ---------------------------------------------------------------------------

interface MetaTextParam {
  type: "text"
  text: string
}

interface MetaBodyComponent {
  type: "body"
  parameters: MetaTextParam[]
}

interface MetaButtonComponent {
  type: "button"
  sub_type: "url" | "copy_code"
  index: string
  parameters: MetaTextParam[]
}

type MetaComponent = MetaBodyComponent | MetaButtonComponent

interface MetaTemplateEntry {
  name: string
  language: string
  components: (vars: Variables) => MetaComponent[]
}

export const WA_META_TEMPLATES: Record<string, MetaTemplateEntry> = {
  // UTILITY — body-only OTP delivery (auth-category template failed delivery on unverified number); {{1}} = OTP code
  tpl_otp_wa: {
    name: "pssf_number",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.otp_code ?? "" }] },
    ],
  },
  // UTILITY notifications — single body parameter = pre-resolved message text
  tpl_employer_approved_wa: {
    name: "pssf_employe_approved",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.case_type_label ?? "" }, { type: "text", text: v.case_reference ?? "" }] },
    ],
  },
  tpl_employer_rejected_wa: {
    name: "pssf_rejected_employer",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.case_type_label ?? "" }, { type: "text", text: v.case_reference ?? "" }, { type: "text", text: v.rejection_reason ?? "" }] },
    ],
  },
  tpl_more_info_required_wa: {
    name: "pssf_additional_info_required",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.case_type_label ?? "" }, { type: "text", text: v.case_reference ?? "" }] },
    ],
  },
  tpl_case_approved_wa: {
    name: "pss_approved_case",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.case_type_label ?? "" }, { type: "text", text: v.case_reference ?? "" }] },
    ],
  },
  tpl_case_rejected_wa: {
    name: "pssf_case_rejected",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.case_type_label ?? "" }, { type: "text", text: v.case_reference ?? "" }, { type: "text", text: v.rejection_reason ?? "" }] },
    ],
  },
  tpl_payment_processing_wa: {
    name: "pssf_payment_processing",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.case_type_label ?? "" }, { type: "text", text: v.case_reference ?? "" }] },
    ],
  },
  tpl_case_completed_wa: {
    name: "pssf_case_completed",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [{ type: "text", text: v.case_type_label ?? "" }, { type: "text", text: v.case_reference ?? "" }] },
    ],
  },
  tpl_statement_wa: {
    name: "pssf_payment_statement",
    language: "en_US",
    components: (v) => [
      { type: "body", parameters: [
        { type: "text", text: v.full_name ?? "" },
        { type: "text", text: v.period_from ?? "" },
        { type: "text", text: v.period_to ?? "" },
        { type: "text", text: v.total_balance ?? "" },
      ]},
    ],
  },
}
