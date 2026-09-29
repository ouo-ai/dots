import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { StructuredData } from "@/components/structured-data"
import { cn } from "@/lib/utils"
import { siteUrl } from "@/lib/site-url"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const title = "Dots | 24/7 AI Personal Assistant for Tasks & Plans"
const description =
  "Dots is a 24/7 on-demand AI personal assistant. Ask questions, plan projects, and organize tasks in one thread. Submit a request anytime and track its progress."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Dots",
  title: {
    default: title,
    template: "%s | Dots",
  },
  description,
  keywords: [
    "Dots",
    "Dots AI",
    "Dots personal assistant",
    "24/7 AI personal assistant",
    "AI task assistant",
    "AI planning assistant",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Dots",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dots — your 24/7 on-demand AI personal assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  category: "productivity",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050508",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-black font-sans antialiased selection:bg-white/20", inter.variable)}>
        <StructuredData />
        {children}
      </body>
    </html>
  )
}
