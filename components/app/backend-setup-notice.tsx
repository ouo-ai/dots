import { PlugZap } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { DotsApiError } from "@/lib/dots/types"

/**
 * Honest "not connected" state. Shown wherever the app would otherwise need
 * to fabricate assistant data because no backend is wired up yet.
 */
export function BackendSetupNotice({ error, compact = false }: { error?: DotsApiError | Error | null; compact?: boolean }) {
  const isNotConfigured = !error || (error instanceof DotsApiError && error.code === "NOT_CONFIGURED")

  return (
    <Empty className={compact ? "p-4 md:p-6" : undefined}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PlugZap />
        </EmptyMedia>
        <EmptyTitle>{isNotConfigured ? "Dots is temporarily unavailable" : "Something went wrong"}</EmptyTitle>
        <EmptyDescription>
          {isNotConfigured
            ? "The assistant service is not ready right now. Please try again later."
            : error?.message || "Could not load data from the Dots API. Try again in a moment."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
