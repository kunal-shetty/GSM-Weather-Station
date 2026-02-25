import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "GSM Weather Station",
  description:
    "Low-cost automated weather monitoring system for remote areas without internet - uses GSM/SMS for real-time updates",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GSM Weather",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.jpg",
    apple: "/icon-512.jpg",
  },
  keywords: ["weather monitoring", "GSM", "SMS", "agriculture", "remote monitoring", "IoT", "sensors"],
}

export const viewport: Viewport = {
  themeColor: "#f9fafb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
