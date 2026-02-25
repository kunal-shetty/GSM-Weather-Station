"use client"

import { Wifi, WifiOff } from "lucide-react"

interface Props {
  isOnline: boolean
  gsmSignal: number
}

export function NetworkStatus({ isOnline, gsmSignal }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex items-center gap-1 px-1.5 py-1 rounded-md ${
          isOnline ? "bg-primary/10" : "bg-destructive/10"
        }`}
      >
        {isOnline ? (
          <Wifi className="w-3 h-3 text-primary" />
        ) : (
          <WifiOff className="w-3 h-3 text-destructive" />
        )}
      </div>

      <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-secondary">
        <span className="text-[9px] text-muted-foreground font-semibold mr-0.5">GSM</span>
        <div className="flex items-end gap-px">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-[3px] rounded-sm transition-colors duration-300 ${
                level <= gsmSignal ? "bg-primary" : "bg-muted"
              }`}
              style={{ height: `${level * 3 + 2}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
