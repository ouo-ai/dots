import { CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/lib/dots/types"

const statusConfig: Record<
  TaskStatus,
  { label: string; icon: typeof CheckCircle2; className: string; spin?: boolean }
> = {
  queued: {
    label: "Queued",
    icon: CircleDashed,
    className: "border-white/15 bg-white/5 text-white/60",
  },
  running: {
    label: "Running",
    icon: Loader2,
    className: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    spin: true,
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "border-red-400/30 bg-red-400/10 text-red-300",
  },
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className={cn("h-3 w-3", config.spin && "animate-spin")} aria-hidden="true" />
      {config.label}
    </span>
  )
}
