"use client"

import { SendHorizontal } from "lucide-react"
import { toast } from "sonner"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { BackendSetupNotice } from "@/components/app/backend-setup-notice"
import { useCreateThread, useThreads } from "@/lib/dots/hooks"
import { useRouter } from "next/navigation"
import { DotsApiError } from "@/lib/dots/types"

export default function AppHomePage() {
  const router = useRouter()
  const { error, isLoading } = useThreads()
  const { create, isPending } = useCreateThread()

  const isNotConfigured = error instanceof DotsApiError && error.code === "NOT_CONFIGURED"

  const handleNewThread = async () => {
    const thread = await create()
    if (thread) {
      router.push(`/app/${thread.id}`)
      return
    }
    toast.error("Could not start a conversation", {
      description: "Please try again shortly.",
    })
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 md:px-6">
        <SidebarTrigger className="text-white/60 hover:text-white" />
        <h1 className="text-sm font-semibold text-white/90 md:text-base">Dots</h1>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        {!isLoading && isNotConfigured ? (
          <BackendSetupNotice error={error} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SendHorizontal />
              </EmptyMedia>
              <EmptyTitle>Start a new request</EmptyTitle>
              <EmptyDescription>
                Pick a conversation from the sidebar, or start a new one to ask a question, make a plan, or hand off
                a task to Dots.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <button
                onClick={handleNewThread}
                disabled={isPending}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:scale-105 disabled:opacity-60"
              >
                New request
              </button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  )
}
