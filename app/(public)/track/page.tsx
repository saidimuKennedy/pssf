"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/ui/status-badge"
import type { CaseStatus } from "@/lib/enums"

interface TrackResult {
  reference: string
  type_label: string
  status: CaseStatus
  submitted_at: string | null
  updated_at: string
  status_history: { from_status: string | null; to_status: string; created_at: string }[]
}

export default function TrackPage() {
  const [ref, setRef] = useState("")
  const [result, setResult] = useState<TrackResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!ref.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(ref.trim())}`)
      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? "No request found with this reference number. Please check and try again.")
        return
      }
      setResult(body as TrackResult)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] px-4 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="text-sm text-[#1A7A4A] hover:underline">← Back to home</Link>
          <h1 className="text-2xl font-bold text-[#0D2137]">Track Your Request</h1>
          <p className="text-sm text-gray-500">
            Enter your case reference number to view the current status.
          </p>
        </div>

        <form onSubmit={handleTrack} className="bg-white border rounded-lg p-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="ref">Reference number</Label>
            <Input
              id="ref"
              placeholder="e.g. ENR-2024-000001"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#0D2137] text-white">
            {loading ? "Looking up…" : "Track request"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-semibold text-[#0D2137]">{result.reference}</p>
                <p className="text-sm text-gray-500">{result.type_label}</p>
              </div>
              <StatusBadge status={result.status} />
            </div>

            {result.submitted_at && (
              <p className="text-sm text-gray-500">
                Submitted: {new Date(result.submitted_at).toLocaleDateString("en-KE")}
              </p>
            )}

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">Status history</h2>
              <ul className="space-y-2 text-sm">
                {result.status_history.map((h, i) => (
                  <li key={i} className="flex justify-between border-b border-gray-100 pb-2">
                    <span>{h.to_status.replace(/_/g, " ")}</span>
                    <span className="text-gray-400">
                      {new Date(h.created_at).toLocaleDateString("en-KE")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-400">
              Sign in to view full case details, documents, and respond to requests.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Sign in to portal</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
