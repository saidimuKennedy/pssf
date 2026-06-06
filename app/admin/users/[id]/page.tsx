"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@prisma/client"

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [role, setRole] = useState("")

  function load() {
    fetch(`/api/admin/users/${id}`).then((r) => r.json()).then((u) => { setUser(u); setRole(u.role) })
  }
  useEffect(() => { load() }, [id])

  async function patch(data: Record<string, unknown>) {
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    load()
  }

  if (!user) return <p>Loading…</p>
  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/users" className="text-sm text-[#1A7A4A]">← Users</Link>
      <h1 className="text-2xl font-bold">{String(user.email ?? user.phone)}</h1>
      <div className="bg-white border rounded-lg p-4 text-sm space-y-1">
        <p>Role: {String(user.role)}</p>
        <p>Status: {user.is_active ? "Active" : "Inactive"}</p>
        <p>Phone: {String(user.phone ?? "—")}</p>
        {user.member != null ? <p>Linked member: {(user.member as { full_name: string }).full_name}</p> : null}
        {user.employer_officer != null ? <p>Employer officer: {(user.employer_officer as { full_name: string }).full_name}</p> : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.values(Role).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={() => patch({ role })}>Update role</Button>
        <Button variant="outline" onClick={() => patch({ is_active: !user.is_active })}>{user.is_active ? "Deactivate" : "Activate"}</Button>
        <Button variant="outline" onClick={() => patch({ reset_password: true })}>Reset password</Button>
      </div>
    </div>
  )
}
