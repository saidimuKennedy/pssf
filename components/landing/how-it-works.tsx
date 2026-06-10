"use client"

import { cn } from "@/lib/utils"
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
    highlighted: false,
  },
  {
    num: 2,
    icon: FileText,
    iconColor: "#2563EB",
    iconBg: "#EFF6FF",
    label: "Complete",
    description: "Fill in the required information",
    highlighted: false,
  },
  {
    num: 3,
    icon: Upload,
    iconColor: "#EA580C",
    iconBg: "#FFF7ED",
    label: "Upload",
    description: "Upload supporting documents",
    highlighted: true,
  },
  {
    num: 4,
    icon: User,
    iconColor: "#7C3AED",
    iconBg: "#F5F3FF",
    label: "Review",
    description: "We review your submission",
    highlighted: false,
  },
  {
    num: 5,
    icon: CheckSquare,
    iconColor: "#0D9488",
    iconBg: "#F0FDFA",
    label: "Approval",
    description: "Employer/PSSF review and approve",
    highlighted: false,
  },
  {
    num: 6,
    icon: Flag,
    iconColor: "#0D2137",
    iconBg: "#F1F5F9",
    label: "Track",
    description: "Track your request to completion",
    highlighted: false,
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
          <p className="text-xs font-bold uppercase tracking-wider text-[#1A7A4A]">
            Simple process
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2137]">
            Our working process
          </h2>
          <p className="mt-3 text-base text-gray-500 max-w-sm mx-auto">
            One simple, automated process for all our services
          </p>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="relative hidden lg:block px-4">
          <ol className="relative grid grid-cols-6 gap-4 z-10">
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <li key={step.num} className="relative group flex flex-col items-center">
                  {/* Dashed connector line between icon circles */}
                  {step.num < 6 && (
                    <div 
                      className="absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 -translate-y-1/2 pointer-events-none z-0"
                      aria-hidden
                    >
                      <div className="w-full h-full border-t-2 border-dashed border-gray-300" />
                    </div>
                  )}

                  {/* Icon Circle */}
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "flex size-14 items-center justify-center rounded-full shadow-md border transition-all duration-300 group-hover:scale-110",
                        step.highlighted 
                          ? "bg-[#1A7A4A] border-transparent text-white" 
                          : "bg-white border-gray-200 text-[#0D2137]"
                      )}
                    >
                      <Icon className="size-6 transition-transform duration-300 group-hover:rotate-6" style={!step.highlighted ? { color: step.iconColor } : undefined} aria-hidden />
                    </div>
                    <span
                      className={cn(
                        "absolute -right-1.5 -top-1.5 flex size-5.5 items-center justify-center rounded-full text-[10px] font-black shadow-sm border border-white",
                        step.highlighted 
                          ? "bg-[#0D2137] text-white" 
                          : "bg-gray-800 text-white"
                      )}
                      style={!step.highlighted ? { backgroundColor: step.iconColor } : undefined}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Step details card */}
                  <div
                    className={cn(
                      "mt-6 p-5 rounded-2xl text-center border shadow-premium transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg w-full flex-1 min-h-[140px] flex flex-col justify-center",
                      step.highlighted
                        ? "bg-[#0D2137] border-transparent text-white"
                        : "bg-white border-gray-150 text-[#0D2137]"
                    )}
                  >
                    <p className={cn("text-sm font-extrabold", step.highlighted ? "text-[#5BD99A]" : "text-[#0D2137]")}>
                      {step.label}
                    </p>
                    <p className={cn("mt-2 text-xs leading-relaxed", step.highlighted ? "text-gray-300" : "text-gray-500")}>
                      {step.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Mobile / tablet vertical list */}
        <ol className="lg:hidden relative mx-auto max-w-sm space-y-6 pl-4">
          <div
            aria-hidden
            className="absolute left-[27px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#16A34A] via-[#7C3AED] to-[#0D2137] opacity-40 rounded-full"
          />
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li key={step.num} className="group relative flex items-start gap-5 py-1">
                <div
                  className={cn(
                    "relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full shadow-sm border transition-all duration-300",
                    step.highlighted 
                      ? "bg-[#1A7A4A] border-transparent text-white" 
                      : "bg-white border-gray-200/50"
                  )}
                >
                  <Icon className="size-5" style={!step.highlighted ? { color: step.iconColor } : undefined} aria-hidden />
                </div>
                <div
                  className={cn(
                    "flex-1 p-4 rounded-xl border shadow-sm",
                    step.highlighted 
                      ? "bg-[#0D2137] border-transparent text-white" 
                      : "bg-white border-gray-100"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold text-white mb-1 shadow-sm"
                    )}
                    style={!step.highlighted ? { backgroundColor: step.iconColor } : { backgroundColor: "#1A7A4A" }}
                  >
                    Step {step.num}
                  </span>
                  <p className={cn("text-sm font-extrabold", step.highlighted ? "text-[#5BD99A]" : "text-[#0D2137]")}>
                    {step.label}
                  </p>
                  <p className={cn("text-xs mt-1 leading-normal", step.highlighted ? "text-gray-300" : "text-gray-500")}>
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
