import { Lock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface LockedFieldProps {
  label: string
  value: string | null | undefined
  hint?: string
}

export function LockedField({ label, value, hint }: LockedFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-[13px] font-medium text-gray-700">{label}</Label>
      <div className="relative">
        <Input
          readOnly
          value={value ?? "—"}
          className="bg-gray-50 text-gray-600 cursor-not-allowed pr-10 border-gray-200"
          tabIndex={-1}
        />
        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
