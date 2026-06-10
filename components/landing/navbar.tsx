"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X, Lock, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PssfLogo } from "@/components/pssf-logo"

export function PssfLogoMark({
  className,
  variant = "color",
}: {
  className?: string
  variant?: "color" | "white"
}) {
  const green = variant === "white" ? "#FFFFFF" : "#1A7A4A"
  const navy = variant === "white" ? "#FFFFFF" : "#0D2137"

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-10 shrink-0", className)}
      aria-hidden
    >
      <circle
        cx="20"
        cy="20"
        r="20"
        fill={variant === "white" ? "rgba(255,255,255,0.12)" : "#E8F5EE"}
      />
      <path
        d="M20 8C14 8 10 13 10 18.5C10 22 12 25 15 26.5V30H25V26.5C28 25 30 22 30 18.5C30 13 26 8 20 8Z"
        fill={green}
      />
      <circle cx="16" cy="17" r="2" fill={navy} />
      <circle cx="24" cy="17" r="2" fill={navy} />
      <path
        d="M14 22C15.5 24 17.5 25 20 25C22.5 25 24.5 24 26 22"
        stroke={navy}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 8V6M12 10L10.5 8.5M28 10L29.5 8.5"
        stroke={green}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const SERVICE_LINKS = [
  { label: "Member Enrolment", href: "/member/enrolment" },
  { label: "Beneficiary Nomination", href: "/member/beneficiaries" },
  { label: "AVC Contributions", href: "/member/avc" },
  { label: "Benefits Claim", href: "/member/claims/benefits" },
  { label: "Death Benefits Claim", href: "/member/claims/death" },
  { label: "Contribution Statement", href: "/member/statements" },
  { label: "Missing Contribution", href: "/member/statements/missing" },
]

const RESOURCE_LINKS = [
  { label: "Guides & FAQs", href: "#" },
  { label: "Forms & Documents", href: "#" },
  { label: "Video Tutorials", href: "#" },
  { label: "News & Updates", href: "#" },
  { label: "Contact Us", href: "#" },
]

const NAV_LINK =
  "relative text-sm font-medium text-[#0D2137]/80 hover:text-[#1A7A4A] transition-colors py-1.5 px-0.5 after:absolute after:-bottom-[20px] after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-gradient-to-r after:from-[#1A7A4A] after:to-[#0D9488] after:transition-transform hover:after:scale-x-100"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/40 shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 transition-transform hover:scale-102" aria-label="PSSF home">
          <PssfLogo priority width={78} height={44} />
        </Link>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Main">
          <Link href="/" className={cn(NAV_LINK, "text-[#1A7A4A] after:scale-x-100 font-semibold")}>
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(NAV_LINK, "inline-flex items-center gap-1 outline-none cursor-pointer")}>
              Services <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56 rounded-xl border border-gray-200/60 bg-white/95 backdrop-blur-md shadow-lg p-1 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              {SERVICE_LINKS.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="rounded-lg hover:bg-gray-50 focus:bg-gray-50 cursor-pointer">
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="#how-it-works" className={NAV_LINK}>
            How It Works
          </a>
          <a href="#about" className={NAV_LINK}>
            About PSSF
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(NAV_LINK, "inline-flex items-center gap-1 outline-none cursor-pointer")}>
              Resources <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52 rounded-xl border border-gray-200/60 bg-white/95 backdrop-blur-md shadow-lg p-1 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              {RESOURCE_LINKS.map((item) => (
                <DropdownMenuItem key={item.label} asChild className="rounded-lg hover:bg-gray-50 focus:bg-gray-50 cursor-pointer">
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="#support" className={NAV_LINK}>
            Support
          </a>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a href="tel:+254201234567" className="hidden xl:flex items-center gap-2 text-xs font-bold text-[#0D2137] hover:text-[#1A7A4A] transition-colors mr-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#E8F5EE] text-[#1A7A4A]">
              <Phone className="size-3.5" />
            </span>
            +254 20 123 4567
          </a>
          <div className="flex items-center gap-3 mr-2">
            <a href="#" className="text-gray-400 hover:text-[#1A7A4A] transition-colors" aria-label="Facebook">
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#1A7A4A] transition-colors" aria-label="Twitter / X">
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#1A7A4A] transition-colors" aria-label="LinkedIn">
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
          <Button asChild className="bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full px-5 h-10 flex items-center gap-2 text-xs font-bold transition-all shadow-sm hover:shadow-md">
            <Link href="/login">
              <Lock className="size-3.5 text-[#5BD99A]" />
              Access Portal
            </Link>
          </Button>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="rounded-xl"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200/40 bg-white/95 backdrop-blur-md px-4 py-6 space-y-4 shadow-xl animate-in fade-in-50 slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            <Link href="/" className={NAV_LINK} onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-2">
              Services
            </p>
            {SERVICE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(NAV_LINK, "pl-2 py-1")}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a href="#how-it-works" className={NAV_LINK} onClick={() => setMobileOpen(false)}>
              How It Works
            </a>
            <a href="#about" className={NAV_LINK} onClick={() => setMobileOpen(false)}>
              About PSSF
            </a>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mt-2">
              Resources
            </p>
            {RESOURCE_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(NAV_LINK, "pl-2 py-1")}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a href="#support" className={NAV_LINK} onClick={() => setMobileOpen(false)}>
              Support
            </a>
          </nav>
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
            <Button variant="outline" asChild className="border-gray-250 text-[#0D2137] w-full rounded-xl">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

