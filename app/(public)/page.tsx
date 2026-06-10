import { Navbar } from "@/components/landing/navbar"
import { ServicesGrid } from "@/components/landing/services-grid"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pb-20">
        <ServicesGrid />
      </main>
      <Footer />
    </>
  )
}
