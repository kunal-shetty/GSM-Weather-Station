import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GSM WeatherLink - Remote Monitoring System",
  description:
    "Low-cost automated weather monitoring for remote areas using GSM/SMS communication. No internet required.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WeatherLink",
  },
  icons: {
    icon: "/icon-192.jpg",
    apple: "/icon-512.jpg",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#1a9a6c",
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
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
