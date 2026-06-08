import Link from "next/link"
import { ClipboardList, Lock, Scale, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const ITEMS = [
  {
    icon: Shield,
    title: "Your data is protected",
    description:
      "We use advanced encryption and security practices to keep your data safe.",
  },
  {
    icon: Scale,
    title: "100% Statutory Compliant",
    description:
      "Our processes comply with Public Service Superannuation Fund regulations.",
  },
  {
    icon: ClipboardList,
    title: "Full Audit Trail",
    description:
      "Every action is logged for transparency and accountability.",
  },
  {
    icon: Lock,
    title: "Secure Document Storage",
    description:
      "Your documents are stored securely and accessible only to authorized users.",
  },
]

export function TrustStrip() {
  return (
    <section id="about" className="relative bg-[#F9FAFB] py-20 lg:py-24 overflow-hidden border-b border-gray-200/40">
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,white_70%,transparent_100%)] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1A7A4A]">
            Why PSSF
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#0D2137]">
            Built on trust and security
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-gray-200/50 bg-white/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:bg-white hover:border-gray-200"
            >
              <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8F5EE] to-[#EFF6FF] shadow-inner transition-transform duration-300 group-hover:scale-105">
                <Icon className="size-5.5 text-[#1A7A4A]" aria-hidden />
              </span>
              <h3 className="mb-2 text-base font-bold text-[#0D2137]">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-550">
                {description}
              </p>
            </div>
          ))}
        </div>

        {/* Closing CTA */}
        <div className="relative mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D2137] via-[#12304b] to-[#1A7A4A] px-6 py-14 sm:px-12 text-center shadow-2xl border border-white/5">
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
                className="bg-white text-[#0D2137] hover:bg-gray-50 h-12 px-8 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl font-semibold duration-200"
              >
                <Link href="/sign-up">Activate your account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 h-12 px-8 hover:-translate-y-0.5 active:translate-y-0 transition-all rounded-xl font-semibold duration-200"
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
