"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Radio, Check, Loader2, Send, AlertTriangle, MessageSquare, Zap } from "lucide-react"
import type { UserData } from "@/app/page"
import type { WeatherData, Alert } from "@/components/weather-dashboard"

interface GsmModalProps {
  user: UserData
  weather: WeatherData
  alerts: Alert[]
  gsmSignal: number
  onClose: () => void
}

type TransmitState = "idle" | "connecting" | "sending" | "success" | "error"

export function GsmModal({ user, weather, alerts, gsmSignal, onClose }: GsmModalProps) {
  const [state, setState] = useState<TransmitState>("idle")
  const [currentSignal, setCurrentSignal] = useState(0)
  const [progress, setProgress] = useState(0)

  const phoneNumber = `${user.countryCode}${user.phoneNumber}`

  const smsMessage = `[GSM WEATHER STATION]
Station: ${user.stationId}
Location: ${user.location}
Time: ${weather.lastUpdated}
Source: ${weather.source === "sensor" ? "Local Sensors" : "API"}

READINGS:
Temp: ${weather.temperature}C (feels ${weather.feelsLike}C)
Humidity: ${weather.humidity}%
Light: ${weather.lightLevel}% (${weather.lightLabel})
Condition: ${weather.conditionDescription}

${alerts.length > 0 ? `ALERTS:\n${alerts.map((a) => `! ${a.message}`).join("\n")}` : "STATUS: Normal"}

---
GSM Weather Monitor v1.0`

  const simulateTransmission = async () => {
    setState("connecting")
    setProgress(0)

    // Simulate GSM network connection
    for (let i = 0; i <= 4; i++) {
      await new Promise((r) => setTimeout(r, 250))
      setCurrentSignal(i)
      setProgress(i * 10)
    }

    setState("sending")

    // Simulate data transmission
    for (let i = 40; i <= 100; i += 5) {
      await new Promise((r) => setTimeout(r, 80))
      setProgress(i)
    }

    // 95% success rate
    if (Math.random() > 0.05) {
      setState("success")

      // Save to SMS queue/history
      const history = JSON.parse(localStorage.getItem("gsm-sms-history") || "[]")
      history.unshift({
        id: Date.now(),
        phone: phoneNumber,
        message: smsMessage,
        timestamp: new Date().toISOString(),
        status: "delivered",
      })
      localStorage.setItem("gsm-sms-history", JSON.stringify(history.slice(0, 10)))
    } else {
      setState("error")
    }
  }

  useEffect(() => {
    simulateTransmission()
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-end sm:items-center justify-center">
      <div
        className="w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                state === "success" ? "bg-primary/10" : state === "error" ? "bg-destructive/10" : "bg-secondary"
              }`}
            >
              <Radio
                className={`w-5 h-5 ${
                  state === "success"
                    ? "text-primary"
                    : state === "error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                } ${state === "connecting" || state === "sending" ? "animate-pulse" : ""}`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">GSM Transmission</h3>
              <p className="text-xs text-muted-foreground">SMS Gateway Simulation</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Signal & Progress */}
          <div className="p-4 rounded-2xl bg-secondary/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Network Signal</span>
              <div className="flex items-end gap-0.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-1.5 rounded-sm transition-all duration-300 ${
                      level <= currentSignal ? "bg-primary" : "bg-muted"
                    }`}
                    style={{ height: `${level * 4 + 4}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  state === "error" ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {state === "connecting" && "Connecting to GSM network..."}
              {state === "sending" && "Transmitting data..."}
              {state === "success" && "Transmission complete"}
              {state === "error" && "Transmission failed"}
            </p>
          </div>

          {/* Status Display */}
          <div className="flex items-center justify-center py-4">
            {(state === "connecting" || state === "sending") && (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                  <div
                    className="absolute -inset-2 rounded-3xl border-2 border-primary/30 animate-ping"
                    style={{ animationDuration: "1.5s" }}
                  />
                </div>
              </div>
            )}
            {state === "success" && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Message Sent!</p>
                  <p className="text-xs text-muted-foreground mt-1">Delivered to {phoneNumber}</p>
                </div>
              </div>
            )}
            {state === "error" && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Transmission Failed</p>
                  <p className="text-xs text-muted-foreground mt-1">Network error - retry</p>
                </div>
              </div>
            )}
          </div>

          {/* SMS Preview */}
          <div className="rounded-2xl bg-secondary/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">SMS Content</span>
              <span className="ml-auto text-xs text-muted-foreground">{smsMessage.length} chars</span>
            </div>
            <pre className="text-xs text-foreground font-mono whitespace-pre-wrap p-4 max-h-40 overflow-y-auto leading-relaxed">
              {smsMessage}
            </pre>
          </div>

          {/* Simulation Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-info/10 border border-info/20">
            <Zap className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <span className="text-info font-medium">Demo Mode:</span> This simulates GSM SIM800L module transmission.
              In production, this sends actual SMS via AT commands.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          {state === "success" || state === "error" ? (
            <div className="flex gap-3">
              {state === "error" && (
                <Button
                  variant="outline"
                  className="flex-1 h-12 bg-transparent border-border"
                  onClick={() => {
                    setState("idle")
                    setCurrentSignal(0)
                    setProgress(0)
                    simulateTransmission()
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              )}
              <Button className="flex-1 h-12 bg-primary text-primary-foreground" onClick={onClose}>
                {state === "success" ? "Done" : "Close"}
              </Button>
            </div>
          ) : (
            <Button disabled className="w-full h-12 bg-secondary" variant="outline">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Transmitting...
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
