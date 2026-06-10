"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { StepIndicator } from "@/components/ui/step-indicator"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { BENEFITS_STEPS } from "@/lib/benefits/journey"
import { CaseStatus } from "@/lib/enums"

export default function BenefitsSubmittedPage() {
  const reference = useSearchParams().get("reference") ?? "—"
  const status = (useSearchParams().get("status") ?? "PENDING_EMPLOYER") as CaseStatus
  return (
    <div className="max-w-xl mx-auto space-y-8 text-center py-8">
      <StepIndicator steps={[...BENEFITS_STEPS]} currentStep={12} />
      <CheckCircle2 className="w-16 h-16 text-[#7C3AED] mx-auto" />
      <h1 className="text-2xl font-bold">Claim Submitted</h1>
      <p className="font-mono text-lg">{reference}</p>
      <StatusBadge status={status} />
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline" size="lg" className="w-full sm:flex-1"><Link href="/member/requests">Track Request</Link></Button>
        <Button asChild size="lg" className="w-full sm:flex-1 bg-[#7C3AED] hover:bg-[#6d28d9] text-white"><Link href="/member/dashboard">Back to Dashboard</Link></Button>
      </div>
    </div>
  )
}
