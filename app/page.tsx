import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Capabilities } from "@/components/capabilities"
import { HowItWorks } from "@/components/how-it-works"
import { Privacy } from "@/components/privacy"
import { FAQ } from "@/components/faq"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <Navbar />
      <Hero />
      <Capabilities />
      <HowItWorks />
      <Privacy />
      <FAQ />

      {/* Call to Action Section */}
      <section id="contact" className="py-32 relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            Something on your plate? <br />
            <span className="text-gradient">Hand it to Dots.</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Submit a request whenever it suits you. Dots turns it into a task, works through it, and brings back a
            result you can act on.
          </p>
          <Link
            href="/app"
            className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Open Dots <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Background Gradient for CTA */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />
      </section>

      <Footer />
    </main>
  )
}
