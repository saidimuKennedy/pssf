import { NotificationChannel, NotificationStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { logAuditEvent } from "@/lib/audit/log"
import { sendWhatsApp } from "./channels/whatsapp"
import { sendEmail } from "./channels/email"
import { sendPortal } from "./channels/portal"
import { resolvePortalMessage, resolveWhatsAppMessage } from "./templates"
import { resolveRecipientIds } from "./resolve-recipients"

export interface NotificationPayload {
  case_id?: string
  recipient_id: string
  recipient_type?: string
  trigger_event: string
  variables: Record<string, string>
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetry(fn: () => Promise<void>, maxAttempts = 3): Promise<void> {
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await fn()
      return
    } catch (err) {
      lastError = err
      if (attempt < maxAttempts - 1) {
        await sleep(1000 * Math.pow(2, attempt))
      }
    }
  }
  throw lastError
}

async function dispatchToChannel(
  channel: NotificationChannel,
  rule: { template_ref: string },
  user: { id: string; phone?: string | null; email?: string | null },
  payload: NotificationPayload
): Promise<void> {
  const variables = payload.variables

  if (channel === NotificationChannel.PORTAL) {
    const message = resolvePortalMessage(rule.template_ref, variables)
    await sendPortal(user.id, message, payload.case_id)
    return
  }

  if (channel === NotificationChannel.WHATSAPP) {
    if (!user.phone) {
      const message = resolvePortalMessage(
        rule.template_ref.replace(/_wa$/, "_portal"),
        variables
      )
      await sendPortal(user.id, message, payload.case_id)
      return
    }
    const message = resolveWhatsAppMessage(rule.template_ref, variables)
    await sendWhatsApp({
      recipient_phone: user.phone,
      template_ref: rule.template_ref,
      variables: { ...variables, message },
    })
    return
  }

  if (channel === NotificationChannel.EMAIL) {
    if (!user.email) {
      const message = resolvePortalMessage(
        rule.template_ref.replace(/_email$/, "_portal"),
        variables
      )
      await sendPortal(user.id, message, payload.case_id)
      return
    }
    await sendEmail({
      to: user.email,
      template_ref: rule.template_ref,
      variables,
    })
    return
  }
}

type NotificationRuleRow = {
  id: string
  channel: NotificationChannel
  template_ref: string
  recipient_type: string
}

async function sendRuleToRecipient(
  rule: NotificationRuleRow,
  payload: NotificationPayload
): Promise<void> {
  if (!payload.recipient_id) return

  const user = await prisma.user.findUnique({
    where: { id: payload.recipient_id },
    select: { id: true, phone: true, email: true },
  })
  if (!user) return

  const notificationId = await createPendingRecord(rule, payload)

  let succeeded = false
  let errorMessage: string | null = null

  try {
    await withRetry(() => dispatchToChannel(rule.channel, rule, user, payload))
    succeeded = true
  } catch (err) {
    errorMessage = String(err)
    console.error(`[Notification] Failed after retries for rule ${rule.id}:`, err)

    if (rule.channel !== NotificationChannel.PORTAL) {
      try {
        const message = `Notification: ${payload.trigger_event} (Ref: ${payload.variables.case_reference ?? payload.case_id ?? ""})`
        await sendPortal(user.id, message, payload.case_id)
      } catch (portalErr) {
        console.error("[Notification] Portal fallback also failed:", portalErr)
      }
    }
  }

  await updateRecord(notificationId, succeeded, errorMessage)

  await logAuditEvent({
    case_id: payload.case_id,
    action: `NOTIFICATION_${succeeded ? "SENT" : "FAILED"}`,
    actor_id: user.id,
    metadata: {
      trigger_event: payload.trigger_event,
      channel: rule.channel,
      template_ref: rule.template_ref,
      error: errorMessage,
    },
  })
}

export async function dispatch(payload: NotificationPayload): Promise<void> {
  try {
    if (!payload.recipient_id) return

    const where: Record<string, unknown> = {
      trigger_event: payload.trigger_event,
      is_active: true,
    }
    if (payload.recipient_type) {
      where.recipient_type = payload.recipient_type
    }

    const rules = await prisma.notificationRule.findMany({ where })
    for (const rule of rules) {
      await sendRuleToRecipient(rule, payload)
    }
  } catch (err) {
    console.error("[Notification] Dispatch error:", err)
  }
}

export async function dispatchForCaseEvent(
  caseId: string,
  triggerEvent: string,
  variables: Record<string, string>
): Promise<void> {
  try {
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        member: { select: { user_id: true, full_name: true } },
      },
    })
    if (!caseRecord) return

    const enriched = {
      ...variables,
      case_reference: variables.case_reference ?? caseRecord.reference,
      member_name: variables.member_name ?? caseRecord.member?.full_name ?? "",
    }

    const rules = await prisma.notificationRule.findMany({
      where: { trigger_event: triggerEvent, is_active: true },
    })

    for (const rule of rules) {
      const recipientIds = await resolveRecipientIds(rule.recipient_type, caseRecord)
      for (const recipientId of recipientIds) {
        await sendRuleToRecipient(rule, {
          case_id: caseId,
          recipient_id: recipientId,
          recipient_type: rule.recipient_type,
          trigger_event: triggerEvent,
          variables: enriched,
        })
      }
    }
  } catch (err) {
    console.error("[Notification] dispatchForCaseEvent error:", err)
  }
}

async function createPendingRecord(
  rule: { id: string; channel: NotificationChannel; template_ref: string },
  payload: NotificationPayload
): Promise<string> {
  const record = await (prisma.notification.create as any)({
    data: {
      case_id: payload.case_id ?? null,
      recipient_id: payload.recipient_id,
      channel: rule.channel,
      template_ref: rule.template_ref,
      payload: { trigger_event: payload.trigger_event, variables: payload.variables },
      status: NotificationStatus.PENDING,
    },
  })
  return record.id
}

async function updateRecord(
  id: string,
  succeeded: boolean,
  error: string | null
): Promise<void> {
  await prisma.notification.update({
    where: { id },
    data: {
      status: succeeded ? NotificationStatus.SENT : NotificationStatus.FAILED,
      sent_at: succeeded ? new Date() : null,
      error: error ?? null,
    },
  })
}
