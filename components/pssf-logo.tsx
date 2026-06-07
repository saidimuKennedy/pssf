import Image from "next/image"
import { cn } from "@/lib/utils"

// Both assets are transparent and share a ~1.75:1 ratio, so the same
// width/height defaults work for either variant.
//   default — dark-text logo, for light backgrounds
//   onDark  — clear-bg embossed logo, for dark backgrounds (footer, sidebar)
const LOGO_SRC = {
  default: "/pssf-logo.png",
  onDark: "/pssf-logo-ondark.png",
} as const

export function PssfLogo({
  width = 150,
  height = 85,
  priority = false,
  variant = "default",
  className,
}: {
  width?: number
  height?: number
  priority?: boolean
  variant?: keyof typeof LOGO_SRC
  className?: string
}) {
  return (
    <Image
      src={LOGO_SRC[variant]}
      alt="PSSF — Public Service Superannuation Fund"
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain", className)}
    />
  )
}
