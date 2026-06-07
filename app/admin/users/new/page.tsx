"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@/lib/enums"

export default function AdminNewUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", role: "PSSF_OFFICER" as Role, employer_id: "" })
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) { setError("Failed to create user"); return }
    const { userId } = await res.json()
    router.push(`/admin/users/${userId}`)
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Create User</h1>
      <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
      <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <div><Label>Role</Label>
        <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {[Role.PSSF_OFFICER, Role.PSSF_SUPERVISOR, Role.EMPLOYER, Role.ADMIN].map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {form.role === Role.EMPLOYER && (
        <div><Label>Employer ID</Label><Input value={form.employer_id} onChange={(e) => setForm({ ...form, employer_id: e.target.value })} placeholder="UUID" /></div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button onClick={submit} className="bg-[#1A7A4A] text-white w-full">Create & send welcome email</Button>
    </div>
  )
}
