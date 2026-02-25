"use client"

import { Radio, Thermometer, Droplets, Wind, Sun, Cloud, CloudRain } from "lucide-react"
import type { ChatMessage, WeatherData } from "@/lib/weather"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-up`}>
      <div className={`max-w-[85%] ${isUser ? "order-1" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
              <Radio className="w-2.5 h-2.5 text-primary" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">WeatherLink</span>
          </div>
        )}

        <div
          className={`rounded-2xl px-3.5 py-2.5 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border rounded-bl-md"
          }`}
        >
          {!isUser && message.weatherData && (
            <WeatherMiniCard data={message.weatherData} />
          )}

          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
            isUser ? "text-primary-foreground" : "text-foreground"
          }`}>
            {message.content}
          </p>
        </div>

        <p className={`text-[9px] text-muted-foreground mt-1 ${isUser ? "text-right" : ""}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  )
}

function WeatherMiniCard({ data }: { data: WeatherData }) {
  const condIcon = () => {
    const c = "w-4 h-4"
    if (data.condition === "clear") return <Sun className={`${c} text-warning`} />
    if (data.condition === "rain") return <CloudRain className={`${c} text-info`} />
    return <Cloud className={`${c} text-muted-foreground`} />
  }

  return (
    <div className="grid grid-cols-2 gap-2 mb-2.5 p-2.5 rounded-xl bg-secondary/50">
      <div className="flex items-center gap-2">
        <Thermometer className="w-3.5 h-3.5 text-destructive" />
        <span className="text-xs text-foreground font-medium">{data.temperature}{"\u00B0C"}</span>
      </div>
      <div className="flex items-center gap-2">
        <Droplets className="w-3.5 h-3.5 text-info" />
        <span className="text-xs text-foreground font-medium">{data.humidity}%</span>
      </div>
      <div className="flex items-center gap-2">
        <Wind className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs text-foreground font-medium">{data.windSpeed} km/h</span>
      </div>
      <div className="flex items-center gap-2">
        {condIcon()}
        <span className="text-xs text-foreground font-medium capitalize">{data.conditionDescription}</span>
      </div>
    </div>
  )
}
