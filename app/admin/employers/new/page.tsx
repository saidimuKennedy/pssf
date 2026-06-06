"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function AdminNewEmployerPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", code: "", addOfficer: false, officer_name: "", officer_email: "" })

  async function submit() {
    const body: Record<string, unknown> = { name: form.name, code: form.code }
    if (form.addOfficer) {
      body.officer = { full_name: form.officer_name, email: form.officer_email }
    }
    const res = await fetch("/api/admin/employers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) router.push(`/admin/employers/${(await res.json()).id}`)
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Create Employer</h1>
      <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
      <div className="flex gap-2 items-center"><Checkbox checked={form.addOfficer} onCheckedChange={(v) => setForm({ ...form, addOfficer: Boolean(v) })} id="o" /><Label htmlFor="o">Add first officer</Label></div>
      {form.addOfficer && (
        <>
          <div><Label>Officer name</Label><Input value={form.officer_name} onChange={(e) => setForm({ ...form, officer_name: e.target.value })} /></div>
          <div><Label>Officer email</Label><Input value={form.officer_email} onChange={(e) => setForm({ ...form, officer_email: e.target.value })} /></div>
        </>
      )}
      <Button onClick={submit} className="w-full bg-[#1A7A4A] text-white">Create</Button>
    </div>
  )
}
