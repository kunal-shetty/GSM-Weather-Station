"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  RefreshCw,
  Clock,
  Send,
  Activity,
  Wifi,
  Settings,
  Wind,
  Zap,
  Database,
  AlertTriangle,
} from "lucide-react"
import type { UserData, WeatherData, WeatherAlert } from "@/lib/weather"
import { AlertBanner } from "@/components/alert-banner"
import { GsmModal } from "@/components/gsm-modal"
import { useState } from "react"

interface Props {
  user: UserData
  weather: WeatherData | null
  alerts: WeatherAlert[]
  loading: boolean
  dataSource: "auto" | "sensor" | "api"
  onToggleSource: () => void
  onRefresh: () => void
  gsmSignal: number
}

export function WeatherDashboard({
  user,
  weather,
  alerts,
  loading,
  dataSource,
  onToggleSource,
  onRefresh,
  gsmSignal,
}: Props) {
  const [showGsm, setShowGsm] = useState(false)

  const conditionIcon = (cond: string) => {
    const c = "w-8 h-8"
    if (cond === "clear") return <Sun className={`${c} text-warning`} />
    if (cond === "rain" || cond === "drizzle") return <CloudRain className={`${c} text-info`} />
    if (cond === "snow") return <CloudSnow className={`${c} text-accent`} />
    if (cond === "thunderstorm") return <CloudLightning className={`${c} text-warning`} />
    return <Cloud className={`${c} text-muted-foreground`} />
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Welcome row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            Hello, {user.fullName.split(" ")[0]}
          </h2>
          {weather && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {weather.lastUpdated}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                  weather.source === "sensor"
                    ? "bg-primary/10 text-primary"
                    : "bg-info/10 text-info"
                }`}
              >
                {weather.source === "sensor" ? (
                  <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" />Sensor</span>
                ) : (
                  <span className="flex items-center gap-0.5"><Database className="w-2.5 h-2.5" />API</span>
                )}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 text-xs bg-transparent border-border hover:bg-secondary"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Source toggle */}
      <button
        onClick={onToggleSource}
        className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              dataSource === "sensor"
                ? "bg-primary/10 text-primary"
                : dataSource === "api"
                  ? "bg-info/10 text-info"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {dataSource === "sensor" ? <Activity className="w-4 h-4" /> :
             dataSource === "api" ? <Wifi className="w-4 h-4" /> :
             <Settings className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground leading-tight">
              {dataSource === "sensor" ? "Local Sensors" : dataSource === "api" ? "Online API" : "Auto Mode"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {dataSource === "sensor" ? "DHT11 + LDR" : dataSource === "api" ? "OpenWeatherMap API" : "API when online, sensors offline"}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">Tap to change</span>
      </button>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((a, i) => (
            <AlertBanner key={i} alert={a} />
          ))}
        </div>
      )}

      {/* Main content */}
      {loading && !weather ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-7 h-7 text-primary animate-pulse" />
            </div>
            <p className="text-sm text-foreground font-medium">Reading sensors...</p>
            <p className="text-xs text-muted-foreground">DHT11, LDR, SIM800L</p>
          </CardContent>
        </Card>
      ) : weather ? (
        <>
          {/* Hero temp card */}
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground tracking-tighter">
                      {weather.temperature}
                    </span>
                    <span className="text-xl text-muted-foreground font-light">{"\u00B0C"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {weather.conditionDescription}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Feels like {weather.feelsLike}{"\u00B0C"}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center">
                  {conditionIcon(weather.condition)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gauge grid */}
          <div className="grid grid-cols-2 gap-3">
            <GaugeCard
              icon={<Thermometer className="w-4 h-4" />}
              color="destructive"
              label="Temperature"
              sub="DHT11"
              value={weather.temperature}
              unit={"\u00B0C"}
              min={-10}
              max={50}
              alert={alerts.some((a) => a.sensor === "temperature")}
            />
            <GaugeCard
              icon={<Droplets className="w-4 h-4" />}
              color="info"
              label="Humidity"
              sub="DHT11"
              value={weather.humidity}
              unit="%"
              min={0}
              max={100}
              alert={alerts.some((a) => a.sensor === "humidity")}
            />
            <GaugeCard
              icon={<Sun className="w-4 h-4" />}
              color="warning"
              label="Light"
              sub="LDR"
              value={weather.lightLevel}
              unit="%"
              min={0}
              max={100}
              alert={alerts.some((a) => a.sensor === "light")}
            />
            <GaugeCard
              icon={<Wind className="w-4 h-4" />}
              color="accent"
              label="Wind"
              sub="Anemometer"
              value={weather.windSpeed}
              unit="km/h"
              min={0}
              max={60}
              alert={false}
            />
          </div>

          {/* GSM Send */}
          <Button
            onClick={() => setShowGsm(true)}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl"
          >
            <Send className="w-4 h-4 mr-2" />
            Transmit via GSM
          </Button>
          <p className="text-[10px] text-center text-muted-foreground -mt-2">
            Send weather SMS to {user.countryCode}{user.phoneNumber}
          </p>
        </>
      ) : null}

      {showGsm && weather && (
        <GsmModal
          user={user}
          weather={weather}
          alerts={alerts}
          gsmSignal={gsmSignal}
          onClose={() => setShowGsm(false)}
        />
      )}
    </div>
  )
}

/* ── Circular gauge card ── */
function GaugeCard({
  icon,
  color,
  label,
  sub,
  value,
  unit,
  min,
  max,
  alert,
}: {
  icon: React.ReactNode
  color: string
  label: string
  sub: string
  value: number
  unit: string
  min: number
  max: number
  alert: boolean
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ * 0.75 // 270 degrees arc

  const colorMap: Record<string, { stroke: string; bg: string; text: string }> = {
    destructive: { stroke: "stroke-destructive", bg: "bg-destructive/10", text: "text-destructive" },
    info: { stroke: "stroke-info", bg: "bg-info/10", text: "text-info" },
    warning: { stroke: "stroke-warning", bg: "bg-warning/10", text: "text-warning" },
    accent: { stroke: "stroke-accent", bg: "bg-accent/10", text: "text-accent" },
  }
  const cm = colorMap[color] || colorMap.info

  return (
    <Card
      className={`bg-card border-border transition-all ${
        alert ? "border-warning/40 shadow-md shadow-warning/5" : ""
      }`}
    >
      <CardContent className="p-4 flex flex-col items-center gap-2">
        {/* SVG gauge */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className="stroke-secondary"
              strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
            />
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={cm.stroke}
              strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground leading-none">{value}</span>
            <span className="text-[10px] text-muted-foreground">{unit}</span>
          </div>
        </div>

        {/* Label */}
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded flex items-center justify-center ${cm.bg} ${cm.text}`}>
            {icon}
          </div>
          <div className="text-left">
            <p className="text-xs font-medium text-foreground leading-tight">{label}</p>
            <p className="text-[9px] text-muted-foreground">{sub}</p>
          </div>
          {alert && <AlertTriangle className="w-3.5 h-3.5 text-warning ml-auto" />}
        </div>
      </CardContent>
    </Card>
  )
}
