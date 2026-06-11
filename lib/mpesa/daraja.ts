/**
 * Safaricom Daraja (M-Pesa) STK Push client.
 *
 * Lipa na M-Pesa Online — no PRN/obligation model: OAuth, push a PIN prompt to
 * the customer's phone, then either receive a callback or poll stkpushquery.
 * On localhost (no public CallBackURL) we rely on polling via queryStkStatus.
 *
 * Single entry-point for all Daraja calls — no other file should hit the API.
 *
 * Environment:
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET — Daraja app credentials
 *   MPESA_SHORTCODE   — Paybill/Till (sandbox: 174379)
 *   MPESA_PASSKEY     — Lipa na M-Pesa passkey
 *   MPESA_ENVIRONMENT — "sandbox" | "production"
 *
 * Server-only: imported exclusively from "use server" action modules.
 *
 * Token caching: Safaricom issues tokens valid ~3600s and aggressively throttles
 * the OAuth endpoint. On serverless (Vercel), module-level variables are lost on
 * cold start. We use a two-layer cache: L1 in-memory (reused within the same
 * function instance) + L2 in the database (shared across all instances/cold starts).
 */

import { prisma } from "@/lib/db"

const MPESA_BASE_URL =
  process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke"

const FETCH_TIMEOUT_MS = 15_000

function darajaFetch(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  )
}

export function isMpesaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  )
}

/** Normalise a Kenyan mobile number to 2547XXXXXXXX / 2541XXXXXXXX. */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "")
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1)
  if (!cleaned.startsWith("254")) cleaned = "254" + cleaned
  if (!/^254[17]\d{8}$/.test(cleaned)) {
    throw new Error(
      "Invalid Kenyan mobile number for M-Pesa (expect 254 + 7/1 + 8 digits)."
    )
  }
  return cleaned
}

interface AccessTokenResponse {
  access_token: string
  expires_in: string
}

interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage?: string
}

/** Timestamp in Daraja's YYYYMMDDHHmmss format. */
function stkTimestamp(): string {
  return new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)
}

function stkPassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64")
}

const DB_TOKEN_KEY = "mpesa_access_token"

// L1: in-memory cache — reused within the same function instance lifetime.
let memToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  // 60s buffer so we never hand a nearly-expired token to Daraja.
  const validUntil = now + 60_000

  if (memToken && memToken.expiresAt > validUntil) {
    return memToken.value
  }

  // L2: DB cache — shared across all serverless instances / cold starts.
  try {
    const row = await prisma.systemConfig.findUnique({ where: { key: DB_TOKEN_KEY } })
    if (row) {
      const parsed = JSON.parse(row.value) as { value: string; expiresAt: number }
      if (parsed.expiresAt > validUntil) {
        memToken = parsed
        return parsed.value
      }
    }
  } catch {
    // DB read failure — fall through and fetch a fresh token.
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials not configured")
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
  const res = await darajaFetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { method: "GET", headers: { Authorization: `Basic ${auth}` } }
  )
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    // Safaricom throttles its OAuth endpoint: rapid calls return 400 (empty
    // body), then 403 (WAF block page). Surface a back-off message instead of
    // a confusing credential error so the user stops hammering.
    if (res.status === 400 || res.status === 403 || res.status === 429) {
      throw new Error(
        "M-Pesa is temporarily rate-limited by Safaricom (too many requests). Wait 1–2 minutes, then try once."
      )
    }
    throw new Error(
      `Failed to get M-Pesa access token: ${res.status} ${res.statusText}${detail ? ` — ${detail.slice(0, 120)}` : ""}`
    )
  }
  const data: AccessTokenResponse = await res.json()
  const ttlMs = (parseInt(data.expires_in, 10) || 3599) * 1000
  const entry = { value: data.access_token, expiresAt: now + ttlMs }
  memToken = entry

  // Persist to DB so the next cold-start instance reuses this token.
  prisma.systemConfig
    .upsert({
      where: { key: DB_TOKEN_KEY },
      update: { value: JSON.stringify(entry) },
      create: { key: DB_TOKEN_KEY, value: JSON.stringify(entry) },
    })
    .catch((err) => console.warn("[daraja] failed to persist token to DB:", err))

  return entry.value
}

