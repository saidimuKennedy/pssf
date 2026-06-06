import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { dispatch } from "@/lib/notifications/dispatch"
import { SendNotificationSchema } from "@/lib/validations/notifications"
import { Role } from "@prisma/client"

const SERVER_ROLES: Role[] = [Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR, Role.ADMIN]
const MEMBER_TRIGGERS = new Set(["STATEMENT_EMAIL"])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }

  const body = await req.json()
  const isMemberStatement =
    session.user.role === Role.MEMBER &&
    body.triggerEvent === "STATEMENT_EMAIL"

  if (!(SERVER_ROLES as Role[]).includes(session.user.role) && !isMemberStatement) {
    return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 })
  }

  const parsed = SendNotificationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  if (!isMemberStatement && !parsed.data.recipientId) {
    return NextResponse.json({ error: "recipientId is required" }, { status: 400 })
  }

  const recipientId = isMemberStatement ? session.user.id : parsed.data.recipientId!

  if (isMemberStatement && parsed.data.channel) {
    const { sendEmail } = await import("@/lib/notifications/channels/email")
    const { sendWhatsApp } = await import("@/lib/notifications/channels/whatsapp")
    const user = await (await import("@/lib/db")).prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (parsed.data.channel === "EMAIL" && user?.email) {
      await sendEmail({
        to: user.email,
        template_ref: "tpl_statement_email",
        variables: parsed.data.variables,
      })
    } else if (parsed.data.channel === "WHATSAPP" && user?.phone) {
      await sendWhatsApp({
        recipient_phone: user.phone,
        template_ref: "tpl_statement_wa",
        variables: parsed.data.variables,
      })
    }
    return NextResponse.json({ dispatched: true })
  }

  await dispatch({
    case_id: parsed.data.caseId,
    recipient_id: recipientId,
    recipient_type: parsed.data.recipientType,
    trigger_event: parsed.data.triggerEvent,
    variables: parsed.data.variables,
  })

  return NextResponse.json({ dispatched: true })
}
