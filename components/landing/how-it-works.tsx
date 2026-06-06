import {
  CheckCircle,
  CheckSquare,
  FileText,
  Flag,
  Upload,
  User,
} from "lucide-react"

const STEPS = [
  {
    num: 1,
    icon: CheckCircle,
    iconColor: "#16A34A",
    iconBg: "#ECFDF5",
    label: "Validate",
    description: "We verify your details",
  },
  {
    num: 2,
    icon: FileText,
    iconColor: "#2563EB",
    iconBg: "#EFF6FF",
    label: "Complete",
    description: "Fill in the required information",
  },
  {
    num: 3,
    icon: Upload,
    iconColor: "#EA580C",
    iconBg: "#FFF7ED",
    label: "Upload",
    description: "Upload supporting documents",
  },
  {
    num: 4,
    icon: User,
    iconColor: "#7C3AED",
    iconBg: "#F5F3FF",
    label: "Review",
    description: "We review your submission",
  },
  {
    num: 5,
    icon: CheckSquare,
    iconColor: "#0D9488",
    iconBg: "#F0FDFA",
    label: "Approval",
    description: "Employer/PSSF review and approve",
  },
  {
    num: 6,
    icon: Flag,
    iconColor: "#0D2137",
    iconBg: "#F1F5F9",
    label: "Track",
    description: "Track your request to completion",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white dark:bg-gray-900 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-[28px] font-bold text-[#0D2137] dark:text-white">How it works</h2>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-gray-400">
            One simple process for all our services
          </p>
        </div>

        {/* Desktop horizontal */}
        <div className="hidden lg:flex items-start justify-between gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.num} className="flex flex-1 items-start">
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className="flex size-14 items-center justify-center rounded-full mb-3"
                    style={{ backgroundColor: step.iconBg }}
                  >
                    <Icon className="size-6" style={{ color: step.iconColor }} aria-hidden />
                  </div>
                  <span className="text-xs font-medium text-[#6B7280] dark:text-gray-400 mb-1">
                    Step {step.num}
                  </span>
                  <p className="text-sm font-bold text-[#0D2137] dark:text-white">{step.label}</p>
                  <p className="text-[10px] text-[#6B7280] dark:text-gray-400 mt-1 max-w-[120px]">
                    {step.description}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className="mt-7 h-px flex-1 min-w-[16px] border-t-2 border-dashed border-[#E5E7EB] dark:border-gray-600 mx-1"
                    aria-hidden
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile / tablet vertical */}
        <div className="lg:hidden flex flex-col items-center gap-0">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.num} className="flex flex-col items-center">
                <div
                  className="flex size-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: step.iconBg }}
                >
                  <Icon className="size-6" style={{ color: step.iconColor }} aria-hidden />
                </div>
                <span className="text-xs font-medium text-[#6B7280] dark:text-gray-400 mt-2">
                  Step {step.num}
                </span>
                <p className="text-sm font-bold text-[#0D2137] dark:text-white mt-0.5">
                  {step.label}
                </p>
                <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5 text-center max-w-xs">
                  {step.description}
                </p>
                {idx < STEPS.length - 1 && (
                  <div
                    className="my-3 h-8 w-px border-l-2 border-dashed border-[#E5E7EB] dark:border-gray-600"
                    aria-hidden
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
