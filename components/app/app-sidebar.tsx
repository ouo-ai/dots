"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Loader2, MessageSquarePlus, Settings, SquareDashedMousePointer, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCreateThread, useThreads } from "@/lib/dots/hooks"
import { deleteThread } from "@/lib/dots/client"
import { DotsApiError } from "@/lib/dots/types"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const router = useRouter()
  const params = useParams<{ threadId?: string }>()
  const { threads, error, isLoading, refresh } = useThreads()
  const { create, isPending } = useCreateThread()
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDelete = async (threadId: string) => {
    if (!window.confirm("Delete this conversation and its tasks? This cannot be undone.")) return
    setDeletingId(threadId)
    try {
      await deleteThread(threadId)
      await refresh()
      if (params?.threadId === threadId) router.push("/app")
      toast.success("Conversation deleted")
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not delete this conversation.")
    } finally {
      setDeletingId(null)
    }
  }

  const isNotConfigured = error instanceof DotsApiError && error.code === "NOT_CONFIGURED"

  return (
    <Sidebar collapsible="offcanvas" className="border-white/10">
      <SidebarHeader className="gap-3 px-3 py-4">
        <Link href="/" className="px-2 text-xl font-bold tracking-tighter text-white">
          Dots<span className="text-blue-400">.</span>
        </Link>
        <button
          onClick={handleNewThread}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
          New request
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/40">Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="flex flex-col gap-2 px-2 py-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : isNotConfigured || threads.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <SquareDashedMousePointer className="h-5 w-5 text-white/30" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-white/40">
                  {isNotConfigured
                    ? "Dots is temporarily unavailable. Please try again later."
                    : "No conversations yet. Start a new request to begin."}
                </p>
              </div>
            ) : (
              <SidebarMenu>
                {threads.map((thread) => (
                  <SidebarMenuItem key={thread.id} className="group/thread flex items-center">
                    <SidebarMenuButton asChild isActive={params?.threadId === thread.id} className="min-w-0 flex-1">
                      <Link href={`/app/${thread.id}`} className="flex flex-col items-start gap-0.5 py-2">
                        <span className={cn("w-full truncate text-sm font-medium")}>{thread.title}</span>
                        {thread.lastMessagePreview && (
                          <span className="w-full truncate text-xs text-white/40">{thread.lastMessagePreview}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                    <button
                      type="button"
                      onClick={() => void handleDelete(thread.id)}
                      disabled={deletingId === thread.id}
                      aria-label={`Delete conversation ${thread.title}`}
                      title="Delete conversation"
                      className="rounded-lg p-2 text-white/30 opacity-0 transition hover:bg-white/10 hover:text-red-300 focus:opacity-100 group-hover/thread:opacity-100 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/app/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings &amp; privacy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
