"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PssfLogo } from "@/components/pssf-logo"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/40 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="PSSF home">
          <PssfLogo priority width={78} height={44} />
        </Link>

        <Button asChild className="bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full px-5 h-10 flex items-center gap-2 text-xs font-bold transition-all shadow-sm">
          <Link href="/login">
            <Lock className="size-3.5 text-[#5BD99A]" />
            Access Portal
          </Link>
        </Button>
      </div>
    </header>
  )
}
