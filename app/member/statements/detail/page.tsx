"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatKes } from "@/lib/format"

interface Row { month: string; amount: number; date_received: string; status: string }

export default function StatementDetailPage() {
  const [employee, setEmployee] = useState<Row[]>([])
  const [employer, setEmployer] = useState<Row[]>([])
  const [summary, setSummary] = useState({ interest: 0, total: 0 })

  useEffect(() => {
    fetch("/api/member/contributions?period=LAST_24").then((r) => r.json()).then((d) => {
      setEmployee(d.employee_contributions ?? [])
      setEmployer(d.employer_contributions ?? [])
      setSummary({
        interest: d.summary?.interest_earned ?? 0,
        total: d.summary?.total_balance ?? 0,
      })
    })
  }, [])

  function Table({ title, rows }: { title: string; rows: Row[] }) {
    const total = rows.filter((r) => r.status !== "MISSING").reduce((s, r) => s + r.amount, 0)
    return (
      <section className="bg-white border rounded-lg overflow-hidden">
        <h2 className="px-4 py-3 font-medium border-b bg-gray-50">{title}</h2>
        <table className="w-full text-sm">
          <thead className="border-b"><tr className="text-left text-gray-500">
            <th className="px-4 py-2">Month</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Date Received</th><th className="px-4 py-2">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.month} className={r.status === "MISSING" ? "bg-amber-50 text-amber-800" : ""}>
                <td className="px-4 py-2">{r.month}</td>
                <td className="px-4 py-2">{r.status === "MISSING" ? "—" : formatKes(r.amount)}</td>
                <td className="px-4 py-2">{r.date_received || "—"}</td>
                <td className="px-4 py-2">{r.status}</td>
              </tr>
            ))}
            <tr className="font-medium bg-gray-50">
              <td className="px-4 py-2">Total</td>
              <td className="px-4 py-2" colSpan={3}>{formatKes(total)}</td>
            </tr>
          </tbody>
        </table>
      </section>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/member/statements" className="text-sm text-[#1A7A4A] hover:underline">← Back to summary</Link>
      <h1 className="text-2xl font-bold text-[#0D2137]">Contribution Breakdown</h1>
      <Table title="Employee Contributions" rows={employee} />
      <Table title="Employer Contributions" rows={employer} />
      <section className="bg-white border rounded-lg p-4 space-y-2">
        <h2 className="font-medium">Interest and Total</h2>
        <div className="flex justify-between text-sm"><span>Interest earned</span><span>{formatKes(summary.interest)}</span></div>
        <div className="flex justify-between font-bold"><span>Total balance</span><span>{formatKes(summary.total)}</span></div>
      </section>
    </div>
  )
}
