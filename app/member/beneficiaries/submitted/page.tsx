"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { BENEFICIARY_STEPS } from "@/lib/beneficiaries/journey"
import { CaseStatus } from "@/lib/enums"

export default function BeneficiarySubmittedPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") ?? "—"
  const status = (searchParams.get("status") ?? "UNDER_REVIEW") as CaseStatus

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={[...BENEFICIARY_STEPS]} currentStep={10} />

      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-[#2563EB]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0D2137]">Nomination Submitted</h1>
        <p className="text-sm text-gray-500">
          Your beneficiary nomination has been received and sent directly to PSSF for review.
        </p>

        <div className="rounded-lg border border-[#2563EB]/30 bg-blue-50 p-4 inline-block mx-auto space-y-2">
          <p className="text-xs text-gray-500">Reference Number</p>
          <p className="text-xl font-mono font-bold text-[#0D2137]">{reference}</p>
          <div className="flex justify-center pt-1">
            <StatusBadge status={status} />
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Keep this reference number for your records. You will receive a notification when
          your nomination is reviewed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline" size="lg" className="w-full sm:flex-1">
          <Link href="/member/requests">Track My Request</Link>
        </Button>
        <Button asChild size="lg" className="w-full sm:flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white">
          <Link href="/member/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
