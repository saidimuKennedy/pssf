import Link from "next/link"
import { BadgeCheck, Clock, FileText, Lock, Search, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const TRUST_BADGES = [
  { icon: Shield, label: "Secure & Encrypted", sub: "Bank-level security" },
  { icon: BadgeCheck, label: "Statutory Compliant", sub: "100% compliant" },
  { icon: Clock, label: "Always Available", sub: "24/7 Self-service" },
  { icon: FileText, label: "Paperless Process", sub: "Save time & resources" },
]

export function Hero() {
  return (
    <section className="bg-[#F8F9FA] dark:bg-gray-800 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              <span className="text-[#0D2137] dark:text-white">Your pension.</span>
              <br />
              <span className="text-[#1A7A4A]">Your future. Our priority.</span>
            </h1>
            <p className="text-base text-[#6B7280] dark:text-gray-400 max-w-xl leading-relaxed">
              A secure, simple and faster way to manage your pension services online. Submit
              requests, upload documents, track progress and receive real-time updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="bg-[#0D2137] hover:bg-[#0D2137]/90 text-white h-12 px-6"
              >
                <Link href="/login">
                  <Lock className="size-4" />
                  Access Portal
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white border-[#0D2137] text-[#0D2137] hover:bg-[#0D2137]/5 h-12 px-6 dark:bg-gray-900 dark:border-gray-500 dark:text-white"
              >
                <Link href="/track">
                  <Search className="size-4" />
                  Track Existing Request
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col gap-1">
                  <Icon className="size-5 text-[#1A7A4A]" aria-hidden />
                  <p className="text-xs font-bold text-[#0D2137] dark:text-white">{label}</p>
                  <p className="text-[10px] text-[#6B7280] dark:text-gray-400 leading-snug">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — building placeholder */}
          <div
            className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-gray-200 shadow-md dark:bg-gray-700"
            role="img"
            aria-label="PSSF Building"
          >
            <span className="text-sm font-medium text-[#6B7280] dark:text-gray-400">
              PSSF Building
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
