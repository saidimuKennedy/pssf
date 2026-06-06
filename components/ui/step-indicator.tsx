"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  skippedSteps?: number[]
}

export function StepIndicator({ steps, currentStep, skippedSteps = [] }: StepIndicatorProps) {
  return (
    <div className="flex items-center w-full overflow-x-auto pb-2">
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isSkipped = skippedSteps.includes(stepNumber)
        const isCompleted = !isSkipped && stepNumber < currentStep
        const isActive = stepNumber === currentStep
        const isUpcoming = !isSkipped && stepNumber > currentStep

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none min-w-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 shrink-0",
                  isSkipped && "bg-gray-100 border-gray-200 text-gray-300",
                  isCompleted && "bg-[#1A7A4A] border-[#1A7A4A] text-white",
                  isActive && "bg-[#0D2137] border-[#0D2137] text-white",
                  isUpcoming && "bg-white border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : isSkipped ? "—" : stepNumber}
              </div>
              <span
                className={cn(
                  "mt-1 text-xs text-center max-w-[72px] leading-tight",
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
                  "flex-1 h-0.5 mx-1 mt-[-16px] min-w-[12px]",
                  isSkipped ? "bg-gray-100" : stepNumber < currentStep ? "bg-[#1A7A4A]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
