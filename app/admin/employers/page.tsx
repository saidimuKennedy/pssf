"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Row { id: string; name: string; code: string; officer_count: number; active_cases_count: number; is_active: boolean }

export default function AdminEmployersPage() {
  const [rows, setRows] = useState<Row[]>([])
  useEffect(() => {
    fetch("/api/admin/employers?limit=50").then((r) => r.json()).then((d) => setRows(d.data ?? []))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between"><h1 className="text-2xl font-bold">Employers</h1><Button asChild><Link href="/admin/employers/new">Create employer</Link></Button></div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Code</th><th className="text-left px-4 py-2">Officers</th><th className="text-left px-4 py-2">Cases</th><th className="text-left px-4 py-2">Status</th>
          </tr></thead>
          <tbody className="divide-y">
            {rows.map((e) => (
              <tr key={e.id}><td className="px-4 py-2"><Link href={`/admin/employers/${e.id}`} className="text-[#1A7A4A]">{e.name}</Link></td>
                <td className="px-4 py-2">{e.code}</td><td className="px-4 py-2">{e.officer_count}</td><td className="px-4 py-2">{e.active_cases_count}</td>
                <td className="px-4 py-2">{e.is_active ? "Active" : "Inactive"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
