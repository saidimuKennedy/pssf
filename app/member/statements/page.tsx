"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatKes } from "@/lib/format"

type Period = "CURRENT_YEAR" | "LAST_12" | "LAST_24" | "FULL" | "CUSTOM"

interface StatementData {
  summary: { total_employee: number; total_employer: number; interest_earned: number; total_balance: number }
  last_updated: string
  full_name: string
  member_number: string | null
  period: { from: string; to: string }
}

export default function StatementsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<Period>("LAST_12")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [data, setData] = useState<StatementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ period })
    if (period === "CUSTOM" && from) params.set("from", from)
    if (period === "CUSTOM" && to) params.set("to", to)
    const res = await fetch(`/api/member/contributions?${params}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [period, from, to])

  useEffect(() => { load() }, [load])

  async function sendStatement(channel: "EMAIL" | "WHATSAPP") {
    if (!data) return
    setSending(channel)
    await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerEvent: "STATEMENT_EMAIL",
        channel,
        variables: {
          full_name: data.full_name,
          period_from: data.period.from,
          period_to: data.period.to,
          total_balance: String(data.summary.total_balance),
          message: `Your PSSF contribution statement for ${data.period.from} to ${data.period.to}. Total balance: ${formatKes(data.summary.total_balance)}`,
        },
      }),
    })
    setSending(null)
    alert(channel === "EMAIL" ? "Statement sent to your email." : "Statement sent via WhatsApp.")
  }

  function downloadPdf() {
    const params = new URLSearchParams({ period })
    if (period === "CUSTOM" && from) params.set("from", from)
    if (period === "CUSTOM" && to) params.set("to", to)
    router.push(`/member/statements/print?${params}`)
  }

  const s = data?.summary
  return (
    <div className="max-w-3xl mx-auto space-y-8 print:max-w-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D2137]">Contribution Statement</h1>
        <Link href="/member/statements/detail" className="text-sm text-[#1A7A4A] hover:underline">View full breakdown</Link>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="CURRENT_YEAR">Current Year</SelectItem>
            <SelectItem value="LAST_12">Last 12 Months</SelectItem>
            <SelectItem value="LAST_24">Last 24 Months</SelectItem>
            <SelectItem value="FULL">Full Statement</SelectItem>
            <SelectItem value="CUSTOM">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        {period === "CUSTOM" && (
          <>
            <div><Label className="sr-only">From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><Label className="sr-only">To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <Button variant="outline" onClick={load}>Apply</Button>
          </>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading statement…</p>
      ) : s && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Employee Contributions", value: s.total_employee },
              { label: "Employer Contributions", value: s.total_employer },
              { label: "Interest Earned", value: s.interest_earned },
              { label: "Total Balance", value: s.total_balance, bold: true },
            ].map((card) => (
              <div key={card.label} className="bg-white border rounded-lg p-4">
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-xl ${card.bold ? "font-bold text-[#0D2137]" : "text-gray-900"}`}>{formatKes(card.value)}</p>
              </div>
            ))}
          </div>
          {data?.last_updated && (
            <p className="text-sm text-gray-500">Last updated: {new Date(data.last_updated).toLocaleDateString("en-KE")}</p>
          )}
          {data?.period && (
            <p className="text-sm text-gray-500">Period: {data.period.from} to {data.period.to}</p>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button variant="outline" onClick={downloadPdf}>Download PDF</Button>
        <Button variant="outline" onClick={() => sendStatement("EMAIL")} disabled={sending === "EMAIL"}>Send to Email</Button>
        <Button variant="outline" onClick={() => sendStatement("WHATSAPP")} disabled={sending === "WHATSAPP"}>Send to WhatsApp</Button>
        <Button variant="outline" asChild>
          <Link href="/member/discrepancy?source=statement">Request Clarification</Link>
        </Button>
        <Button className="bg-[#D97706] hover:bg-[#b45309] text-white" onClick={() => router.push("/member/statements/missing")}>
          Report Missing Contribution
        </Button>
      </div>
    </div>
  )
}
