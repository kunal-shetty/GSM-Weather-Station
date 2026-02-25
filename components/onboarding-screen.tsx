"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Radio,
  Thermometer,
  Droplets,
  Sun,
  Check,
  AlertCircle,
  Signal,
} from "lucide-react"
import type { UserData } from "@/lib/weather"

interface Props {
  onLogin: (data: UserData) => void
}

const codes = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
  { code: "+86", country: "CN" },
  { code: "+49", country: "DE" },
]

export function OnboardingScreen({ onLogin }: Props) {
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
    countryCode: "+91",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = (name: string, value: string) => {
    if (name === "fullName") return !value.trim() ? "Required" : value.trim().length < 2 ? "Min 2 chars" : ""
    if (name === "phoneNumber") return !value.trim() ? "Required" : !/^\d{10,}$/.test(value.replace(/\s/g, "")) ? "Min 10 digits" : ""
    if (name === "location") return !value.trim() ? "Required" : value.trim().length < 2 ? "Enter valid location" : ""
    return ""
  }

  const onChange = (name: string, value: string) => {
    setForm((p) => ({ ...p, [name]: value }))
    if (touched[name]) setErrors((p) => ({ ...p, [name]: validate(name, value) }))
  }

  const onBlur = (name: string) => {
    setTouched((p) => ({ ...p, [name]: true }))
    setErrors((p) => ({ ...p, [name]: validate(name, form[name as keyof typeof form]) }))
  }

  const isValid =
    form.fullName.trim().length >= 2 &&
    /^\d{10,}$/.test(form.phoneNumber.replace(/\s/g, "")) &&
    form.location.trim().length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    const stationId = `WS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    onLogin({ ...form, stationId })
  }

  return (
    <main className="min-h-dvh bg-background flex flex-col">
      {/* Hero */}
      <div className="relative px-6 pt-14 pb-8 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-8 left-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-16 right-4 w-28 h-28 bg-info/5 rounded-full blur-2xl" />
        </div>

        <div className="relative flex flex-col items-center">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Radio className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight text-balance">
            GSM WeatherLink
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-[260px] leading-relaxed text-pretty">
            Automated weather monitoring for remote areas. No internet required.
          </p>
        </div>
      </div>

      {/* Sensor chips */}
      <div className="px-6 pb-5">
        <div className="flex items-center justify-center gap-3">
          {[
            { icon: Thermometer, label: "DHT11", cls: "text-destructive bg-destructive/10" },
            { icon: Droplets, label: "Humidity", cls: "text-info bg-info/10" },
            { icon: Sun, label: "LDR", cls: "text-warning bg-warning/10" },
            { icon: Signal, label: "GSM", cls: "text-primary bg-primary/10" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.cls}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-base font-semibold text-foreground mb-1">Station Setup</h2>
          <p className="text-xs text-muted-foreground mb-5">Register your monitoring station</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              id="fullName"
              label="Operator Name"
              placeholder="Your name"
              value={form.fullName}
              error={touched.fullName ? errors.fullName : undefined}
              valid={touched.fullName && !errors.fullName}
              onChange={(v) => onChange("fullName", v)}
              onBlur={() => onBlur("fullName")}
            />

            {/* Phone with country code */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">GSM Phone Number</Label>
              <div className="flex gap-2">
                <Select value={form.countryCode} onValueChange={(v) => onChange("countryCode", v)}>
                  <SelectTrigger className="w-[80px] h-11 bg-input border-border rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {codes.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phoneNumber}
                    onChange={(e) => onChange("phoneNumber", e.target.value.replace(/\D/g, ""))}
                    onBlur={() => onBlur("phoneNumber")}
                    className={`h-11 bg-input border-border rounded-lg text-sm pr-9 ${
                      touched.phoneNumber && errors.phoneNumber
                        ? "border-destructive"
                        : touched.phoneNumber && !errors.phoneNumber
                          ? "border-primary"
                          : ""
                    }`}
                  />
                  <ValidIcon show={!!touched.phoneNumber && !errors.phoneNumber} />
                </div>
              </div>
              <ErrorMsg msg={touched.phoneNumber ? errors.phoneNumber : undefined} />
            </div>

            <Field
              id="location"
              label="Station Location"
              placeholder="City or area name"
              value={form.location}
              error={touched.location ? errors.location : undefined}
              valid={touched.location && !errors.location}
              onChange={(v) => onChange("location", v)}
              onBlur={() => onBlur("location")}
            />

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 font-semibold rounded-xl mt-1"
            >
              <Signal className="w-4 h-4 mr-2" />
              Initialize Station
            </Button>
          </form>
        </div>
      </div>

      <footer className="px-6 py-3 border-t border-border">
        <p className="text-[10px] text-center text-muted-foreground">
          Works offline with local sensors &middot; GSM SMS communication
        </p>
      </footer>
    </main>
  )
}

/* ── Small helper components ── */
function Field({
  id, label, placeholder, value, error, valid, onChange, onBlur,
}: {
  id: string; label: string; placeholder: string; value: string
  error?: string; valid: boolean
  onChange: (v: string) => void; onBlur: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`h-11 bg-input border-border rounded-lg text-sm pr-9 ${
            error ? "border-destructive" : valid ? "border-primary" : ""
          }`}
        />
        <ValidIcon show={valid} />
      </div>
      <ErrorMsg msg={error} />
    </div>
  )
}

function ValidIcon({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
      <Check className="w-3 h-3 text-primary-foreground" />
    </div>
  )
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="text-destructive text-[11px] flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {msg}
    </p>
  )
}
