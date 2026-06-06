"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@prisma/client"

interface UserRow { id: string; name: string; email: string; phone: string; role: Role; is_active: boolean; created_at: string }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [role, setRole] = useState("ALL")
  const [search, setSearch] = useState("")

  function load() {
    const params = new URLSearchParams({ limit: "50" })
    if (role !== "ALL") params.set("role", role)
    if (search) params.set("search", search)
    fetch(`/api/admin/users?${params}`).then((r) => r.json()).then((d) => setUsers(d.data ?? []))
  }

  useEffect(() => { load() }, [role])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D2137]">Users</h1>
        <Button asChild><Link href="/admin/users/new">Create user</Link></Button>
      </div>
      <div className="flex gap-3">
        <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button variant="outline" onClick={load}>Search</Button>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            {Object.values(Role).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>
            <th className="text-left px-4 py-2">Name</th><th className="text-left px-4 py-2">Email</th><th className="text-left px-4 py-2">Role</th><th className="text-left px-4 py-2">Status</th><th className="text-left px-4 py-2">Created</th>
          </tr></thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-2"><Link href={`/admin/users/${u.id}`} className="text-[#1A7A4A] hover:underline">{u.name}</Link></td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{u.is_active ? "Active" : "Inactive"}</td>
                <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
