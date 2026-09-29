"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { GlassCard } from "@/components/ui/glass-card"

const faqs = [
  {
    question: "What is Dots?",
    answer:
      "Dots is an on-demand AI personal assistant for questions, planning, writing, and organizing ideas. Send a message, follow the task status, and read the response in your conversation thread.",
  },
  {
    question: "What does 24/7 mean for Dots?",
    answer:
      "You can open Dots and submit a request at any hour while the service is available. Dots works when you ask it to; it does not proactively check in or monitor your life in the background.",
  },
  {
    question: "Can Dots browse the web or verify current facts?",
    answer:
      "No. This version has no live web search or outside tools. It answers from the conversation and its AI model, which can be mistaken or out of date. Check important facts independently.",
  },
  {
    question: "Will Dots send reminders or notifications?",
    answer:
      "No. Dots replies only to requests you submit. It cannot schedule reminders, send notifications, or take actions in other apps. Return to your thread to see a result.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. A signed browser cookie connects you to your conversations on this browser. There is no sign-in or cross-device sync. If you clear that cookie, you may lose access to earlier conversations.",
  },
  {
    question: "How quickly will Dots respond?",
    answer:
      "Response time varies with queue and model availability. A task shows queued, running, completed, or failed in its thread. If it fails, you can adjust your request and try again.",
  },
  {
    question: "Are there daily limits?",
    answer:
      "Dots currently accepts up to 20 new requests per browser session per UTC day, with a site-wide capacity of 200 new requests per UTC day. If either limit is reached, try again after midnight UTC.",
  },
  {
    question: "How does Dots handle my conversations?",
    answer:
      "Dots stores conversations and task records in its app database. It sends relevant conversation text to an AI model provider to generate replies. You can delete one thread or remove all app data in Settings.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Frequently asked
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            What Dots can do today, how your conversations work, and where the limits are.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlassCard hoverEffect={false} className="max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`item-${index}`}
                  className="border-white/10 last:border-b-0"
                >
                  <AccordionTrigger className="text-left text-lg font-medium hover:no-underline text-white/90">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/60 leading-relaxed text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
