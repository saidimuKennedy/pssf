"use client"

import { Fragment, useEffect, useRef } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  skippedSteps?: number[]
}

export function StepIndicator({ steps, currentStep, skippedSteps = [] }: StepIndicatorProps) {
  const dense = steps.length > 7
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    stepRefs.current[currentStep - 1]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    })
  }, [currentStep])

  return (
    <div
      className="w-full overflow-x-auto pb-2 scroll-smooth"
      aria-label={`Step ${currentStep} of ${steps.length}`}
    >
      <div className="inline-flex items-center min-w-full justify-center sm:justify-start">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const isSkipped = skippedSteps.includes(stepNumber)
          const isCompleted = !isSkipped && stepNumber < currentStep
          const isActive = stepNumber === currentStep
          const isUpcoming = !isSkipped && stepNumber > currentStep
          const connectorComplete = !isSkipped && stepNumber < currentStep

          return (
            <Fragment key={`${stepNumber}-${label}`}>
              <div
                ref={(el) => {
                  stepRefs.current[index] = el
                }}
                className={cn(
                  "flex flex-col items-center shrink-0",
                  dense ? "w-[3.75rem] sm:w-16" : "w-[4.5rem]"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center font-semibold border-2 shrink-0",
                    dense ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm",
                    isSkipped && "bg-gray-100 border-gray-200 text-gray-300",
                    isCompleted && "bg-[#1A7A4A] border-[#1A7A4A] text-white",
                    isActive && "bg-[#0D2137] border-[#0D2137] text-white",
                    isUpcoming && "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className={dense ? "w-3 h-3" : "w-4 h-4"} />
                  ) : isSkipped ? (
                    "—"
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 text-center leading-tight w-full px-0.5",
                    dense ? "text-[10px] sm:text-xs" : "text-xs",
                    isSkipped && "text-gray-300 line-through",
                    isCompleted && "text-[#1A7A4A]",
                    isActive && "text-[#0D2137] font-medium",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "shrink-0 h-0.5 self-start",
                    dense ? "w-2 sm:w-3 mx-0.5 mt-3.5" : "w-4 mx-1 mt-4",
                    isSkipped
                      ? "bg-gray-100"
                      : connectorComplete
                        ? "bg-[#1A7A4A]"
                        : "bg-gray-200"
                  )}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
