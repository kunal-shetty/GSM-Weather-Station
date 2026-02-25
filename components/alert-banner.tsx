"use client"

import { AlertTriangle, Info, XCircle } from "lucide-react"
import type { WeatherAlert } from "@/lib/weather"

interface Props {
  alert: WeatherAlert
}

const config = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/10",
    border: "border-warning/20",
    color: "text-warning",
  },
  danger: {
    icon: XCircle,
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    color: "text-destructive",
  },
  info: {
    icon: Info,
    bg: "bg-info/10",
    border: "border-info/20",
    color: "text-info",
  },
}

export function AlertBanner({ alert }: Props) {
  const c = config[alert.type]
  const Icon = c.icon

  return (
    <div
      className={`flex items-center gap-2.5 p-2.5 rounded-xl ${c.bg} border ${c.border} animate-fade-up`}
    >
      <Icon className={`w-4 h-4 ${c.color} flex-shrink-0`} />
      <p className="text-xs text-foreground flex-1">{alert.message}</p>
    </div>
  )
}
