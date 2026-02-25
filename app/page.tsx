"use client"

import { useEffect, useState } from "react"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { AppShell } from "@/components/app-shell"
import { Radio } from "lucide-react"
import type { UserData } from "@/lib/weather"

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("gsm-weather-user")
    if (saved) setUser(JSON.parse(saved))
    setReady(true)
  }, [])

  const handleLogin = (data: UserData) => {
    localStorage.setItem("gsm-weather-user", JSON.stringify(data))
    setUser(data)
  }

  const handleLogout = () => {
    localStorage.removeItem("gsm-weather-user")
    localStorage.removeItem("gsm-weather-cache")
    localStorage.removeItem("gsm-sms-history")
    localStorage.removeItem("gsm-chat-history")
    setUser(null)
  }

  if (!ready) {
    return (
      <main className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Radio className="w-8 h-8 text-primary animate-signal-pulse" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">GSM WeatherLink</p>
            <p className="text-xs text-muted-foreground mt-1">Initializing...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!user) return <OnboardingScreen onLogin={handleLogin} />
  return <AppShell user={user} onLogout={handleLogout} />
}
