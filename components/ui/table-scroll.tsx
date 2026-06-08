import { cn } from "@/lib/utils"

// Wraps a <table> so it scrolls horizontally on narrow screens instead of
// overflowing/clipping columns. Cells are kept on a single line so the table
// keeps a natural width and scrolls cleanly rather than squashing.
export function TableScroll({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-lg border bg-white",
        "[&_th]:whitespace-nowrap [&_td]:whitespace-nowrap",
        className
      )}
    >
      {children}
    </div>
  )
}
