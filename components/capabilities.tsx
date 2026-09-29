"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { ListChecks, MessageCircleQuestion, Route, TrendingUp } from "lucide-react"

const capabilities = [
  {
    icon: <MessageCircleQuestion className="w-8 h-8 text-blue-400" />,
    title: "Ask",
    description:
      "Explore a question, get an explanation, or compare options using the details you provide. Dots will say when it is uncertain.",
  },
  {
    icon: <Route className="w-8 h-8 text-purple-400" />,
    title: "Plan",
    description:
      "Describe a goal and its constraints. Dots can draft an itinerary, project outline, or decision framework you can refine.",
  },
  {
    icon: <ListChecks className="w-8 h-8 text-indigo-400" />,
    title: "Organize",
    description:
      "Turn rough notes into a checklist or next-step plan. Keep the conversation and its task history together in one thread.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-pink-400" />,
    title: "Track progress",
    description:
      "See whether a response is queued, running, completed, or failed. Open the thread to read the result when it is ready.",
  },
]

export function Capabilities() {
  return (
    <section id="capabilities" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-20 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            What Dots can do
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            A place to ask, plan, and organize whenever you need a fresh perspective.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col justify-between group">
                <div>
                  <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-white/10 transition-colors">
                    {capability.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{capability.title}</h3>
                  <p className="text-white/60 leading-relaxed">{capability.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
