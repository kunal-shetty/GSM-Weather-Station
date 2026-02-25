"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Send,
  Trash2,
} from "lucide-react"
import {
  type UserData,
  type WeatherData,
  type ChatMessage,
  fetchWeatherFromAPI,
  readLocalSensors,
} from "@/lib/weather"
import { MessageBubble } from "./MessageBubble"

interface Props {
  user: UserData
  currentWeather: WeatherData | null
}

export function WeatherChat({ user, currentWeather }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history
  useEffect(() => {
    const saved = localStorage.getItem("gsm-chat-history")
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      // Welcome message
      setMessages([
        {
          id: "welcome",
          role: "bot",
          content:
            "Welcome to GSM WeatherLink Chat. Type a city name to get weather data, or type \"status\" to see your current station readings.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    }
  }, [])

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  // Save chat
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("gsm-chat-history", JSON.stringify(messages))
    }
  }, [messages])

  const addMessage = useCallback(
    (role: "user" | "bot", content: string, weatherData?: WeatherData) => {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        role,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        weatherData,
      }
      setMessages((prev) => [...prev, msg])
    },
    []
  )

  const handleSend = async () => {
    const query = input.trim()
    if (!query) return
    setInput("")

    // Add user message
    addMessage("user", query)
    setTyping(true)

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 1200))

    if (query.toLowerCase() === "status" || query.toLowerCase() === "current") {
      if (currentWeather) {
        addMessage(
          "bot",
          formatWeatherResponse(user.location, currentWeather),
          currentWeather
        )
      } else {
        addMessage("bot", "No current station data available. Try refreshing from the Dashboard tab.")
      }
      setTyping(false)
      return
    }

    if (query.toLowerCase() === "help") {
      addMessage(
        "bot",
        "Available commands:\n- Type any city name to fetch weather\n- \"status\" - Current station data\n- \"help\" - Show this message\n- \"clear\" - Clear chat history"
      )
      setTyping(false)
      return
    }

    if (query.toLowerCase() === "clear") {
      setMessages([])
      localStorage.removeItem("gsm-chat-history")
      addMessage("bot", "Chat history cleared.")
      setTyping(false)
      return
    }

    // Parse command
    let searchQuery = query.toLowerCase()
    
    // Check for "get weather" command
    if (searchQuery === "get weather") {
      searchQuery = "mumbai" // default to Mumbai as requested
    } else if (searchQuery.startsWith("get weather ")) {
      searchQuery = searchQuery.replace("get weather ", "").trim()
    } else if (searchQuery.startsWith("weather in ")) {
      searchQuery = searchQuery.replace("weather in ", "").trim()
    }

    // Fetch weather for entered city (from dummy data)
    const data = await fetchWeatherFromAPI(searchQuery)
    if (data) {
      addMessage("bot", formatWeatherResponse(searchQuery, data), data)
    } else {
      addMessage(
        "bot",
        `❌ Invalid: Could not find weather data for "${searchQuery}". Please try cities like Mumbai, Delhi, or London.`
      )
    }
    setTyping(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    if (confirm("Clear all chat history?")) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          content: "Chat cleared. Type a city name to query weather data.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      localStorage.removeItem("gsm-chat-history")
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)]">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div>
          <p className="text-sm font-semibold text-foreground">Weather Assistant</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] text-muted-foreground">Online & Looking for data</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {typing && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-border bg-background">
        <div className="relative flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search city (e.g. Mumbai)..."
            disabled={typing}
            className="h-11 bg-input border-border rounded-xl text-sm pl-4 pr-12 focus:ring-1 focus:ring-primary/20"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || typing}
            size="icon"
            className="absolute right-1 w-9 h-9 rounded-lg bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-up">
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
      </div>
    </div>
  )
}

function formatWeatherResponse(city: string, data: WeatherData): string {
  const icon = data.condition === "clear" ? "☀️" : data.condition === "rain" ? "🌧️" : "☁️"
  return `${icon} Weather in ${city}
🌡️ Temp: ${data.temperature}°C
💧 Humidity: ${data.humidity}%
🌬️ Wind: ${data.windSpeed} km/h
✨ Condition: ${data.conditionDescription}`
}

