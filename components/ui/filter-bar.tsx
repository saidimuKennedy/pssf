import { cn } from "@/lib/utils"

// Lays out filter/search controls: stacked full-width on mobile, inline-wrapped
// on larger screens. Direct children go full-width on mobile and auto on desktop,
// so inputs/selects/buttons don't crowd each other on a phone.
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        "[&>*]:w-full sm:[&>*]:w-auto",
        className
      )}
    >
      {children}
    </div>
  )
}
