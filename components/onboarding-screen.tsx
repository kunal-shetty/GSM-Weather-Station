"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Radio, Thermometer, Droplets, Sun, Check, AlertCircle, Cpu, Wifi, WifiOff } from "lucide-react"
import type { UserData } from "@/app/page"

interface OnboardingScreenProps {
  onLogin: (userData: UserData) => void
}

const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+86", country: "China" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
]

export function OnboardingScreen({ onLogin }: OnboardingScreenProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    location: "",
    countryCode: "+91",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Min 2 characters"
        return ""
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required"
        if (!/^\d{10,}$/.test(value.replace(/\s/g, ""))) return "Min 10 digits required"
        return ""
      case "location":
        if (!value.trim()) return "Location is required"
        if (value.trim().length < 2) return "Enter valid location"
        return ""
      default:
        return ""
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name as keyof typeof formData]),
    }))
  }

  const isValid =
    formData.fullName.trim().length >= 2 &&
    /^\d{10,}$/.test(formData.phoneNumber.replace(/\s/g, "")) &&
    formData.location.trim().length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      // Generate a random station ID
      const stationId = `WS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      onLogin({ ...formData, stationId })
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative px-6 pt-12 pb-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-5 w-24 h-24 bg-info/5 rounded-full blur-2xl" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          {/* Logo */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <Radio className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary-foreground animate-blink" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">GSM Weather Station</h1>
          <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed">
            Automated weather monitoring for remote areas without internet connectivity
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-3">
          <FeatureChip icon={<Thermometer className="w-4 h-4" />} label="DHT11" color="text-destructive" />
          <FeatureChip icon={<Droplets className="w-4 h-4" />} label="Humidity" color="text-info" />
          <FeatureChip icon={<Sun className="w-4 h-4" />} label="LDR" color="text-warning" />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-6">
        <div className="bg-card rounded-3xl border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Station Setup</h2>
            <p className="text-sm text-muted-foreground mt-1">Configure your monitoring station</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Operator Name
              </Label>
              <div className="relative">
                <Input
                  id="fullName"
                  placeholder="Enter your name"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  className={`h-12 bg-input border-border rounded-xl pl-4 pr-10 transition-all ${
                    touched.fullName && errors.fullName
                      ? "border-destructive focus-visible:ring-destructive"
                      : touched.fullName && !errors.fullName
                        ? "border-primary"
                        : ""
                  }`}
                />
                {touched.fullName && !errors.fullName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              {touched.fullName && errors.fullName && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                GSM Phone Number
              </Label>
              <div className="flex gap-2">
                <Select value={formData.countryCode} onValueChange={(value) => handleChange("countryCode", value)}>
                  <SelectTrigger className="w-[90px] h-12 bg-input border-border rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value.replace(/\D/g, ""))}
                    onBlur={() => handleBlur("phoneNumber")}
                    className={`h-12 bg-input border-border rounded-xl pl-4 pr-10 transition-all ${
                      touched.phoneNumber && errors.phoneNumber
                        ? "border-destructive focus-visible:ring-destructive"
                        : touched.phoneNumber && !errors.phoneNumber
                          ? "border-primary"
                          : ""
                    }`}
                  />
                  {touched.phoneNumber && !errors.phoneNumber && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-foreground">
                Station Location
              </Label>
              <div className="relative">
                <Input
                  id="location"
                  placeholder="City or area name"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  onBlur={() => handleBlur("location")}
                  className={`h-12 bg-input border-border rounded-xl pl-4 pr-10 transition-all ${
                    touched.location && errors.location
                      ? "border-destructive focus-visible:ring-destructive"
                      : touched.location && !errors.location
                        ? "border-primary"
                        : ""
                  }`}
                />
                {touched.location && !errors.location && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              {touched.location && errors.location && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.location}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-base rounded-xl mt-4 transition-all"
            >
              <Radio className="w-5 h-5 mr-2" />
              Initialize Station
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Works offline with local sensors | GSM SMS communication
        </p>
      </div>
    </div>
  )
}

function FeatureChip({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border border-border">
      <div className={color}>{icon}</div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  )
}
