import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The capabilities, usage limits, and responsibilities for using Dots.",
  alternates: { canonical: "/terms" },
}

const sections = [
  {
    title: "What Dots provides",
    paragraphs: [
      "Dots is an on-demand AI assistant for questions, planning, writing, and organizing ideas. You submit a request in a conversation thread and can return to that thread to see the response and task status.",
      "This version does not browse the web, read your files, access other accounts, send reminders or notifications, or complete actions outside the chat. A 24/7 description means you can submit requests at any hour when the service is available; it is not a promise of uninterrupted uptime.",
    ],
  },
  {
    title: "Responses and decisions",
    paragraphs: [
      "AI-generated responses can be mistaken, incomplete, or out of date. Review and verify important information before acting on it, especially for decisions with health, legal, financial, or safety consequences.",
      "You decide what to do with a suggestion. Dots does not make reservations, send messages, buy products, or take other outside actions on your behalf.",
    ],
  },
  {
    title: "Current usage limits",
    paragraphs: [
      "Dots currently accepts up to 20 new requests per browser session per UTC day and up to 200 new requests across the site per UTC day. A request can be declined when either daily limit is reached. Task processing also depends on service and model availability.",
      "If a task fails, its status appears in the thread. You can revise the request and try again within the available limits.",
    ],
  },
  {
    title: "Your requests and history",
    paragraphs: [
      "Only submit material you have the right to share. Avoid sending sensitive information you do not need for the response. Dots stores conversation and task records and sends relevant text to an AI model provider to generate replies, as described in the Privacy Policy.",
      "A signed browser cookie links you to this version's history. There is no sign-in or account recovery. You can delete one conversation or remove all app records linked to your current browser session in Settings.",
    ],
  },
]

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute left-[-15%] top-[-20%] h-[65vw] w-[65vw] rounded-full bg-blue-700/20 blur-[130px]" />
      <div className="pointer-events-none absolute right-[-20%] top-[15%] h-[60vw] w-[60vw] rounded-full bg-purple-700/15 blur-[150px]" />

      <div className="relative mx-auto max-w-4xl px-6 py-10 md:py-16">
        <nav className="mb-20 flex items-center justify-between" aria-label="Page navigation">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Dots<span className="text-blue-400">.</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
          </Link>
        </nav>

        <div className="mb-12 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-blue-300">Using Dots</p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gradient md:text-7xl">Terms of Use</h1>
          <p className="text-lg leading-relaxed text-white/65">
            What the current version can do, how requests are handled, and what to check before relying on an AI response.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => (
            <GlassCard key={section.title} hoverEffect={false} className="p-7 md:p-9">
              <h2 className="mb-4 text-2xl font-semibold">{section.title}</h2>
              <div className="space-y-4 text-white/65 leading-relaxed">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-white/10 pt-8 text-sm text-white/55">
          <Link href="/privacy" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            Privacy Policy <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/app" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            Open Dots <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  )
}
