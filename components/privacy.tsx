"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { Eye, LockKeyhole, Trash2 } from "lucide-react"

const principles = [
  {
    icon: <Eye className="w-7 h-7 text-blue-400" />,
    title: "You control what you share",
    description:
      "Send only the details you want the AI to use. Your message history is sent to a model provider to generate a reply.",
  },
  {
    icon: <LockKeyhole className="w-7 h-7 text-purple-400" />,
    title: "A browser session, not an account",
    description:
      "A signed browser cookie links your conversations to this browser. There is no sign-in or cross-device sync in this version.",
  },
  {
    icon: <Trash2 className="w-7 h-7 text-indigo-400" />,
    title: "Delete anytime",
    description:
      "Delete one conversation, or use Settings to remove all conversations and task records linked to your browser session.",
  },
]

export function Privacy() {
  return (
    <section id="privacy" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Privacy and control
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            See what is stored, how AI responses are generated, and how to remove your history.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit">{principle.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{principle.title}</h3>
                <p className="text-white/60 leading-relaxed">{principle.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
