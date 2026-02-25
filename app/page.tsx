"use client"

import { useEffect, useState } from "react"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { WeatherDashboard } from "@/components/weather-dashboard"
import { Radio } from "lucide-react"

export interface UserData {
  fullName: string
  phoneNumber: string
  location: string
  countryCode: string
  stationId: string
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("gsm-weather-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (userData: UserData) => {
    localStorage.setItem("gsm-weather-user", JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("gsm-weather-user")
    localStorage.removeItem("gsm-weather-cache")
    localStorage.removeItem("gsm-sms-queue")
    setUser(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Radio className="w-10 h-10 text-primary animate-signal-pulse" />
            </div>
            <div
              className="absolute -inset-2 rounded-3xl border border-primary/20 animate-ping"
              style={{ animationDuration: "2s" }}
            />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">GSM Weather Station</p>
            <p className="text-muted-foreground text-sm mt-1">Initializing system...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <OnboardingScreen onLogin={handleLogin} />
  }

  return <WeatherDashboard user={user} onLogout={handleLogout} />
}
