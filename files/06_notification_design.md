# PSSF — Notification Design Document

**Version:** 1.0  
**Status:** Approved for implementation

---

## Channels

| Channel | Provider | Used for |
|---|---|---|
| WhatsApp | Chatnation CRM | OTP delivery, milestone notifications, statement summaries |
| Email | Resend | Full-detail notifications to members, employers |
| Portal | Internal | In-app notification bell, all roles |

The PSSF platform does not integrate directly with WhatsApp. It dispatches a payload to the Chatnation CRM via an internal API call. The CRM resolves the template and delivers the message.

---

## Notification Service

The notification service is a server-side module. It is never called from the client directly.

```typescript
// lib/notifications/dispatch.ts

interface NotificationPayload {
  case_id?: string
  recipient_id: string
  trigger_event: string
  variables: Record<string, string>
}

async function dispatch(payload: NotificationPayload): Promise<void>
```

On every Case status transition, the workflow engine calls `dispatch()` with the trigger event. The service:

1. Looks up all active `NotificationRule` records matching `trigger_event` and `recipient_type`
2. For each matching rule, resolves the template with provided variables
3. Dispatches to the appropriate channel handler
4. Writes a `Notification` record with status PENDING → SENT or FAILED
5. Writes an `AuditEvent` for the dispatch

---

## Channel Handlers

### WhatsApp handler

Sends a POST request to the Chatnation CRM internal endpoint.

```typescript
// lib/notifications/channels/whatsapp.ts

interface CRMPayload {
  recipient_phone: string
  template_ref: string
  variables: Record<string, string>
}

async function sendWhatsApp(payload: CRMPayload): Promise<void>
```

The CRM endpoint, authentication credentials, and template namespace are stored in environment variables:
- `CHATNATION_CRM_URL`
- `CHATNATION_CRM_API_KEY`

### Email handler

Uses the Resend SDK.

```typescript
// lib/notifications/channels/email.ts

import { Resend } from "resend"

async function sendEmail(options: {
  to: string
  subject: string
  template_ref: string
  variables: Record<string, string>
}): Promise<void>
```

Email templates are React Email components stored in `emails/` directory.

### Portal handler

Writes a notification record to the database. Surfaced in the notification bell via `GET /api/notifications`.

---

## Trigger Events and Templates

### CASE_SUBMITTED

**Recipient:** Member  
**Channels:** PORTAL  
**Variables:** `case_reference`, `case_type_label`, `submitted_at`

Portal message:
> Your [case_type_label] (Ref: [case_reference]) has been submitted successfully. We will notify you of any updates.

---

**Recipient:** PSSF_STAFF  
**Channels:** PORTAL  
**Variables:** `case_reference`, `case_type_label`, `member_name`

Portal message:
> New submission: [case_type_label] from [member_name] (Ref: [case_reference]).

---

### PENDING_EMPLOYER

**Recipient:** Employer  
**Channels:** PORTAL, EMAIL  
**Variables:** `case_reference`, `case_type_label`, `member_name`, `employer_name`, `due_by`

Portal message:
> Action required: [member_name] has submitted a [case_type_label] (Ref: [case_reference]) that requires your confirmation.

Email subject: `Action Required — [case_type_label] Confirmation for [member_name]`

Email body:
> Dear [employer_name] HR Team,
>
> A [case_type_label] has been submitted by [member_name] and requires your confirmation before it can be processed.
>
> Reference: [case_reference]  
> Required by: [due_by]
>
> Please log in to the PSSF Employer Portal to review and confirm this request.
>
> PSSF Smart Self-Service Platform

---

### EMPLOYER_APPROVED

**Recipient:** Member  
**Channels:** PORTAL, WHATSAPP  
**Variables:** `case_reference`, `case_type_label`

Portal message:
> Your [case_type_label] (Ref: [case_reference]) has been confirmed by your employer and is now under PSSF review.

WhatsApp message:
> Your PSSF [case_type_label] (Ref: [case_reference]) has been confirmed by your employer. It is now under PSSF review. We will notify you when there is an update.

---

### EMPLOYER_REJECTED

**Recipient:** Member  
**Channels:** PORTAL, EMAIL  
**Variables:** `case_reference`, `case_type_label`, `rejection_reason`

Portal message:
> Your [case_type_label] (Ref: [case_reference]) could not be confirmed by your employer. Reason: [rejection_reason]. Please contact PSSF for guidance.

