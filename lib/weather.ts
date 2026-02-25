// ── Types ──
export interface UserData {
  fullName: string
  phoneNumber: string
  location: string
  countryCode: string
  stationId: string
}

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

export interface WeatherAlert {
  type: "warning" | "danger" | "info"
  message: string
  sensor: string
}

export interface ChatMessage {
  id: string
  role: "user" | "bot"
  content: string
  timestamp: string
  weatherData?: WeatherData
}

export interface SmsRecord {
  id: number
  phone: string
  message: string
  timestamp: string
  status: "delivered" | "failed" | "pending"
  alertCount: number
}

const DUMMY_WEATHER: Record<string, Partial<WeatherData>> = {
  "mumbai": { temperature: 31, humidity: 72, condition: "clear", conditionDescription: "Sunny", windSpeed: 12, feelsLike: 34 },
  "delhi": { temperature: 28, humidity: 45, condition: "cloudy", conditionDescription: "Hazy", windSpeed: 8, feelsLike: 30 },
  "bangalore": { temperature: 24, humidity: 65, condition: "cloudy", conditionDescription: "Partly Cloudy", windSpeed: 15, feelsLike: 25 },
  "london": { temperature: 15, humidity: 80, condition: "rain", conditionDescription: "Light Rain", windSpeed: 20, feelsLike: 14 },
  "new york": { temperature: 18, humidity: 55, condition: "clear", conditionDescription: "Clear Sky", windSpeed: 10, feelsLike: 18 },
  "tokyo": { temperature: 21, humidity: 60, condition: "cloudy", conditionDescription: "Cloudy", windSpeed: 12, feelsLike: 21 },
}

export async function fetchWeatherFromAPI(location: string): Promise<WeatherData | null> {
  const city = location.toLowerCase().trim()
  const dummy = DUMMY_WEATHER[city]

  if (!dummy) return null

  const hour = new Date().getHours()
  const light = calcLight(hour, 20) // Dummy cloud cover

  return {
    temperature: dummy.temperature!,
    humidity: dummy.humidity!,
    lightLevel: light.level,
    lightLabel: light.label,
    condition: dummy.condition!,
    conditionDescription: dummy.conditionDescription!,
    windSpeed: dummy.windSpeed!,
    feelsLike: dummy.feelsLike!,
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    source: "api",
  }
}

// ── Simulated local sensors ──
export function readLocalSensors(): WeatherData {
  const hour = new Date().getHours()
  const baseTemp = 25 + Math.sin(((hour - 6) * Math.PI) / 12) * 10
  const temperature = Math.round(baseTemp + (Math.random() - 0.5) * 4)

  const baseHum = 60 - Math.sin(((hour - 6) * Math.PI) / 12) * 20
  const humidity = Math.round(Math.max(30, Math.min(90, baseHum + (Math.random() - 0.5) * 10)))

  let lightLevel: number
  if (hour >= 6 && hour < 8) lightLevel = 30 + Math.random() * 20
  else if (hour >= 8 && hour < 17) lightLevel = 70 + Math.random() * 25
  else if (hour >= 17 && hour < 19) lightLevel = 30 + Math.random() * 20
  else lightLevel = 5 + Math.random() * 10
  lightLevel = Math.round(lightLevel)

  const lightLabel = lightLevel < 20 ? "Very Low" : lightLevel < 40 ? "Low" : lightLevel < 60 ? "Medium" : lightLevel < 80 ? "High" : "Very High"

  let condition = "clear", conditionDescription = "Clear sky"
  if (humidity > 80) { condition = "humid"; conditionDescription = "High humidity" }
  else if (lightLevel < 30 && hour >= 8 && hour <= 18) { condition = "cloudy"; conditionDescription = "Overcast" }

  return {
    temperature,
    humidity,
    lightLevel,
    lightLabel,
    condition,
    conditionDescription,
    windSpeed: Math.round(5 + Math.random() * 15),
    feelsLike: temperature + (humidity > 70 ? 2 : humidity < 40 ? -2 : 0),
    lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    source: "sensor",
  }
}

// ── Alerts ──
export function checkAlerts(data: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = []
  if (data.temperature > 35)
    alerts.push({ type: "danger", message: `High temp: ${data.temperature}\u00B0C \u2014 Heat warning`, sensor: "temperature" })
  else if (data.temperature < 10)
    alerts.push({ type: "warning", message: `Low temp: ${data.temperature}\u00B0C \u2014 Frost risk`, sensor: "temperature" })
  if (data.humidity < 30)
    alerts.push({ type: "warning", message: `Low humidity: ${data.humidity}% \u2014 Irrigation needed`, sensor: "humidity" })
  else if (data.humidity > 85)
    alerts.push({ type: "warning", message: `High humidity: ${data.humidity}% \u2014 Fungal risk`, sensor: "humidity" })
  if (data.lightLevel > 90)
    alerts.push({ type: "info", message: `High light: ${data.lightLevel}% \u2014 Consider shading`, sensor: "light" })
  return alerts
}

// ── Formatting for chat ──
export function formatWeatherChat(data: WeatherData, location: string): string {
  return `Weather in ${location}
Temp: ${data.temperature}\u00B0C (feels ${data.feelsLike}\u00B0C)
Humidity: ${data.humidity}%
Wind: ${data.windSpeed} km/h
Light: ${data.lightLevel}% (${data.lightLabel})
Condition: ${data.conditionDescription}
Source: ${data.source === "sensor" ? "Local Sensors" : "API"}`
}

// ── SMS formatting ──
export function formatSms(user: UserData, data: WeatherData, alerts: WeatherAlert[]): string {
  return `[GSM WEATHER STATION]
Station: ${user.stationId}
Location: ${user.location}
Time: ${data.lastUpdated}
Source: ${data.source === "sensor" ? "Local Sensors" : "API"}

READINGS:
Temp: ${data.temperature}\u00B0C (feels ${data.feelsLike}\u00B0C)
Humidity: ${data.humidity}%
Light: ${data.lightLevel}% (${data.lightLabel})
Wind: ${data.windSpeed} km/h
Condition: ${data.conditionDescription}

${alerts.length > 0 ? `ALERTS:\n${alerts.map((a) => `! ${a.message}`).join("\n")}` : "STATUS: All normal"}

---
GSM WeatherLink v2.0`
}

// ── Helpers ──
function mapWeatherCode(code: number) {
  if (code === 0) return { condition: "clear", description: "Clear sky" }
  if (code <= 3) return { condition: "cloudy", description: "Partly cloudy" }
  if (code >= 45 && code <= 48) return { condition: "cloudy", description: "Foggy" }
  if (code >= 51 && code <= 67) return { condition: "rain", description: "Rainy" }
  if (code >= 71 && code <= 77) return { condition: "snow", description: "Snowy" }
  if (code >= 80 && code <= 82) return { condition: "rain", description: "Showers" }
  if (code >= 95) return { condition: "thunderstorm", description: "Thunderstorm" }
  return { condition: "cloudy", description: "Cloudy" }
}

function calcLight(hour: number, cloud: number) {
  let base: number
  if (hour >= 6 && hour < 8) base = 40
  else if (hour >= 8 && hour < 10) base = 70
  else if (hour >= 10 && hour < 16) base = 95
  else if (hour >= 16 && hour < 18) base = 60
  else if (hour >= 18 && hour < 20) base = 30
  else base = 10
  const final = Math.max(5, Math.min(100, base - (cloud / 100) * 40))
  const label = final < 20 ? "Very Low" : final < 40 ? "Low" : final < 60 ? "Medium" : final < 80 ? "High" : "Very High"
  return { level: Math.round(final), label }
}
