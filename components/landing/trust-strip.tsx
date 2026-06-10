"use client"

import Link from "next/link"
import { ClipboardList, Lock, Scale, Shield, Star, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const ITEMS = [
  {
    icon: Shield,
    title: "Your data is protected",
    description:
      "We use advanced bank-grade encryption and security practices to keep your details safe.",
  },
  {
    icon: Scale,
    title: "100% Statutory Compliant",
    description:
      "All automated operations fully comply with the Public Service Superannuation Fund Act.",
  },
  {
    icon: ClipboardList,
    title: "Full Audit Trail",
    description:
      "Every workflow transition, document submission, and review is logged for transparency.",
  },
  {
    icon: Lock,
    title: "Secure Document Storage",
    description:
      "Uploaded documents are encrypted in transit and at rest, accessible only to authorized staff.",
  },
]

export function TrustStrip() {
  return (
    <section id="about" className="relative bg-white py-20 lg:py-24 overflow-hidden border-b border-gray-200/30">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_70%,transparent_100%)] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* About PSSF Section — Two-Column Split (Mockup Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          
          {/* Left Column — Visual Dashboard Mockup & CTA */}
          <div className="relative group">
            <div aria-hidden className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-[#1A7A4A]/10 to-[#0D2137]/10 blur-xl" />
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-[#F9FAFB] p-8 shadow-premium-green transition-transform duration-300 hover:scale-[1.01]">
              <div className="flex items-center justify-between border-b border-gray-200/60 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-[#E8F5EE] text-[#1A7A4A]">
                    <Shield className="size-4" />
                  </span>
                  <p className="text-xs font-bold text-[#0D2137]">Security Officer Center</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                  Active Shield
                </span>
              </div>

              {/* Mock system alerts */}
              <div className="space-y-3.5">
                {[
                  { text: "Identity Verified", status: "success", time: "Just now" },
                  { text: "Statutory Regulations Checked", status: "success", time: "2 min ago" },
                  { text: "End-to-End Encryption Enabled", status: "secure", time: "Live" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-white border border-gray-200/50 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-5 items-center justify-center rounded-full bg-[#E8F5EE] text-[#1A7A4A]">
                        <CheckCircle className="size-3.5" />
                      </span>
                      <p className="text-xs font-bold text-[#0D2137]">{item.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-2">
                <Button asChild className="bg-[#0D2137] hover:bg-[#12304b] text-white rounded-full w-full py-5 text-xs font-bold cursor-pointer transition-all">
                  <Link href="/login">Learn More About PSSF</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column — About Details & Checklists */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#1A7A4A]">
                About PSSF
              </p>
              <h2 className="mt-2.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2137]">
                Built on absolute trust and compliance
              </h2>
              <p className="mt-3.5 text-sm leading-relaxed text-gray-500">
                PSSF operates under strict legislative guidelines, delivering a modern self-service platform designed to empower public officers with secure pension management.
              </p>
            </div>

            {/* Vertical list of key features (Mockup Style) */}
            <div className="space-y-5 pt-2">
              {ITEMS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-[#E8F5EE] text-[#1A7A4A] shrink-0 mt-0.5">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D2137]">{title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Grayscale Partners Strip (Mockup Style) */}
        <div className="border-y border-gray-150 py-10 mb-24">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-6">
            Our Statutory & Administrative Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-y-6 gap-x-12 md:gap-x-16 opacity-60">
            {[
              { n: "THE NATIONAL TREASURY", sub: "REPUBLIC OF KENYA" },
              { n: "RBA KENYA", sub: "RETIREMENT BENEFITS AUTHORITY" },
              { n: "PSC SERVICES", sub: "PUBLIC SERVICE COMMISSION" },
              { n: "GOVERNMENT OF KENYA", sub: "OFFICIAL PORTAL" }
            ].map((p, idx) => (
              <div key={idx} className="text-center font-serif text-xs font-black tracking-widest text-[#0D2137] select-none hover:text-[#1A7A4A] transition-colors cursor-default">
                <p className="text-sm font-extrabold leading-none">{p.n}</p>
                <p className="text-[8px] font-sans font-bold tracking-normal text-gray-500 mt-1">{p.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial Section — 'Nothing Secures You Better' (Mockup Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 items-center mb-24">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D2137] leading-tight">
              Nothing secures your future better than us
            </h3>
            <p className="mt-3.5 text-xs text-gray-500 leading-relaxed max-w-sm">
              Read how public service officers are streamlining their pensions and exit benefit applications using the PSSF Smart Portal.
            </p>
          </div>
          
          {/* Testimonial card */}
          <div className="relative rounded-2xl border border-gray-200/50 bg-[#F9FAFB]/70 p-7 shadow-premium">
            <div className="flex items-center gap-1 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <p className="text-sm italic leading-relaxed text-gray-600 font-medium mb-5">
              "The transition to the digital PSSF self-service portal has made it incredibly straightforward to update my family beneficiary allocations and track my AVC statement. The entire process was secure and completely paperless."
            </p>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[#1A7A4A] text-xs font-bold text-white">
                JK
              </div>
              <div>
                <p className="text-xs font-bold text-[#0D2137]">John K.</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Retired Education Officer</p>
              </div>
            </div>
            {/* Quote decoration */}
            <span className="absolute bottom-5 right-7 text-6xl font-serif text-gray-200 select-none pointer-events-none" aria-hidden>
              ”
            </span>
          </div>
        </div>

        {/* Closing CTA — Full-Width Gradient Banner (Mockup Style) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2137] via-[#12304b] to-[#1A7A4A] px-6 py-14 sm:px-12 text-center shadow-2xl border border-white/5">
          <div aria-hidden className="absolute -top-24 -left-24 size-80 rounded-full bg-white/5 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -right-24 size-80 rounded-full bg-[#1A7A4A]/40 blur-3xl animate-pulse-slow" />
          
          <div className="relative max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to manage your pension online?
            </h3>
            <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
              Join thousands of public servants using the PSSF Smart Self-Service Platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#0D2137] hover:bg-gray-50 h-12 px-8 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-full font-bold duration-200 cursor-pointer"
              >
                <Link href="/sign-up">Activate your account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 h-12 px-8 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-full font-bold duration-200 cursor-pointer"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
