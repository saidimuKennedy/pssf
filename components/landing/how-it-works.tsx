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
    <section id="how-it-works" className="relative bg-[#F9FAFB] py-20 lg:py-24 overflow-hidden border-y border-gray-200/40">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_70%,transparent_100%)] opacity-50" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1A7A4A]">
            Simple process
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#0D2137]">
            How it works
          </h2>
          <p className="mt-3 text-base text-gray-500 max-w-sm mx-auto">
            One simple process for all our services
          </p>
        </div>

        {/* Desktop horizontal */}
        <div className="relative hidden lg:block px-4">
          {/* connector track */}
          <div
            aria-hidden
            className="absolute left-10 right-10 top-7 h-[3px] bg-gradient-to-r from-[#16A34A]/40 via-[#7C3AED]/40 to-[#0D2137]/40 rounded-full"
          />
          <ol className="relative grid grid-cols-6 gap-2">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <li key={step.num} className="group flex flex-col items-center text-center">
                  <div className="relative">
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-200/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:-translate-y-1"
                      style={{ backgroundColor: step.iconBg }}
                    >
                      <Icon className="size-6 transition-transform duration-300 group-hover:rotate-6" style={{ color: step.iconColor }} aria-hidden />
                    </div>
                    <span
                      className="absolute -right-1.5 -top-1.5 flex size-5.5 items-center justify-center rounded-full text-[10px] font-extrabold text-white shadow-sm border border-white ring-1 ring-black/5"
                      style={{ backgroundColor: step.iconColor }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-bold text-[#0D2137] group-hover:text-black transition-colors">
                    {step.label}
                  </p>
                  <p className="mt-1.5 max-w-[130px] text-xs text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Mobile / tablet vertical */}
        <ol className="lg:hidden relative mx-auto max-w-sm space-y-6 pl-4">
          <div
            aria-hidden
            className="absolute left-[27px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#16A34A]/40 via-[#7C3AED]/40 to-[#0D2137]/40 rounded-full"
          />
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li key={step.num} className="group relative flex items-start gap-5 py-1">
                <div
                  className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-200/50 transition-all duration-300 group-hover:scale-105"
                  style={{ backgroundColor: step.iconBg }}
                >
                  <Icon className="size-5" style={{ color: step.iconColor }} aria-hidden />
                </div>
                <div className="pt-0.5">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold text-white mb-1 shadow-sm"
                    style={{ backgroundColor: step.iconColor }}
                  >
                    Step {step.num}
                  </span>
                  <p className="text-sm font-bold text-[#0D2137]">{step.label}</p>
                  <p className="text-xs text-gray-505 mt-0.5">{step.description}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
