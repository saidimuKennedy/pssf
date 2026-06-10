"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PssfLogo } from "@/components/pssf-logo"
import { Mail, Phone, MapPin } from "lucide-react"

const SERVICE_LINKS = [
  { label: "Member Enrolment", href: "/member/enrolment" },
  { label: "Beneficiary Nomination", href: "/member/beneficiaries" },
  { label: "AVC Contributions", href: "/member/avc" },
  { label: "Benefits Claim", href: "/member/claims/benefits" },
  { label: "Death Benefits Claim", href: "/member/claims/death" },
  { label: "All Services", href: "#services" },
]

const RESOURCE_LINKS = [
  { label: "Guides & FAQs", href: "#" },
  { label: "Forms & Documents", href: "#" },
  { label: "Video Tutorials", href: "#" },
  { label: "News & Updates", href: "#" },
  { label: "Contact Us", href: "#" },
]

const SOCIAL: { label: string; href: string; svg: string }[] = [
  {
    label: "Facebook", href: "#",
    svg: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
  },
  {
    label: "Twitter / X", href: "#",
    svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "LinkedIn", href: "#",
    svg: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "YouTube", href: "#",
    svg: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
]

export function Footer() {
  return (
    <footer id="support" className="bg-[#0D2137] text-white">
      
      {/* Our Newsletters Bar — Full-Width Top Section (Mockup Style) */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 items-center">
            <div>
              <h3 className="text-xl font-bold">Our Newsletters</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                Subscribe for updates on statutory announcements, system enhancements, and important pension resource guides.
              </p>
            </div>
            <form
              className="flex flex-col sm:flex-row gap-3 sm:justify-end"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs h-11 rounded-xl sm:max-w-sm focus-visible:ring-1 focus-visible:ring-[#1A7A4A] focus-visible:border-[#1A7A4A] transition-all"
              />
              <Button
                type="submit"
                className="bg-[#1A7A4A] hover:bg-[#1A7A4A]/90 text-white shrink-0 h-11 text-xs font-bold px-6 rounded-xl cursor-pointer transition-all active:scale-98"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo column */}
          <div className="lg:col-span-1 space-y-4">
            <PssfLogo variant="onDark" width={140} height={80} />
            <p className="text-xs text-gray-400 font-bold tracking-wide">Smart Self-Service Platform</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Empowering public servants with secure, efficient and transparent pension services under the PSSF Act.
            </p>
            {/* Social Icons (Mockup Style) */}
            <div className="flex gap-3 pt-2">
              {SOCIAL.map(({ svg, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={svg} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5BD99A] mb-5">Services</h4>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-300 hover:text-[#5BD99A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5BD99A] mb-5">Resources</h4>
            <ul className="space-y-3">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-300 hover:text-[#5BD99A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5BD99A] mb-5">Support</h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li>
                <Link href="#" className="hover:text-[#5BD99A] transition-colors">
                  Help Centre & FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#5BD99A] transition-colors">
                  Live Chat Support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#5BD99A] transition-colors">
                  Statutory Guides
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#5BD99A] transition-colors">
                  Download Forms
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts Column */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#5BD99A] mb-5">Contact Us</h4>
            <ul className="space-y-3.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <Mail className="size-4 text-[#5BD99A] shrink-0 mt-0.5" />
                <a href="mailto:support@pssf.go.ke" className="hover:text-white transition-colors">
                  support@pssf.go.ke
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="size-4 text-[#5BD99A] shrink-0 mt-0.5" />
                <span>+254 20 123 4567</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-[#5BD99A] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Bima House, Harambee Ave<br />
                  P.O. Box 30007-00100<br />
                  Nairobi, Kenya
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#0B1C2F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-gray-400">
          <p>© 2026 Public Service Superannuation Fund (PSSF). All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
            <span aria-hidden>·</span>
            <Link href="#" className="hover:text-white transition-colors">
              Accessibility
            </Link>
            <span aria-hidden>·</span>
            <Link href="/login/admin" className="hover:text-white transition-colors font-bold text-[#5BD99A]">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
