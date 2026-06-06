import { PrismaClient, NotificationChannel } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd())

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const RULES = [
  // CASE_SUBMITTED
  { id: "00000000-0000-0000-0000-000000000001", trigger_event: "CASE_SUBMITTED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_case_submitted_portal_member" },
  { id: "00000000-0000-0000-0000-000000000002", trigger_event: "CASE_SUBMITTED", recipient_type: "PSSF_STAFF", channel: NotificationChannel.PORTAL, template_ref: "tpl_case_submitted_portal_staff" },
  // PENDING_EMPLOYER
  { id: "00000000-0000-0000-0000-000000000003", trigger_event: "PENDING_EMPLOYER", recipient_type: "EMPLOYER", channel: NotificationChannel.PORTAL, template_ref: "tpl_pending_employer_portal" },
  { id: "00000000-0000-0000-0000-000000000004", trigger_event: "PENDING_EMPLOYER", recipient_type: "EMPLOYER", channel: NotificationChannel.EMAIL, template_ref: "tpl_pending_employer_email" },
  // EMPLOYER_APPROVED
  { id: "00000000-0000-0000-0000-000000000005", trigger_event: "EMPLOYER_APPROVED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_employer_approved_portal" },
  { id: "00000000-0000-0000-0000-000000000006", trigger_event: "EMPLOYER_APPROVED", recipient_type: "MEMBER", channel: NotificationChannel.WHATSAPP, template_ref: "tpl_employer_approved_wa" },
  // EMPLOYER_REJECTED
  { id: "00000000-0000-0000-0000-000000000007", trigger_event: "EMPLOYER_REJECTED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_employer_rejected_portal" },
  { id: "00000000-0000-0000-0000-000000000008", trigger_event: "EMPLOYER_REJECTED", recipient_type: "MEMBER", channel: NotificationChannel.EMAIL, template_ref: "tpl_employer_rejected_email" },
  // MORE_INFO_REQUIRED
  { id: "00000000-0000-0000-0000-000000000009", trigger_event: "MORE_INFO_REQUIRED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_more_info_required_portal" },
  { id: "00000000-0000-0000-0000-000000000010", trigger_event: "MORE_INFO_REQUIRED", recipient_type: "MEMBER", channel: NotificationChannel.WHATSAPP, template_ref: "tpl_more_info_required_wa" },
  // CASE_APPROVED
  { id: "00000000-0000-0000-0000-000000000011", trigger_event: "CASE_APPROVED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_case_approved_portal" },
  { id: "00000000-0000-0000-0000-000000000012", trigger_event: "CASE_APPROVED", recipient_type: "MEMBER", channel: NotificationChannel.WHATSAPP, template_ref: "tpl_case_approved_wa" },
  { id: "00000000-0000-0000-0000-000000000013", trigger_event: "CASE_APPROVED", recipient_type: "MEMBER", channel: NotificationChannel.EMAIL, template_ref: "tpl_approved_email" },
  // CASE_REJECTED
  { id: "00000000-0000-0000-0000-000000000014", trigger_event: "CASE_REJECTED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_case_rejected_portal" },
  { id: "00000000-0000-0000-0000-000000000015", trigger_event: "CASE_REJECTED", recipient_type: "MEMBER", channel: NotificationChannel.EMAIL, template_ref: "tpl_rejected_email" },
  // PAYMENT_PROCESSING
  { id: "00000000-0000-0000-0000-000000000016", trigger_event: "PAYMENT_PROCESSING", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_payment_processing_portal" },
  { id: "00000000-0000-0000-0000-000000000017", trigger_event: "PAYMENT_PROCESSING", recipient_type: "MEMBER", channel: NotificationChannel.WHATSAPP, template_ref: "tpl_payment_processing_wa" },
  // CASE_COMPLETED
  { id: "00000000-0000-0000-0000-000000000018", trigger_event: "CASE_COMPLETED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_case_completed_portal" },
  { id: "00000000-0000-0000-0000-000000000019", trigger_event: "CASE_COMPLETED", recipient_type: "MEMBER", channel: NotificationChannel.WHATSAPP, template_ref: "tpl_case_completed_wa" },
  // DOCUMENT_REJECTED
  { id: "00000000-0000-0000-0000-000000000020", trigger_event: "DOCUMENT_REJECTED", recipient_type: "MEMBER", channel: NotificationChannel.PORTAL, template_ref: "tpl_document_rejected_portal" },
  // TASK_OVERDUE
  { id: "00000000-0000-0000-0000-000000000021", trigger_event: "TASK_OVERDUE", recipient_type: "EMPLOYER", channel: NotificationChannel.EMAIL, template_ref: "tpl_task_overdue_email" },
  // CASE_REASSIGNED
  { id: "00000000-0000-0000-0000-000000000022", trigger_event: "CASE_REASSIGNED", recipient_type: "PSSF_STAFF", channel: NotificationChannel.PORTAL, template_ref: "tpl_case_reassigned_portal" },
] as const

async function seed() {
  console.log("Seeding notification rules...")

  for (const rule of RULES) {
    await prisma.notificationRule.upsert({
      where: { id: rule.id },
      create: {
        id: rule.id,
        trigger_event: rule.trigger_event,
        recipient_type: rule.recipient_type,
        channel: rule.channel,
        template_ref: rule.template_ref,
        is_active: true,
      },
      update: {
        is_active: true,
        template_ref: rule.template_ref,
      },
    })
  }

  console.log(`Seeded ${RULES.length} notification rules.`)
}

seed()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
