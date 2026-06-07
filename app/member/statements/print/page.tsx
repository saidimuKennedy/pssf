"use client"

import { useCallback, useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { formatKes } from "@/lib/format"
import { PssfLogo } from "@/components/pssf-logo"

type Period = "CURRENT_YEAR" | "LAST_12" | "LAST_24" | "FULL" | "CUSTOM"

interface StatementData {
  summary: { total_employee: number; total_employer: number; interest_earned: number; total_balance: number }
  last_updated: string
  full_name: string
  member_number: string | null
  period: { from: string; to: string }
}

function StatementPrintContent() {
  const searchParams = useSearchParams()
  const period = (searchParams.get("period") ?? "LAST_12") as Period
  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const [data, setData] = useState<StatementData | null>(null)

  const load = useCallback(async () => {
    const params = new URLSearchParams({ period })
    if (period === "CUSTOM" && from) params.set("from", from)
    if (period === "CUSTOM" && to) params.set("to", to)
    const res = await fetch(`/api/member/contributions?${params}`)
    if (res.ok) setData(await res.json())
  }, [period, from, to])

  useEffect(() => {
    load().then(() => {
      const timer = setTimeout(() => window.print(), 400)
      return () => clearTimeout(timer)
    })
  }, [load])

  const s = data?.summary

  return (
    <div className="min-h-screen bg-[#F5F5F5] print:bg-white print:min-h-0">
      <div className="max-w-3xl mx-auto bg-white p-8 my-8 border shadow-sm print:shadow-none print:border-0 print:my-0 print:max-w-none print:p-6">
        <header className="border-b border-gray-300 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Public Service Superannuation Fund</p>
              <h1 className="text-2xl font-bold text-[#0D2137] mt-1">Contribution Statement</h1>
            </div>
            <PssfLogo width={106} height={60} priority />
          </div>
        </header>

        {!data ? (
          <p className="text-gray-500">Loading statement…</p>
        ) : (
          <>
            <section className="mb-6 text-sm space-y-1">
              <p><strong>Member:</strong> {data.full_name}</p>
              {data.member_number && <p><strong>Member No:</strong> {data.member_number}</p>}
              <p><strong>Period:</strong> {data.period.from} to {data.period.to}</p>
              {data.last_updated && (
                <p><strong>Last updated:</strong> {new Date(data.last_updated).toLocaleDateString("en-KE")}</p>
              )}
            </section>

            {s && (
              <table className="w-full text-sm border-collapse mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2 font-semibold">Description</th>
                    <th className="text-right py-2 font-semibold">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Employee Contributions</td>
                    <td className="py-2 text-right">{formatKes(s.total_employee)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Employer Contributions</td>
                    <td className="py-2 text-right">{formatKes(s.total_employer)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">Interest Earned</td>
                    <td className="py-2 text-right">{formatKes(s.interest_earned)}</td>
                  </tr>
                  <tr className="font-bold text-base">
                    <td className="py-3">Total Balance</td>
                    <td className="py-3 text-right">{formatKes(s.total_balance)}</td>
                  </tr>
                </tbody>
              </table>
            )}

            <footer className="text-xs text-gray-500 border-t border-gray-200 pt-4 mt-8">
              <p>This is an official PSSF contribution statement. For queries, contact PSSF or report a discrepancy via the member portal.</p>
              <p className="mt-1">Generated on {new Date().toLocaleDateString("en-KE")}</p>
            </footer>
          </>
        )}

        <div className="print:hidden mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#0D2137] text-white rounded-md text-sm"
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StatementPrintPage() {
  return (
    <Suspense fallback={<p className="text-gray-500 p-8">Loading…</p>}>
      <StatementPrintContent />
    </Suspense>
  )
}
