"use client"

import { useState, type KeyboardEvent } from "react"
import { Loader2, SendHorizontal } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface ComposerProps {
  onSubmit: (content: string) => void | Promise<void>
  isPending?: boolean
  disabled?: boolean
  disabledReason?: string
}

export function Composer({ onSubmit, isPending, disabled, disabledReason }: ComposerProps) {
  const [value, setValue] = useState("")

  const isDisabled = disabled || isPending

  const submit = async () => {
    const content = value.trim()
    if (!content || isDisabled) return
    setValue("")
    await onSubmit(content)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Avoid submitting while a CJK IME is composing, including Safari's
    // unreliable final composition event (keyCode 229).
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-white/10 bg-black/40 p-4 md:p-6">
      {disabled && disabledReason && <p className="mb-3 text-xs text-white/40">{disabledReason}</p>}
      <div
        className={cn(
          "flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl transition-colors",
          "focus-within:border-blue-400/40",
        )}
      >
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder={disabled ? "Connect a backend to send requests to Dots" : "Send a request to Dots..."}
          aria-label="Message Dots"
          rows={1}
          className="min-h-[44px] max-h-40 flex-1 resize-none border-0 bg-transparent p-2 text-sm text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <button
          type="button"
          onClick={submit}
          disabled={isDisabled || !value.trim()}
          aria-label="Send request"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-white/30">
        Dots is available on-demand, not proactive — it responds to what you submit.
      </p>
    </div>
  )
}
