import { z } from "zod"

export const SendNotificationSchema = z.object({
  caseId: z.string().uuid().optional(),
  recipientId: z.string().min(1).optional(),
  recipientType: z.string().optional(),
  triggerEvent: z.string().min(1, "triggerEvent is required"),
  channel: z.enum(["EMAIL", "WHATSAPP", "PORTAL"]).optional(),
  variables: z.record(z.string(), z.string()),
})

export type SendNotificationInput = z.infer<typeof SendNotificationSchema>