Email subject: `Update on Your [case_type_label] — Ref: [case_reference]`

---

### MORE_INFO_REQUIRED

**Recipient:** Member  
**Channels:** PORTAL, WHATSAPP  
**Variables:** `case_reference`, `case_type_label`, `info_requested`

Portal message:
> Additional information is required for your [case_type_label] (Ref: [case_reference]). [info_requested]. Please log in to respond.

WhatsApp message:
> PSSF requires more information for your [case_type_label] (Ref: [case_reference]). Please log in to the PSSF portal to provide the requested details.

---

### CASE_APPROVED

**Recipient:** Member  
**Channels:** PORTAL, WHATSAPP, EMAIL  
**Variables:** `case_reference`, `case_type_label`, `approved_at`

Portal message:
> Your [case_type_label] (Ref: [case_reference]) has been approved.

WhatsApp message:
> Good news! Your PSSF [case_type_label] (Ref: [case_reference]) has been approved. You will receive further updates on next steps.

Email subject: `Your [case_type_label] Has Been Approved — Ref: [case_reference]`

---

### CASE_REJECTED

**Recipient:** Member  
**Channels:** PORTAL, EMAIL  
**Variables:** `case_reference`, `case_type_label`, `rejection_reason`

Portal message:
> Your [case_type_label] (Ref: [case_reference]) has been rejected. Reason: [rejection_reason]. Please contact PSSF for further guidance.

Email subject: `Update on Your [case_type_label] — Ref: [case_reference]`

---

### PAYMENT_PROCESSING

**Recipient:** Member  
**Channels:** PORTAL, WHATSAPP  
**Variables:** `case_reference`, `case_type_label`

Portal message:
> Payment is being processed for your [case_type_label] (Ref: [case_reference]). You will be notified once the payment is complete.

WhatsApp message:
> Your PSSF benefits payment for [case_type_label] (Ref: [case_reference]) is being processed. We will notify you once it is complete.

---

### CASE_COMPLETED

**Recipient:** Member  
**Channels:** PORTAL, WHATSAPP  
**Variables:** `case_reference`, `case_type_label`, `completed_at`

Portal message:
> Your [case_type_label] (Ref: [case_reference]) has been completed successfully.

WhatsApp message:
> Your PSSF [case_type_label] (Ref: [case_reference]) is complete. Thank you for using the PSSF Smart Self-Service Platform.

---

### DOCUMENT_REJECTED

**Recipient:** Member  
**Channels:** PORTAL  
**Variables:** `case_reference`, `document_type_label`, `rejection_reason`

Portal message:
> Your [document_type_label] for case [case_reference] was rejected. Reason: [rejection_reason]. Please upload a replacement document.

---

### TASK_OVERDUE

**Recipient:** Employer  
**Channels:** EMAIL  
**Variables:** `case_reference`, `case_type_label`, `member_name`, `overdue_since`

Email subject: `Reminder — Pending Action Required for [member_name]`

Email body:
> This is a reminder that a [case_type_label] submitted by [member_name] (Ref: [case_reference]) is still awaiting your confirmation. This request has been pending since [overdue_since]. Please log in to the PSSF Employer Portal to take action.

---

### CASE_REASSIGNED

**Recipient:** PSSF_STAFF (new assignee)  
**Channels:** PORTAL  
**Variables:** `case_reference`, `case_type_label`, `reassigned_by`

Portal message:
> Case [case_reference] ([case_type_label]) has been assigned to you by [reassigned_by].

---

### OTP (WhatsApp)

**Variables:** `otp_code`, `expires_in_minutes`

WhatsApp message:
> Your PSSF verification code is [otp_code]. It expires in [expires_in_minutes] minutes. Do not share this code with anyone.

---

## Email Templates (Resend / React Email)

Each email template is a React Email component in `emails/`.

| Template ref | Component file |
|---|---|
| tpl_pending_employer_email | emails/pending-employer.tsx |
| tpl_employer_rejected_email | emails/employer-rejected.tsx |
| tpl_approved_email | emails/case-approved.tsx |
| tpl_rejected_email | emails/case-rejected.tsx |
| tpl_task_overdue_email | emails/task-overdue.tsx |

All email templates share:
- PSSF logo and green header bar
- Clean white body with navy footer
- Single clear CTA button linking to the portal
- Plain text fallback

---

## Environment Variables

```env
CHATNATION_CRM_URL=
CHATNATION_CRM_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@pssf.go.ke
```
