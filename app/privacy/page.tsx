import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Dots handles browser sessions, conversations, AI model processing, and deletion.",
  alternates: { canonical: "/privacy" },
}

const sections = [
  {
    title: "Your browser session",
    paragraphs: [
      "Dots currently works without sign-in. A signed cookie in your browser connects you to your conversations and tasks. Anyone using the same browser profile may be able to open that history.",
      "There is no account recovery or cross-device sync. If you clear the cookie or switch browsers, you may lose access to earlier conversations even if their records remain in the app database. Use the in-app deletion controls before clearing the cookie if you want to remove those records.",
    ],
  },
  {
    title: "What Dots stores",
    paragraphs: [
      "Dots stores the conversations you create, the messages you send and receive, and task records such as status and errors in its app database. This lets you return to a thread and see its result.",
      "Dots does not need your name or email address for this browser-session version. Avoid including sensitive information in a request unless it is necessary for the response you want.",
    ],
  },
  {
    title: "AI model processing",
    paragraphs: [
      "To answer a request, Dots sends relevant conversation text through OpenRouter to an AI model provider. The model may process that text to generate a reply. Dots has no live web search, email, calendar, or external app access in this version.",
      "Generated replies can be inaccurate or incomplete. Verify important details before relying on them.",
    ],
  },
  {
    title: "Deletion and control",
    paragraphs: [
      "You can delete an individual conversation and its task records, or use Settings to remove all conversations and task records linked to your current browser session from the Dots app database.",
      "Deleting app records does not undo text already sent to an AI model provider for processing. If you have lost your browser session, Dots currently has no sign-in-based way to reconnect you to those records.",
    ],
  },
]

export default function PrivacyPage() {
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
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-blue-300">Privacy at Dots</p>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gradient md:text-7xl">Privacy Policy</h1>
          <p className="text-lg leading-relaxed text-white/65">
            A clear description of how this browser-based version of Dots handles your requests and conversation history.
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
          <Link href="/terms" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            Terms of Use <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/app/settings" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            Manage your data <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  )
}
