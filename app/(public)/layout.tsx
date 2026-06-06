import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PSSF Smart Self-Service Platform",
  description:
    "Public Service Superannuation Fund — secure, simple and faster pension self-service online.",
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-[Inter,system-ui,-apple-system,sans-serif]">
      {children}
    </div>
  )
}
