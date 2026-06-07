"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PssfLogo } from "@/components/pssf-logo"

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.062 2.062 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

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

const SOCIAL = [
  { icon: FacebookIcon, label: "Facebook", href: "#" },
  { icon: TwitterIcon, label: "Twitter", href: "#" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "#" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
]

export function Footer() {
  return (
    <footer id="support" className="bg-[#0D2137] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo column */}
          <div className="lg:col-span-1 space-y-3">
            <PssfLogo variant="onDark" width={140} height={80} />
            <p className="text-xs text-gray-400">Smart Self-Service Platform</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Empowering public servants with secure, efficient and transparent pension services.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-300 hover:text-[#1A7A4A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-bold mb-4">Resources</h4>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-300 hover:text-[#1A7A4A] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <Link href="#" className="hover:text-[#1A7A4A] transition-colors">
                  Help Centre
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#1A7A4A] transition-colors">
                  Live Chat
                </Link>
              </li>
              <li>
                <a href="mailto:support@pssf.go.ke" className="hover:text-[#1A7A4A] transition-colors">
                  support@pssf.go.ke
                </a>
              </li>
              <li>+254 20 123 4567</li>
              <li>Mon – Fri: 8:00 AM – 5:00 PM</li>
            </ul>
          </div>

          {/* Stay connected */}
          <div>
            <h4 className="text-sm font-bold mb-4">Stay connected</h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe for updates and important announcements.
            </p>
            <form
              className="flex gap-2 mb-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Your email"
                aria-label="Email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-xs h-9"
              />
              <Button
                type="submit"
                className="bg-[#1A7A4A] hover:bg-[#1A7A4A]/90 text-white shrink-0 h-9 text-xs px-3"
              >
                Subscribe
              </Button>
            </form>
            <div className="flex gap-3">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-gray-400 hover:text-[#1A7A4A] transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-gray-400">
          <p>© 2024 Public Service Superannuation Fund. All rights reserved.</p>
          <div className="flex gap-4">
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
          </div>
        </div>
      </div>
    </footer>
  )
}
