"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Loader2 } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"

/**
 * Static, illustrative preview of a Dots conversation. Not connected to any
 * assistant — clearly labeled as a preview so it can never be mistaken for
 * a live response.
 */
export function ConversationPreview() {
  return (
    <GlassCard hoverEffect={false} className="p-0 overflow-hidden text-left">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
          <span className="text-sm font-medium text-white/80">Plan a team offsite</span>
        </div>
        <Badge variant="outline" className="border-white/15 text-white/50">
          Preview, not live
        </Badge>
      </div>

      <div className="flex flex-col gap-4 px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-500/90 px-4 py-3 text-sm text-white"
        >
          Help me plan a two-day team offsite for 20 people with an €8,000 budget. What should I decide first?
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
        >
          I&apos;d start with dates, location, and travel needs. Then split the budget across space, food,
          activities, and a contingency. I can help draft the agenda next.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/50"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" aria-hidden="true" />
          Task running — drafting a planning outline
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-xs text-emerald-300"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Task completed — planning outline ready in this thread
        </motion.div>
      </div>
    </GlassCard>
  )
}