/**
 * Initiate an STK Push (PIN prompt on the customer's phone).
 * Returns the CheckoutRequestID used to poll for the result.
 */
export async function initiateStkPush(args: {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
  callbackUrl: string
}): Promise<STKPushResponse> {
  const accessToken = await getAccessToken()
  const shortcode = process.env.MPESA_SHORTCODE
  if (!shortcode) throw new Error("M-Pesa shortcode not configured")

  const timestamp = stkTimestamp()
  const password = stkPassword(timestamp)
  const phone = formatPhoneNumber(args.phoneNumber)

  const requestBody = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.max(1, Math.round(args.amount)),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: args.callbackUrl,
    AccountReference: args.accountReference.slice(0, 12),
    TransactionDesc: args.transactionDesc.slice(0, 13),
  }

  const res = await darajaFetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  const raw = await res.text()
  let data: STKPushResponse & { errorCode?: string; errorMessage?: string; fault?: unknown }
  try {
    data = JSON.parse(raw)
  } catch {
    console.error(`[daraja] STK push non-JSON ${res.status}:`, raw.slice(0, 300))
    throw new Error(`STK Push failed: ${res.status} ${res.statusText} — ${raw.slice(0, 120)}`)
  }

  if (!res.ok || data.ResponseCode !== "0") {
    console.error(`[daraja] STK push rejected ${res.status}:`, JSON.stringify(data))
    const reason =
      data.ResponseDescription ||
      data.errorMessage ||
      (data.fault ? JSON.stringify(data.fault) : "") ||
      res.statusText
    throw new Error(`STK Push failed: ${reason}`)
  }
  return data
}

export interface QueryStatusResult {
  /** true only when the transaction completed successfully (ResultCode 0). */
  ok: boolean
  /** false while Safaricom is still awaiting the customer (no final result yet). */
  settled: boolean
  resultCode?: number
  resultDesc?: string
  message: string
}

/**
 * Poll the status of an STK transaction (used when no public callback exists).
 *
 * While the user has not yet acted, Daraja returns ResponseCode "0" with a
 * processing ResultCode (e.g. 1037/1032) or an error — we surface `settled`
 * so callers know whether to keep polling.
 */
export async function queryStkStatus(
  checkoutRequestId: string
): Promise<QueryStatusResult> {
  const shortcode = process.env.MPESA_SHORTCODE
  if (!shortcode || !process.env.MPESA_PASSKEY) {
    return { ok: false, settled: true, message: "M-Pesa credentials not configured" }
  }

  try {
    const accessToken = await getAccessToken()
    const timestamp = stkTimestamp()
    const password = stkPassword(timestamp)

    const res = await darajaFetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    })

    const data = (await res.json()) as {
      ResponseCode?: string
      ResponseDescription?: string
      errorCode?: string
      errorMessage?: string
      ResultCode?: string
      ResultDesc?: string
    }

    // "The transaction is being processed" — Safaricom is still awaiting the PIN.
    // Daraja returns errorCode 500.001.1001 in this window; keep polling.
    if (data.errorCode === "500.001.1001") {
      return {
        ok: false,
        settled: false,
        message: data.errorMessage || "Awaiting customer PIN…",
      }
    }

    if (res.ok === false || data.ResponseCode !== "0") {
      return {
        ok: false,
        settled: true,
        message: `Query failed: ${data.ResponseDescription || data.errorMessage || res.statusText}`,
      }
    }

    const resultCode = parseInt(data.ResultCode ?? "0", 10)
    return {
      ok: resultCode === 0,
      settled: true,
      resultCode,
      resultDesc: data.ResultDesc,
      message: data.ResultDesc || "Transaction status retrieved",
    }
  } catch (error) {
    // Network/timeout — treat as not-yet-settled so the caller can retry.
    return {
      ok: false,
      settled: false,
      message: error instanceof Error ? error.message : "Failed to query status",
    }
  }
}

export type { STKPushResponse }
