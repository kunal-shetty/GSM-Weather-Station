"use client"

import { AlertTriangle, Info, XCircle } from "lucide-react"
import type { Alert } from "@/components/weather-dashboard"

interface AlertBannerProps {
  alert: Alert
}

export function AlertBanner({ alert }: AlertBannerProps) {
  const config = {
    warning: {
      icon: AlertTriangle,
      bg: "bg-warning/10",
      border: "border-warning/20",
      iconColor: "text-warning",
      dotColor: "bg-warning",
    },
    danger: {
      icon: XCircle,
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      iconColor: "text-destructive",
      dotColor: "bg-destructive",
    },
    info: {
      icon: Info,
      bg: "bg-info/10",
      border: "border-info/20",
      iconColor: "text-info",
      dotColor: "bg-info",
    },
  }

  const { icon: Icon, bg, border, iconColor, dotColor } = config[alert.type]

  return (
    <div
      className={`p-3 rounded-xl ${bg} border ${border} flex items-center gap-3 animate-in slide-in-from-top-2 duration-300`}
    >
      <div className="relative">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
      </div>
      <p className="text-sm text-foreground flex-1">{alert.message}</p>
    </div>
  )
}
