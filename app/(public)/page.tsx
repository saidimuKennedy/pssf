import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { ServicesGrid } from "@/components/landing/services-grid"
import { HowItWorks } from "@/components/landing/how-it-works"
import { RequestTracker } from "@/components/landing/request-tracker"
import { TrustStrip } from "@/components/landing/trust-strip"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServicesGrid />
        <HowItWorks />
        <RequestTracker />
        <TrustStrip />
      </main>
      <Footer />
    </>
  )
}
