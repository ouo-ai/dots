"use client"

import { useState } from "react"
import { ListTodo, MessageSquareDashed } from "lucide-react"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Composer } from "@/components/app/composer"
import { TaskPanel } from "@/components/app/task-panel"
import { BackendSetupNotice } from "@/components/app/backend-setup-notice"
import { useSendMessage, useThread } from "@/lib/dots/hooks"
import { DotsApiError } from "@/lib/dots/types"
import { cn } from "@/lib/utils"

export function ConversationView({ threadId }: { threadId: string }) {
  const { thread, error, isLoading } = useThread(threadId)
  const { send, isPending, error: sendError } = useSendMessage(threadId)
  const [isActivityOpen, setIsActivityOpen] = useState(false)

  const isNotConfigured = error instanceof DotsApiError && error.code === "NOT_CONFIGURED"

  const handleSubmit = async (content: string) => {
    const result = await send(content)
    if (!result) {
      const message =
        sendError instanceof DotsApiError
          ? sendError.message
          : "Please try again shortly."
      toast.error("Couldn't send that request", { description: message })
    }
  }

  return (
    <div className="flex h-svh min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="text-white/60 hover:text-white" />
          <h1 className="truncate text-sm font-semibold text-white/90 md:text-base">
            {thread?.thread.title ?? "Conversation"}
          </h1>
        </div>

        <Sheet open={isActivityOpen} onOpenChange={setIsActivityOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 lg:hidden"
              aria-label="Open task activity"
            >
              <ListTodo className="h-3.5 w-3.5" />
              Activity
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm border-white/10 bg-[#0a0a0f] p-0 sm:max-w-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>Task activity</SheetTitle>
            </SheetHeader>
            <TaskPanel tasks={thread?.tasks} isLoading={isLoading} error={error} />
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
            {isLoading ? (
              <div className="flex flex-col gap-4" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn("h-16 w-2/3 animate-pulse rounded-2xl bg-white/5", i % 2 === 1 && "ml-auto")}
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <BackendSetupNotice error={error} />
              </div>
            ) : !thread || thread.messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageSquareDashed />
                    </EmptyMedia>
                    <EmptyTitle>No messages yet</EmptyTitle>
                    <EmptyDescription>
                      Send Dots a request below to start this conversation.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {thread.messages.map((message) => (
                  <li
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[70%]",
                      message.role === "user"
                        ? "ml-auto rounded-tr-sm bg-blue-500/90 text-white"
                        : "rounded-tl-sm border border-white/10 bg-white/5 text-white/80",
                    )}
                  >
                    {message.content}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Composer
            onSubmit={handleSubmit}
            isPending={isPending}
            disabled={isNotConfigured}
            disabledReason={
              isNotConfigured ? "Dots is temporarily unavailable. Please try again later." : undefined
            }
          />
        </div>

        <aside className="hidden w-[340px] shrink-0 border-l border-white/10 lg:block">
          <TaskPanel tasks={thread?.tasks} isLoading={isLoading} error={error} />
        </aside>
      </div>
    </div>
  )
}
