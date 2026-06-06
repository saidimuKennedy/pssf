"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface NotificationRow {
  id: string
  message: string
  read: boolean
  case_id: string | null
  created_at: string
}

export default function MemberNotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([])

  function load() {
    fetch("/api/notifications?limit=50").then((r) => r.json()).then((d) => setItems(d.data ?? []))
  }

  useEffect(() => { load() }, [])

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" })
    load()
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" })
    load()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0D2137]">Notifications</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
      </div>
      <div className="bg-white border rounded-lg divide-y">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-500">No notifications</p>
        ) : items.map((n) => (
          <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-blue-50" : ""}`}>
            <p className="text-sm">{n.message}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
              {n.case_id && <Link href={`/member/requests/${n.case_id}`} className="text-xs text-[#1A7A4A] hover:underline">View case</Link>}
              {!n.read && <button type="button" className="text-xs text-gray-500 hover:underline" onClick={() => markRead(n.id)}>Mark read</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
