"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"

interface NotificationItem {
  id: string
  message: string
  case_id: string | null
  created_at: string
}

interface NotificationBellProps {
  viewAllHref?: string
}

export function NotificationBell({ viewAllHref = "/member/notifications" }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)

  async function load() {
    const res = await fetch("/api/notifications?unread=true&limit=5")
    if (res.ok) {
      const data = await res.json()
      setItems(data.data ?? [])
      setUnread(data.total ?? 0)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" })
    load()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-1"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="px-4 py-2 border-b font-medium text-sm">Notifications</div>
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">No unread notifications</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id} className="border-b last:border-0">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      markRead(n.id)
                      setOpen(false)
                      if (n.case_id) window.location.href = `${viewAllHref.replace("/notifications", "/requests")}/${n.case_id}`
                    }}
                  >
                    <p className="line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="px-4 py-2 border-t">
            <Link href={viewAllHref} className="text-sm text-[#1A7A4A] hover:underline" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
