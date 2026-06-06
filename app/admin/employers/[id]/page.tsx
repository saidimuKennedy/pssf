"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminEmployerDetailPage() {
  const { id } = useParams()
  const [emp, setEmp] = useState<Record<string, unknown> | null>(null)
  const [officer, setOfficer] = useState({ full_name: "", email: "", phone: "" })

  function load() { fetch(`/api/admin/employers/${id}`).then((r) => r.json()).then(setEmp) }
  useEffect(() => { load() }, [id])

  async function addOfficer() {
    await fetch(`/api/admin/employers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ add_officer: officer }),
    })
    load()
  }

  if (!emp) return <p>Loading…</p>
  const officers = (emp.officers as { id: string; full_name: string; is_active: boolean; user: { email: string } }[]) ?? []
  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/employers" className="text-sm text-[#1A7A4A]">← Employers</Link>
      <h1 className="text-2xl font-bold">{String(emp.name)}</h1>
      <p className="text-gray-500">Code: {String(emp.code)} · Cases: {String((emp._count as { cases: number })?.cases ?? 0)}</p>
      <Link href={`/staff/cases?employer=${id}`} className="text-sm text-[#1A7A4A]">View cases for this employer</Link>
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-medium mb-2">Officers</h2>
        {officers.map((o) => <p key={o.id} className="text-sm">{o.full_name} — {o.user.email} ({o.is_active ? "active" : "inactive"})</p>)}
      </div>
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Add officer</h2>
        <div><Label>Name</Label><Input value={officer.full_name} onChange={(e) => setOfficer({ ...officer, full_name: e.target.value })} /></div>
        <div><Label>Email</Label><Input value={officer.email} onChange={(e) => setOfficer({ ...officer, email: e.target.value })} /></div>
        <Button onClick={addOfficer}>Add officer</Button>
      </div>
    </div>
  )
}
