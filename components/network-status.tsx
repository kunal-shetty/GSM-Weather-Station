"use client"

import { Wifi, WifiOff } from "lucide-react"

interface NetworkStatusProps {
  isOnline: boolean
  gsmSignal: number
}

export function NetworkStatus({ isOnline, gsmSignal }: NetworkStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Internet Status */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isOnline ? "bg-primary/10" : "bg-destructive/10"}`}
      >
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-primary" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-destructive" />
        )}
      </div>

      {/* GSM Signal Bars */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary">
        <span className="text-[10px] text-muted-foreground font-medium mr-1">GSM</span>
        <div className="flex items-end gap-0.5">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-1 rounded-sm transition-all duration-300 ${level <= gsmSignal ? "bg-primary" : "bg-muted"}`}
              style={{ height: `${level * 3 + 2}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
