import Link from "next/link"

export function Footer() {
  return (
    <footer className="relative pt-32 pb-12 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <Link href="/" className="text-2xl font-bold tracking-tighter mb-6 block">
              Dots<span className="text-blue-400">.</span>
            </Link>
            <p className="text-white/50 leading-relaxed">
              Your 24/7 on-demand personal assistant for questions, plans, and tasks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Explore</h4>
            <ul className="space-y-4 text-white/60">
              <li>
                <Link href="#capabilities" className="hover:text-white transition-colors">
                  Capabilities
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Your space</h4>
            <ul className="space-y-4 text-white/60">
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Open Dots
                </Link>
              </li>
              <li>
                <Link href="/app/settings" className="hover:text-white transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6">Good to know</h4>
            <p className="text-white/60 leading-relaxed">
              Dots answers on demand in your browser. It does not browse the web, send reminders, or act in other apps.
            </p>
            <p className="mt-4 text-sm text-white/40">Current capacity: 20 requests per session and 200 site-wide each UTC day.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-white/40">
          <p>&copy; 2026 Dots. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
