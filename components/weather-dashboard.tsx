"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Radio,
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  RefreshCw,
  LogOut,
  MapPin,
  Clock,
  AlertTriangle,
  Send,
  Wifi,
  Activity,
  Zap,
  Settings,
  Database,
} from "lucide-react"
import type { UserData } from "@/app/page"
import { GsmModal } from "@/components/gsm-modal"
import { AlertBanner } from "@/components/alert-banner"
import { NetworkStatus } from "@/components/network-status"

export interface WeatherData {
  temperature: number
  humidity: number
  lightLevel: number
  lightLabel: string
  condition: string
  conditionDescription: string
  windSpeed: number
  feelsLike: number
  lastUpdated: string
  source: "api" | "sensor"
}

export interface Alert {
  type: "warning" | "danger" | "info"
  message: string
  sensor: string
}

interface WeatherDashboardProps {
  user: UserData
  onLogout: () => void
}

export function WeatherDashboard({ user, onLogout }: WeatherDashboardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showGsmModal, setShowGsmModal] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [dataSource, setDataSource] = useState<"auto" | "sensor" | "api">("auto")
  const [gsmSignal, setGsmSignal] = useState(4)
  const [sensorActive, setSensorActive] = useState(true)
  const refreshInterval = useRef<NodeJS.Timeout | null>(null)

  // Simulate local sensor readings (DHT11, LDR)
  const readLocalSensors = useCallback((): WeatherData => {
    const hour = new Date().getHours()

    // Simulate DHT11 temperature sensor with realistic variations
    const baseTemp = 25 + Math.sin(((hour - 6) * Math.PI) / 12) * 10
    const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 4)

    // Simulate DHT11 humidity sensor
    const baseHumidity = 60 - Math.sin(((hour - 6) * Math.PI) / 12) * 20
    const humidity = Math.round(Math.max(30, Math.min(90, baseHumidity + (Math.random() - 0.5) * 10)))

    // Simulate LDR light sensor
    let lightLevel: number
    if (hour >= 6 && hour < 8) lightLevel = 30 + Math.random() * 20
    else if (hour >= 8 && hour < 17) lightLevel = 70 + Math.random() * 25
    else if (hour >= 17 && hour < 19) lightLevel = 30 + Math.random() * 20
    else lightLevel = 5 + Math.random() * 10

    lightLevel = Math.round(lightLevel)

    const lightLabel =
      lightLevel < 20
        ? "Very Low"
        : lightLevel < 40
          ? "Low"
          : lightLevel < 60
            ? "Medium"
            : lightLevel < 80
              ? "High"
              : "Very High"

    // Determine condition based on readings
    let condition = "clear"
    let conditionDescription = "Clear sky"
    if (humidity > 80) {
      condition = "humid"
      conditionDescription = "High humidity"
    } else if (lightLevel < 30 && hour >= 8 && hour <= 18) {
      condition = "cloudy"
      conditionDescription = "Cloudy"
    }

    return {
      temperature,
      humidity,
      lightLevel,
      lightLabel,
      condition,
      conditionDescription,
      windSpeed: Math.round(5 + Math.random() * 15),
      feelsLike: temperature + (humidity > 70 ? 2 : humidity < 40 ? -2 : 0),
      lastUpdated: new Date().toLocaleString(),
      source: "sensor",
    }
  }, [])

  const checkAlerts = useCallback((data: WeatherData): Alert[] => {
    const newAlerts: Alert[] = []

    if (data.temperature > 35) {
      newAlerts.push({
        type: "danger",
        message: `High temperature: ${data.temperature}C - Heat warning`,
        sensor: "temperature",
      })
    } else if (data.temperature < 10) {
      newAlerts.push({
        type: "warning",
        message: `Low temperature: ${data.temperature}C - Frost risk`,
        sensor: "temperature",
      })
    }

    if (data.humidity < 30) {
      newAlerts.push({
        type: "warning",
        message: `Low humidity: ${data.humidity}% - Irrigation needed`,
        sensor: "humidity",
      })
    } else if (data.humidity > 85) {
      newAlerts.push({
        type: "warning",
        message: `High humidity: ${data.humidity}% - Fungal risk`,
        sensor: "humidity",
      })
    }

    if (data.lightLevel > 90) {
      newAlerts.push({
        type: "info",
        message: `High light: ${data.lightLevel}% - Consider shading`,
        sensor: "light",
      })
    }

    return newAlerts
  }, [])

  const fetchFromAPI = useCallback(async (): Promise<WeatherData | null> => {
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(user.location)}&count=1`,
      )
      const geoData = await geoResponse.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Location not found")
      }

      const { latitude, longitude } = geoData.results[0]

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover&timezone=auto`,
      )
      const weatherData = await weatherResponse.json()

      const current = weatherData.current
      const hour = new Date().getHours()

      const weatherCondition = getWeatherCondition(current.weather_code)
      const lightLevel = calculateLightLevel(hour, current.cloud_cover)

      return {
        temperature: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        lightLevel: lightLevel.level,
        lightLabel: lightLevel.label,
        condition: weatherCondition.condition,
        conditionDescription: weatherCondition.description,
        windSpeed: Math.round(current.wind_speed_10m),
        feelsLike: Math.round(current.apparent_temperature),
        lastUpdated: new Date().toLocaleString(),
        source: "api",
      }
    } catch {
      return null
    }
  }, [user.location])

  const fetchWeather = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSensorActive(true)

    let data: WeatherData | null = null

    // Determine data source
    const useAPI = dataSource === "api" || (dataSource === "auto" && isOnline)

    if (useAPI && isOnline) {
      data = await fetchFromAPI()
    }

    // Fallback to local sensors if API fails or offline
    if (!data) {
      data = readLocalSensors()
      if (dataSource === "auto" && isOnline) {
        setError("API unavailable - using local sensors")
      }
    }

    setWeather(data)
    setAlerts(checkAlerts(data))

    // Cache the data
    localStorage.setItem("gsm-weather-cache", JSON.stringify({ data, timestamp: Date.now() }))

    setLoading(false)

    // Simulate sensor reading completion
    setTimeout(() => setSensorActive(false), 500)
  }, [dataSource, isOnline, fetchFromAPI, readLocalSensors, checkAlerts])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    // Simulate GSM signal fluctuation
    const signalInterval = setInterval(() => {
      setGsmSignal(Math.floor(Math.random() * 2) + 3) // 3-4 bars
    }, 5000)

    // Load cached data first
    const cached = localStorage.getItem("gsm-weather-cache")
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      const isStale = Date.now() - timestamp > 5 * 60 * 1000
      if (!isStale) {
        setWeather(data)
        setAlerts(checkAlerts(data))
        setLoading(false)
      }
    }

    fetchWeather()

    // Auto-refresh every 30 seconds (simulating continuous sensor monitoring)
    refreshInterval.current = setInterval(fetchWeather, 30000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(signalInterval)
      if (refreshInterval.current) clearInterval(refreshInterval.current)
    }
  }, [fetchWeather, checkAlerts])

  const getWeatherIcon = (condition: string) => {
    const iconClass = "w-10 h-10"
    switch (condition) {
      case "clear":
        return <Sun className={`${iconClass} text-warning`} />
      case "cloudy":
      case "overcast":
        return <Cloud className={`${iconClass} text-muted-foreground`} />
      case "rain":
      case "drizzle":
        return <CloudRain className={`${iconClass} text-info`} />
      case "snow":
        return <CloudSnow className={`${iconClass} text-accent`} />
      case "thunderstorm":
        return <CloudLightning className={`${iconClass} text-warning`} />
      default:
        return <Cloud className={`${iconClass} text-muted-foreground`} />
    }
  }

  const toggleDataSource = () => {
    setDataSource((prev) => {
      if (prev === "auto") return "sensor"
      if (prev === "sensor") return "api"
      return "auto"
    })
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-primary" />
                </div>
                {sensorActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-foreground text-sm">Station {user.stationId}</h1>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{user.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NetworkStatus isOnline={isOnline} gsmSignal={gsmSignal} />
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground h-9 w-9"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Data Source Toggle */}
      <div className="px-4 pt-4">
        <button
          onClick={toggleDataSource}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                dataSource === "sensor"
                  ? "bg-primary/10 text-primary"
                  : dataSource === "api"
                    ? "bg-info/10 text-info"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {dataSource === "sensor" ? (
                <Activity className="w-4 h-4" />
              ) : dataSource === "api" ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                {dataSource === "sensor" ? "Local Sensors" : dataSource === "api" ? "Online API" : "Auto Mode"}
              </p>
              <p className="text-xs text-muted-foreground">
                {dataSource === "sensor"
                  ? "DHT11 + LDR sensors"
                  : dataSource === "api"
                    ? "Open-Meteo weather API"
                    : "Uses API when online, sensors offline"}
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Tap to change</div>
        </button>
      </div>

      {/* Welcome & Status */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Hello, {user.fullName.split(" ")[0]}</h2>
            {weather && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {weather.lastUpdated}
                </div>
                <div
                  className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    weather.source === "sensor" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"
                  }`}
                >
                  {weather.source === "sensor" ? <Zap className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                  {weather.source === "sensor" ? "Sensor" : "API"}
                </div>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWeather}
            disabled={loading}
            className="h-9 bg-transparent border-border hover:bg-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 mb-4 space-y-2">
          {alerts.map((alert, index) => (
            <AlertBanner key={index} alert={alert} />
          ))}
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="px-4 mb-4">
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-sm text-foreground">{error}</p>
          </div>
        </div>
      )}

      {/* Weather Content */}
      <div className="px-4 space-y-4">
        {loading && !weather ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Reading sensors...</p>
                  <p className="text-xs text-muted-foreground mt-1">DHT11, LDR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : weather ? (
          <>
            {/* Main Weather Card */}
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-bold text-foreground tracking-tight">{weather.temperature}</span>
                        <span className="text-2xl text-muted-foreground">°C</span>
                      </div>
                      <p className="text-muted-foreground mt-2 capitalize">{weather.conditionDescription}</p>
                      <p className="text-sm text-muted-foreground">Feels like {weather.feelsLike}°C</p>
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center">
                      {getWeatherIcon(weather.condition)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sensor Cards Grid */}
            <div className="grid grid-cols-1 gap-3">
              <SensorCard
                icon={<Thermometer className="w-5 h-5" />}
                iconColor="text-destructive"
                iconBg="bg-destructive/10"
                title="Temperature"
                subtitle="DHT11 Sensor"
                value={`${weather.temperature}°C`}
                subValue={`Feels ${weather.feelsLike}°C`}
                progress={Math.min(100, Math.max(0, ((weather.temperature + 10) / 60) * 100))}
                progressColor="bg-destructive"
                hasAlert={alerts.some((a) => a.sensor === "temperature")}
              />

              <SensorCard
                icon={<Droplets className="w-5 h-5" />}
                iconColor="text-info"
                iconBg="bg-info/10"
                title="Humidity"
                subtitle="DHT11 Sensor"
                value={`${weather.humidity}%`}
                subValue={weather.humidity < 40 ? "Low - Irrigate" : weather.humidity > 70 ? "High" : "Optimal"}
                progress={weather.humidity}
                progressColor="bg-info"
                hasAlert={alerts.some((a) => a.sensor === "humidity")}
              />

              <SensorCard
                icon={<Sun className="w-5 h-5" />}
                iconColor="text-warning"
                iconBg="bg-warning/10"
                title="Light Intensity"
                subtitle="LDR Sensor"
                value={`${weather.lightLevel}%`}
                subValue={weather.lightLabel}
                progress={weather.lightLevel}
                progressColor="bg-warning"
                hasAlert={alerts.some((a) => a.sensor === "light")}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* GSM Send Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass border-t border-border safe-bottom">
        <Button
          onClick={() => setShowGsmModal(true)}
          disabled={!weather}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base rounded-xl transition-all disabled:opacity-40"
        >
          <Send className="w-5 h-5 mr-2" />
          Transmit via GSM
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Send weather data as SMS to {user.countryCode}
          {user.phoneNumber}
        </p>
      </div>

      {/* GSM Modal */}
      {showGsmModal && weather && (
        <GsmModal
          user={user}
          weather={weather}
          alerts={alerts}
          gsmSignal={gsmSignal}
          onClose={() => setShowGsmModal(false)}
        />
      )}
    </div>
  )
}

function SensorCard({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  value,
  subValue,
  progress,
  progressColor,
  hasAlert,
}: {
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  title: string
  subtitle: string
  value: string
  subValue: string
  progress: number
  progressColor: string
  hasAlert: boolean
}) {
  return (
    <Card
      className={`bg-card border-border transition-all ${hasAlert ? "border-warning/50 shadow-lg shadow-warning/5" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{subValue}</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${progressColor} transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
          {hasAlert && <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />}
        </div>
      </CardContent>
    </Card>
  )
}

function calculateLightLevel(hour: number, cloudCover: number): { level: number; label: string } {
  let baseLevel: number
  if (hour >= 6 && hour < 8) baseLevel = 40
  else if (hour >= 8 && hour < 10) baseLevel = 70
  else if (hour >= 10 && hour < 16) baseLevel = 95
  else if (hour >= 16 && hour < 18) baseLevel = 60
  else if (hour >= 18 && hour < 20) baseLevel = 30
  else baseLevel = 10

  const cloudReduction = (cloudCover / 100) * 40
  const finalLevel = Math.max(5, Math.min(100, baseLevel - cloudReduction))

  let label: string
  if (finalLevel < 20) label = "Very Low"
  else if (finalLevel < 40) label = "Low"
  else if (finalLevel < 60) label = "Medium"
  else if (finalLevel < 80) label = "High"
  else label = "Very High"

  return { level: Math.round(finalLevel), label }
}

function getWeatherCondition(code: number): { condition: string; description: string } {
  if (code === 0) return { condition: "clear", description: "Clear sky" }
  if (code <= 3) return { condition: "cloudy", description: "Partly cloudy" }
  if (code >= 45 && code <= 48) return { condition: "cloudy", description: "Foggy" }
  if (code >= 51 && code <= 67) return { condition: "rain", description: "Rainy" }
  if (code >= 71 && code <= 77) return { condition: "snow", description: "Snowy" }
  if (code >= 80 && code <= 82) return { condition: "rain", description: "Showers" }
  if (code >= 95) return { condition: "thunderstorm", description: "Thunderstorm" }
  return { condition: "cloudy", description: "Cloudy" }
}
