"use client"

import { useEffect, useState } from "react"
import { getJapanHour, isJapanDaytime } from "@/utils/time"

interface Props {
  emotionalColor?: string
  onAtmosphereChange: (colors: { primary: string; accent: string; glow: string }) => void
}

/**
 * Real-time Atmosphere - Manages environment colors based on Japan time
 * Daytime (6-18 JST): Warm colors (Gold, Orange)
 * Nighttime (18-6 JST): Cool colors (Navy, Purple)
 */
export function RealTimeAtmosphere({ emotionalColor, onAtmosphereChange }: Props) {
  const [isDaytime, setIsDaytime] = useState(true)

  useEffect(() => {
    const updateAtmosphere = () => {
      const hour = getJapanHour()
      const isDayTime = isJapanDaytime()
      setIsDaytime(isDayTime)

      // Calculate smooth transition (0-1)
      let timeProgress = 0
      if (isDayTime) {
        // 6:00 - 18:00
        timeProgress = (hour - 6) / 12
      } else {
        // 18:00 - 6:00 (next day)
        if (hour >= 18) {
          timeProgress = (hour - 18) / 12
        } else {
          timeProgress = (hour + 6) / 12
        }
      }

      // If emotional color is set (from song), use it
      if (emotionalColor) {
        onAtmosphereChange({
          primary: emotionalColor,
          accent: emotionalColor.replace(/[^,]*\)/, `0.7)`).replace("rgb", "rgba"),
          glow: emotionalColor.replace(/[^,]*\)/, `0.5)`).replace("rgb", "rgba"),
        })
        return
      }

      // Otherwise, use time-based colors with smooth transitions
      if (isDayTime) {
        // Daytime: Warm colors (Gold #FFD700 -> Orange #FF8C00)
        // 6:00 = pure gold, 18:00 = deep orange
        const r = Math.round(255 - 39 * timeProgress) // 255 -> 216
        const g = Math.round(215 - 79 * timeProgress)   // 215 -> 136
        const b = Math.round(0)                         // 0

        const primary = `rgb(${r}, ${g}, ${b})`
        const accent = `rgba(${r}, ${g}, ${b}, 0.7)`
        const glow = `rgba(${r}, ${g}, ${b}, 0.5)`

        onAtmosphereChange({ primary, accent, glow })
      } else {
        // Nighttime: Cool colors (Navy #0B0033 -> Purple #4B0082)
        // 18:00 = navy, 6:00 = deep purple
        const r = Math.round(11 + 64 * timeProgress)   // 11 -> 75
        const g = Math.round(0)                         // 0
        const b = Math.round(51 + 79 * timeProgress)    // 51 -> 130

        const primary = `rgb(${r}, ${g}, ${b})`
        const accent = `rgba(${r}, ${g}, ${b}, 0.7)`
        const glow = `rgba(${r}, ${g}, ${b}, 0.5)`

        onAtmosphereChange({ primary, accent, glow })
      }
    }

    updateAtmosphere()
    const interval = setInterval(updateAtmosphere, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [emotionalColor, onAtmosphereChange])

  return null
}
