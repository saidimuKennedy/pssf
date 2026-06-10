"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { StepIndicator } from "@/components/ui/step-indicator"
import { Button } from "@/components/ui/button"

const STEPS = ["Identity", "Details", "Documents", "Declaration", "Preview", "Confirm", "Done"]

export default function EnrolmentStep7Page() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference") ?? "—"

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={7} />

      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-[#1A7A4A]" />
        </div>
        <h1 className="text-2xl font-bold text-[#0D2137]">Application Submitted</h1>
        <p className="text-sm text-gray-500">
          Your member enrolment application has been received and is being processed.
        </p>

        <div className="rounded-lg border border-[#1A7A4A]/30 bg-green-50 p-4 inline-block mx-auto">
          <p className="text-xs text-gray-500 mb-1">Reference Number</p>
          <p className="text-xl font-mono font-bold text-[#0D2137]">{reference}</p>
        </div>

        <p className="text-sm text-gray-500">
          Keep this reference number for your records. You will receive a notification when your
          application is reviewed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline" size="lg" className="w-full sm:flex-1">
          <Link href="/member/requests">View My Requests</Link>
        </Button>
        <Button asChild size="lg" className="w-full sm:flex-1 bg-[#1A7A4A] hover:bg-[#145f3a] text-white">
          <Link href="/member/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
