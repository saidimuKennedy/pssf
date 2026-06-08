"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { TableScroll } from "@/components/ui/table-scroll"

interface Rule { id: string; trigger_event: string; recipient_type: string; channel: string; template_ref: string; is_active: boolean }

export default function AdminNotificationsPage() {
  const [rules, setRules] = useState<Rule[]>([])

  function load() {
    fetch("/api/admin/notification-rules").then((r) => r.json()).then((d) => setRules(d.data ?? []))
  }
  useEffect(() => { load() }, [])

  async function toggle(id: string, is_active: boolean) {
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, is_active } : r)))
    await fetch(`/api/admin/notification-rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active }),
    })
  }

  const grouped = rules.reduce<Record<string, Rule[]>>((acc, r) => {
    (acc[r.trigger_event] ??= []).push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notification Rules ({rules.length})</h1>
      {Object.entries(grouped).map(([trigger, items]) => (
        <TableScroll key={trigger}>
          <div className="px-4 py-2 bg-gray-50 font-medium border-b">{trigger}</div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.recipient_type}</td>
                  <td className="px-4 py-2">{r.channel}</td>
                  <td className="px-4 py-2 text-gray-500">{r.template_ref}</td>
                  <td className="px-4 py-2 text-right">
                    <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      ))}
    </div>
  )
}
