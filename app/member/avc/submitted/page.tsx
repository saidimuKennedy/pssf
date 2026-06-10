"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { AVC_STEPS, submittedNextSteps } from "@/lib/avc/journey"
import { CaseStatus } from "@/lib/enums"

export default function AVCSubmittedPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") ?? "—"
  const status = (searchParams.get("status") ?? "PENDING_EMPLOYER") as CaseStatus
  const method = searchParams.get("method") ?? "PAYROLL"

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...AVC_STEPS]} currentStep={7} />

      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-[#16A34A]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0D2137]">Application Submitted</h1>
        <p className="text-sm text-gray-500">
          Your additional voluntary contribution request has been received.
        </p>

        <div className="rounded-lg border border-[#16A34A]/30 bg-green-50 p-4 inline-block mx-auto space-y-2">
          <p className="text-xs text-gray-500">Reference Number</p>
          <p className="text-xl font-mono font-bold text-[#0D2137]">{reference}</p>
          <div className="flex justify-center pt-1">
            <StatusBadge status={status} />
          </div>
        </div>

        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          {submittedNextSteps(method)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline" size="lg" className="w-full sm:flex-1">
          <Link href="/member/requests">Track My Request</Link>
        </Button>
        <Button asChild size="lg" className="w-full sm:flex-1 bg-[#16A34A] hover:bg-[#145f3a] text-white">
          <Link href="/member/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
