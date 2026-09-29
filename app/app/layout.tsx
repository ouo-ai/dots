import type { Metadata } from "next"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AppSidebar } from "@/components/app/app-sidebar"

export const metadata: Metadata = {
  title: "Dots — App",
  description: "Send requests to Dots, your 24/7 on-demand personal assistant, and track task progress.",
  robots: { index: false, follow: false },
}

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-[#050508] text-white">
        <AppSidebar />
        {children}
      </div>
      <Toaster theme="dark" position="top-center" />
    </SidebarProvider>
  )
}
