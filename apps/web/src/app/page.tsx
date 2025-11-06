import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { AITechnology } from "@/components/landing/ai-technology"
import { Features } from "@/components/landing/features"
import { GlobalReach } from "@/components/landing/global-reach"
import { Testimonials } from "@/components/landing/testimonials"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        <Hero />
        <Features />
        <HowItWorks />
        <AITechnology />
        <GlobalReach />
        <Testimonials />
        <CTASection />
        <Footer />
      </main>
    </>
  )
}
