"use server"

import { prisma } from "@/lib/db"
import { initiateStkPush, isMpesaConfigured } from "@/lib/mpesa/daraja"

export interface StartStkResult {
  success: boolean
  checkoutRequestId?: string
  message: string
}

// Daraja rejects non-https / localhost CallBackURLs ("Invalid CallBackURL").
// Resolve to a valid PUBLIC https URL, ignoring leftover localhost/http values
// (e.g. a Vercel NEXT_PUBLIC_APP_URL still set to http://localhost:3000).
function resolveCallbackUrl(): string | null {
  const PROD_DEFAULT = "https://pssf.vercel.app/api/mpesa/callback"

  const isPublicHttps = (u: string) =>
    /^https:\/\//i.test(u) && !/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(u)

  const explicit = process.env.MPESA_CALLBACK_URL?.trim()
  if (explicit) return isPublicHttps(explicit) ? explicit : null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (appUrl && isPublicHttps(appUrl)) {
    return `${appUrl.replace(/\/+$/, "")}/api/mpesa/callback`
  }

  return PROD_DEFAULT
}

/**
 * Fire an M-Pesa STK push to collect an AVC mobile-wallet contribution.
 * Amount and phone are read server-side from the case (never trust the client).
 * The CheckoutRequestID is persisted on the case so the Daraja callback
 * (POST /api/mpesa/callback) can match the result back to this case.
 */
export async function startAvcStkPush(caseId: string): Promise<StartStkResult> {
  if (!isMpesaConfigured()) {
    return { success: false, message: "M-Pesa is not configured on the server." }
  }

  const record = await prisma.case.findUnique({
    where: { id: caseId },
    select: { form_data: true, reference: true },
  })
  if (!record) return { success: false, message: "Case not found." }

  const fd = (record.form_data as Record<string, unknown>) ?? {}
  const phone = String(fd.mobile_wallet_number ?? "").trim()
  const amount = Number(fd.new_amount ?? 0)

  if (!phone) return { success: false, message: "No M-Pesa number on this request." }
  if (!amount || amount <= 0) {
    return { success: false, message: "No contribution amount to collect." }
  }

  // SAFETY: in sandbox, only ever charge KES 1 — sandbox STK to a real
  // registered line CAN move real money. Never push the full amount in test.
  const isSandbox = process.env.MPESA_ENVIRONMENT !== "production"
  const chargeAmount = isSandbox ? 1 : amount

  const callbackUrl = resolveCallbackUrl()
  if (!callbackUrl) {
    return {
      success: false,
      message: "Server callback URL is not a valid public https URL. Set MPESA_CALLBACK_URL.",
    }
  }

  console.log(
    `[avc/stk] push → phone=${phone} intended=${amount} charge=${chargeAmount} sandbox=${isSandbox} callback=${callbackUrl}`
  )

  try {
    const res = await initiateStkPush({
      phoneNumber: phone,
      amount: chargeAmount,
      accountReference: record.reference?.slice(0, 12) || "PSSF-AVC",
      transactionDesc: "AVC",
      callbackUrl,
    })
    console.log(`[avc/stk] accepted CheckoutRequestID=${res.CheckoutRequestID}`)

    // Persist the pending payment so the callback can find this case.
    await prisma.case.update({
      where: { id: caseId },
      data: {
        form_data: {
          ...fd,
          mpesa: {
            checkout_request_id: res.CheckoutRequestID,
            merchant_request_id: res.MerchantRequestID,
            status: "PENDING",
            amount,
            charged: chargeAmount,
            sandbox: isSandbox,
            phone,
            updated_at: new Date().toISOString(),
          },
        },
      },
    })

    return {
      success: true,
      checkoutRequestId: res.CheckoutRequestID,
      message: res.CustomerMessage || "Check your phone and enter your M-Pesa PIN.",
    }
  } catch (err) {
    console.error("[avc/stk] push failed:", err)
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to initiate M-Pesa payment.",
    }
  }
}

export type AvcPaymentStatus = "PENDING" | "PAID" | "FAILED" | "NONE"

export interface PaymentStatusResult {
  status: AvcPaymentStatus
  receipt?: string
  message?: string
}

/**
 * Read the M-Pesa payment status recorded on the case (updated by the callback).
 * The Confirm page polls this — our own DB, so no Daraja rate limits.
 */
export async function getAvcPaymentStatus(caseId: string): Promise<PaymentStatusResult> {
  const record = await prisma.case.findUnique({
    where: { id: caseId },
    select: { form_data: true },
  })
  const mpesa = (record?.form_data as Record<string, unknown>)?.mpesa as
    | Record<string, unknown>
    | undefined

  if (!mpesa) return { status: "NONE" }
  return {
    status: (mpesa.status as AvcPaymentStatus) ?? "PENDING",
    receipt: mpesa.receipt as string | undefined,
    message: mpesa.result_desc as string | undefined,
  }
}
