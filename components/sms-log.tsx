"use client"

import { useState, useEffect } from "react"
import { ScrollText, Clock, Phone, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { type UserData, type SmsRecord } from "@/lib/weather"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  user: UserData
}

export function SmsLog({ user }: Props) {
  const [logs, setLogs] = useState<SmsRecord[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("gsm-sms-history")
    if (saved) {
      setLogs(JSON.parse(saved))
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">SMS Transmission Log</h2>
          <p className="text-xs text-muted-foreground">History of weather reports sent via GSM</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <ScrollText className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {logs.length === 0 ? (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <ScrollText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No SMS records found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Your GSM transmissions will appear here once you send a weather report.
              </p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-semibold">{log.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {log.status === "delivered" ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered
                      </span>
                    ) : log.status === "failed" ? (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
                        <XCircle className="w-3 h-3" />
                        Failed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-warning">
                        <AlertCircle className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed bg-background/50 p-3 rounded-lg border border-border">
                    {log.message}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </div>
                    {log.alertCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-semibold">
                        {log.alertCount} Alerts Included
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ).reverse()}
      </div>
    </div>
  )
}
