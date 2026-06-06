import { CaseStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Partial<
  Record<CaseStatus, { label: string; className: string }>
> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  SUBMITTED: { label: "Submitted", className: "bg-indigo-100 text-indigo-700" },
  PENDING_EMPLOYER: { label: "Pending Employer", className: "bg-amber-100 text-amber-700" },
  EMPLOYER_APPROVED: { label: "Employer Approved", className: "bg-green-100 text-green-700" },
  EMPLOYER_REJECTED: { label: "Employer Rejected", className: "bg-red-100 text-red-700" },
  UNDER_REVIEW: { label: "Under Review", className: "bg-amber-100 text-amber-700" },
  MORE_INFO_REQUIRED: { label: "More Info Required", className: "bg-blue-100 text-blue-700" },
  UNDER_VERIFICATION: { label: "Under Verification", className: "bg-amber-100 text-amber-700" },
  AWAITING_TRUSTEE: { label: "Awaiting Trustee", className: "bg-purple-100 text-purple-700" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  PAYMENT_PROCESSING: { label: "Payment Processing", className: "bg-teal-100 text-teal-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-600" },
}

interface StatusBadgeProps {
  status: CaseStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-gray-100 text-gray-600",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export const CASE_TYPE_LABELS: Record<string, string> = {
  MEMBER_ENROLMENT: "Member Enrolment",
  BENEFICIARY_NOMINATION: "Beneficiary Nomination",
  AVC: "AVC Contribution",
  BENEFITS_CLAIM: "Benefits Claim",
  DEATH_BENEFITS_CLAIM: "Death Benefits Claim",
  MISSING_CONTRIBUTION: "Missing Contribution",
  DISCREPANCY: "Discrepancy",
}
