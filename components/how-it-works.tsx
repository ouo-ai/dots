"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { CheckCircle2, PenLine, SendHorizontal } from "lucide-react"

const steps = [
  {
    icon: <SendHorizontal className="w-7 h-7 text-blue-400" />,
    step: "01",
    title: "Send a request",
    description:
      "Open Dots in your browser and describe what you need. You can submit a request at any hour without booking a time slot.",
  },
  {
    icon: <PenLine className="w-7 h-7 text-purple-400" />,
    step: "02",
    title: "Follow the response",
    description:
      "Dots saves your message in a conversation thread and queues an AI response. The task status shows where it is in the process.",
  },
  {
    icon: <CheckCircle2 className="w-7 h-7 text-indigo-400" />,
    step: "03",
    title: "Read and refine",
    description:
      "Return to the same thread to read the answer. Ask a follow-up, add context, or start a new conversation when your goal changes.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-20 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            How Dots works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            One conversation, from your first question to your next step.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard className="h-full">
                <span className="text-sm font-medium text-white/30 tracking-widest">{item.step}</span>
                <div className="mt-4 mb-6 p-4 rounded-2xl bg-white/5 w-fit">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
