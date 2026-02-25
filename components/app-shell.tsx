"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  LayoutDashboard,
  MessageSquareText,
  ScrollText,
  Radio,
  MapPin,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { NetworkStatus } from "@/components/network-status"
import { WeatherDashboard } from "@/components/weather-dashboard"
import { WeatherChat } from "@/components/weather-chat"
import { SmsLog } from "@/components/sms-log"
import {
  type UserData,
  type WeatherData,
  type WeatherAlert,
  fetchWeatherFromAPI,
  readLocalSensors,
  checkAlerts,
} from "@/lib/weather"

type Tab = "dashboard" | "chat" | "log"

interface Props {
  user: UserData
  onLogout: () => void
}

export function AppShell({ user, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [gsmSignal, setGsmSignal] = useState(4)
  const [dataSource, setDataSource] = useState<"auto" | "sensor" | "api">("auto")
  const refreshRef = useRef<NodeJS.Timeout | null>(null)

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    let data: WeatherData | null = null
    const useAPI = dataSource === "api" || (dataSource === "auto" && isOnline)
    if (useAPI && isOnline) data = await fetchWeatherFromAPI(user.location)
    if (!data) data = readLocalSensors()
    setWeather(data)
    setAlerts(checkAlerts(data))
    localStorage.setItem("gsm-weather-cache", JSON.stringify({ data, ts: Date.now() }))
    setLoading(false)
  }, [dataSource, isOnline, user.location])

  useEffect(() => {
    const onOn = () => setIsOnline(true)
    const onOff = () => setIsOnline(false)
    window.addEventListener("online", onOn)
    window.addEventListener("offline", onOff)
    setIsOnline(navigator.onLine)

    const sigInt = setInterval(() => setGsmSignal(Math.floor(Math.random() * 2) + 3), 6000)

    // load cache
    const cached = localStorage.getItem("gsm-weather-cache")
    if (cached) {
      const { data, ts } = JSON.parse(cached)
      if (Date.now() - ts < 5 * 60 * 1000) {
        setWeather(data)
        setAlerts(checkAlerts(data))
        setLoading(false)
      }
    }

    fetchWeather()
    refreshRef.current = setInterval(fetchWeather, 30_000)

    return () => {
      window.removeEventListener("online", onOn)
      window.removeEventListener("offline", onOff)
      clearInterval(sigInt)
      if (refreshRef.current) clearInterval(refreshRef.current)
    }
  }, [fetchWeather])

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "Chat", icon: MessageSquareText },
    { id: "log", label: "SMS Log", icon: ScrollText },
  ]

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Radio className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user.stationId}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {user.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NetworkStatus isOnline={isOnline} gsmSignal={gsmSignal} />
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === "dashboard" && (
          <WeatherDashboard
            user={user}
            weather={weather}
            alerts={alerts}
            loading={loading}
            dataSource={dataSource}
            onToggleSource={() =>
              setDataSource((p) => (p === "auto" ? "sensor" : p === "sensor" ? "api" : "auto"))
            }
            onRefresh={fetchWeather}
            gsmSignal={gsmSignal}
          />
        )}
        {tab === "chat" && (
          <WeatherChat user={user} currentWeather={weather} />
        )}
        {tab === "log" && <SmsLog user={user} />}
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border safe-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {tabs.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t.label}</span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
