"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  Lock,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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
  "text-sm font-medium text-[#0D2137] hover:text-[#1A7A4A] transition-colors dark:text-white dark:hover:text-[#1A7A4A]"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("pssf-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = stored === "dark" || (!stored && prefersDark)
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("pssf-theme", next ? "dark" : "light")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] dark:bg-gray-900 dark:border-gray-700">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <PssfLogoMark />
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-bold text-[#0D2137] dark:text-white leading-tight">
              Public Service Superannuation Fund
            </p>
            <p className="truncate text-xs text-[#6B7280] dark:text-gray-400">
              Smart Self-Service Platform
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main">
          <Link href="/" className={cn(NAV_LINK, "border-b-2 border-[#1A7A4A] pb-0.5")}>
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className={cn(NAV_LINK, "inline-flex items-center gap-1 outline-none")}>
              Services <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {SERVICE_LINKS.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
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
            <DropdownMenuTrigger className={cn(NAV_LINK, "inline-flex items-center gap-1 outline-none")}>
              Resources <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-52">
              {RESOURCE_LINKS.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="#support" className={NAV_LINK}>
            Support
          </a>
        </nav>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="text-[#0D2137] dark:text-white"
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-[#0D2137] text-[#0D2137] hover:bg-[#0D2137]/5 dark:border-gray-500 dark:text-white"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            className="bg-[#1A7A4A] hover:bg-[#1A7A4A]/90 text-white"
          >
            <Link href="/login">
              <Lock className="size-4" />
              Access Portal
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white dark:bg-gray-900 dark:border-gray-700 px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            <Link href="/" className={NAV_LINK} onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-gray-400">
              Services
            </p>
            {SERVICE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(NAV_LINK, "pl-2")}
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-gray-400">
              Resources
            </p>
            {RESOURCE_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(NAV_LINK, "pl-2")}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a href="#support" className={NAV_LINK} onClick={() => setMobileOpen(false)}>
              Support
            </a>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
            <Button variant="outline" asChild className="border-[#0D2137] text-[#0D2137] w-full">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </Button>
            <Button asChild className="bg-[#1A7A4A] hover:bg-[#1A7A4A]/90 text-white w-full">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Lock className="size-4" />
                Access Portal
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
