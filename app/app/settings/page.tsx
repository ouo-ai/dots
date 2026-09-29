"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { Database, Info, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { GlassCard } from "@/components/ui/glass-card"
import { deleteAllData } from "@/lib/dots/client"

export default function SettingsPage() {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [deleting, setDeleting] = useState(false)

  async function removeAllData() {
    if (!window.confirm("Permanently delete every Dots conversation and task from this browser session?")) return
    setDeleting(true)
    try {
      await deleteAllData()
      await mutate("/api/dots/threads", [])
      toast.success("Your Dots conversations and tasks were deleted.")
      router.push("/app")
      router.refresh()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete your data.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:px-6">
        <SidebarTrigger className="text-white/60 hover:text-white" />
        <h1 className="text-sm font-semibold text-white/90 md:text-base">Settings &amp; privacy</h1>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 md:px-6">
        <GlassCard hoverEffect={false}>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-400/10 p-2.5"><Info className="h-5 w-5 text-blue-300" /></div>
            <h2 className="text-lg font-semibold">Browser session</h2>
          </div>
          <p className="text-sm leading-relaxed text-white/60">
            Your conversations are linked to a private cookie in this browser. There is no sign-in or cross-device sync yet.
            If you clear browser data, you may lose access to your saved conversations.
          </p>
        </GlassCard>

        <GlassCard hoverEffect={false}>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-purple-400/10 p-2.5"><Database className="h-5 w-5 text-purple-300" /></div>
            <h2 className="text-lg font-semibold">Task history</h2>
          </div>
          <p className="text-sm leading-relaxed text-white/60">
            Dots stores your requests, task status, and replies so you can return to them. You can delete one conversation
            from the sidebar or erase all conversations below. Dots responds on demand and does not send reminders.
          </p>
        </GlassCard>

        <GlassCard hoverEffect={false} className="border-red-400/20">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-red-400/10 p-2.5"><Trash2 className="h-5 w-5 text-red-300" /></div>
            <h2 className="text-lg font-semibold">Delete all Dots data</h2>
          </div>
          <p className="mb-5 text-sm leading-relaxed text-white/60">
            Permanently remove all conversations and tasks tied to this browser session. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => void removeAllData()}
            disabled={deleting}
            className="rounded-full border border-red-400/40 px-5 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-400/10 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete all data"}
          </button>
        </GlassCard>
      </div>
    </div>
  )
}
