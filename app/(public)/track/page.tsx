"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import type { CaseStatus } from "@/lib/enums"
import {
  Search,
  ArrowLeft,
  AlertTriangle,
  Info,
  Calendar,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PENDING_EMPLOYER: "Pending Employer Approval",
  EMPLOYER_APPROVED: "Employer Approved",
  EMPLOYER_REJECTED: "Employer Rejected",
  UNDER_REVIEW: "Under PSSF Review",
  MORE_INFO_REQUIRED: "More Information Required",
  UNDER_VERIFICATION: "Pending Verification",
  AWAITING_TRUSTEE: "Awaiting Trustee",
  APPROVED: "Approved",
  PAYMENT_PROCESSING: "Payment Processing",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CLOSED: "Closed",
}

function formatStatus(raw: string): string {
  return STATUS_LABELS[raw] ?? raw.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

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
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#E8F5EE]/40 via-white to-[#EFF6FF]/40 px-4 py-16 sm:py-24">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-15%,rgba(26,122,74,0.08),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_70%,transparent_100%)] opacity-55" />
      </div>

      <div className="relative max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A7A4A] hover:text-[#166A40] transition-colors group mb-2"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> 
            Back to home
          </Link>
          <h1 className="text-3xl font-extrabold text-[#0D2137] tracking-tight">Track Your Request</h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Enter your case reference number to view the live progress.
          </p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleTrack} className="glass-panel p-6 rounded-2xl shadow-premium space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ref" className="text-xs font-bold text-[#0D2137] uppercase tracking-wider">
              Reference number
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="size-4" />
              </span>
              <Input
                id="ref"
                placeholder="e.g. ENR-2024-000001"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                required
                className="pl-10 h-11 bg-white/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1A7A4A] focus:border-transparent rounded-xl transition-all"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-[#0D2137] to-[#12304B] hover:from-[#12304B] hover:to-[#0D2137] text-white h-11 rounded-xl shadow-md transition-all font-semibold active:scale-99 hover:-translate-y-0.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Looking up…
              </>
            ) : (
              "Track Request"
            )}
          </Button>
        </form>

        {/* Error panel */}
        {error && (
          <div className="glass-panel border-rose-250 bg-rose-50/40 p-5 rounded-2xl shadow-premium animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-100/80 text-rose-600">
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-rose-900">Request Not Found</h4>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-rose-200/20 text-[11px] text-gray-500 space-y-1.5">
              <p className="font-bold text-[#0D2137]">Troubleshooting tips:</p>
              <ul className="list-disc list-inside pl-1 space-y-0.5">
                <li>Check for typos (uppercase, dashes).</li>
                <li>Make sure the code matches your submission receipt.</li>
                <li>Still stuck? Contact <a href="#support" className="text-[#1A7A4A] hover:underline font-bold">Support</a> for assistance.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Result panel */}
        {result && (
          <div className="glass-panel p-6 rounded-2xl shadow-premium space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-5">
              <div>
                <p className="font-mono font-bold text-lg text-[#0D2137] tracking-tight">{result.reference}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{result.type_label}</p>
              </div>
              <StatusBadge status={result.status} className="shadow-sm border border-transparent" />
            </div>

            {/* Submission metadata */}
            {result.submitted_at && (
              <div className="flex items-center gap-2.5 rounded-xl bg-[#F9FAFB] border border-gray-100 p-3.5 text-xs text-gray-650">
                <Calendar className="size-4 text-[#1A7A4A] shrink-0" />
                <span>
                  <strong>Submitted:</strong> {new Date(result.submitted_at).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </span>
              </div>
            )}

            {/* Status History Stepper */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#0D2137] uppercase tracking-wider">
                Status History
              </h3>
              
              <div className="relative pl-6 space-y-6">
                {/* Timeline connector track line */}
                <div 
                  aria-hidden 
                  className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#1A7A4A] via-gray-200 to-gray-200 rounded-full"
                />
                
                {result.status_history.map((h, i) => {
                  const isLatest = i === 0
                  return (
                    <div key={i} className="relative group">
                      {/* Stepper node circle */}
                      <span 
                        className={cn(
                          "absolute -left-[23px] top-1.5 flex size-[12px] items-center justify-center rounded-full border-2 bg-white transition-all",
                          isLatest 
                            ? "border-[#1A7A4A] ring-4 ring-[#1A7A4A]/10 scale-110" 
                            : "border-gray-300"
                        )}
                      >
                        {isLatest && (
                          <span className="size-1.5 rounded-full bg-[#1A7A4A] animate-pulse" />
                        )}
                      </span>
                      
                      {/* Step details */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <p className={cn(
                            "text-sm font-bold transition-colors",
                            isLatest ? "text-[#0D2137]" : "text-gray-500 font-medium"
                          )}>
                            {formatStatus(h.to_status)}
                          </p>
                          {isLatest && (
                            <p className="text-[10px] text-[#1A7A4A] font-semibold tracking-wide uppercase mt-0.5">
                              Current Status
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-gray-400 shrink-0 mt-0.5">
                          {new Date(h.created_at).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Portal redirection info banner */}
            <div className="pt-5 border-t border-gray-100 space-y-3">
              <div className="flex gap-2.5 bg-gradient-to-r from-[#EFF6FF] to-blue-50/10 border border-blue-100/50 p-3.5 rounded-xl text-xs text-blue-800 leading-relaxed shadow-sm">
                <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Sign in to your member portal to view full case logs, upload requested documents, and communicate with representatives.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full h-10 border-gray-250 text-[#0D2137] hover:bg-gray-50 rounded-xl font-semibold transition-all cursor-pointer">
                <Link href="/login">Sign in to portal</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
