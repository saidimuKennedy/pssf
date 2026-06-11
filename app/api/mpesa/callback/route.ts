import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Daraja STK Push callback.
 *
 * Safaricom POSTs the final result of an STK push here (success or failure).
 * We match it back to the case via CheckoutRequestID — which startAvcStkPush
 * stored under form_data.mpesa — and flip the recorded status to PAID/FAILED.
 *
 * Must always return 200 with {ResultCode:0} so Safaricom stops retrying.
 */

interface StkCallbackBody {
  Body?: {
    stkCallback?: {
      MerchantRequestID: string
      CheckoutRequestID: string
      ResultCode: number
      ResultDesc: string
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>
      }
    }
  }
}

export async function POST(req: NextRequest) {
  const ack = NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })

  let body: StkCallbackBody
  try {
    body = (await req.json()) as StkCallbackBody
  } catch {
    return ack
  }

  const cb = body?.Body?.stkCallback
  console.log(
    `[mpesa/callback] received CheckoutRequestID=${cb?.CheckoutRequestID} ResultCode=${cb?.ResultCode} ResultDesc=${cb?.ResultDesc}`
  )
  if (!cb?.CheckoutRequestID) return ack

  // Pull receipt/amount/phone from the metadata when the payment succeeded.
  const meta = cb.CallbackMetadata?.Item ?? []
  const metaValue = (name: string) =>
    meta.find((i) => i.Name === name)?.Value

  try {
    const record = await prisma.case.findFirst({
      where: {
        form_data: {
          path: ["mpesa", "checkout_request_id"],
          equals: cb.CheckoutRequestID,
        },
      },
      select: { id: true, form_data: true },
    })

    if (record) {
      const fd = (record.form_data as Record<string, unknown>) ?? {}
      const mpesa = (fd.mpesa as Record<string, unknown>) ?? {}
      const succeeded = cb.ResultCode === 0

      await prisma.case.update({
        where: { id: record.id },
        data: {
          form_data: {
            ...fd,
            mpesa: {
              ...mpesa,
              status: succeeded ? "PAID" : "FAILED",
              result_code: cb.ResultCode,
              result_desc: cb.ResultDesc,
              receipt: succeeded ? String(metaValue("MpesaReceiptNumber") ?? "") : undefined,
              paid_amount: succeeded ? Number(metaValue("Amount") ?? 0) : undefined,
              updated_at: new Date().toISOString(),
            },
          },
        },
      })
    } else {
      console.warn(`[mpesa/callback] No case for CheckoutRequestID ${cb.CheckoutRequestID}`)
    }
  } catch (err) {
    // Swallow — never make Safaricom retry due to our DB hiccup.
    console.error("[mpesa/callback] update failed:", err)
  }

  return ack
}
