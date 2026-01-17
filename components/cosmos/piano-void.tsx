"use client"

import { useEffect, useRef } from "react"
import { playRandomNote } from "@/utils/audio"

interface Props {
  atmosphereColor: string
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
}

export function PianoVoid({ atmosphereColor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const animationRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)

  const scaleRef = useRef(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitializedRef.current) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    isInitializedRef.current = true

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const isMobile = window.innerWidth < 768
      const baseScale = window.innerWidth / 1920
      scaleRef.current = isMobile ? Math.max(baseScale * 1.5, 0.5) : Math.max(baseScale, 0.6)
    }
    resize()

    let lastTime = performance.now()

    const handleClick = (e: MouseEvent) => {
      // Check if click is on a star
      const target = e.target as HTMLElement
      if (target.closest('[data-star-canvas]')) {
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: (160 + Math.random() * 30) * scaleRef.current,
        opacity: 1,
      })

      playRandomNote()
    }

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 1.5)
      lastTime = currentTime

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw ripples
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 3.5 * scaleRef.current * deltaTime
        const progress = ripple.radius / ripple.maxRadius
        ripple.opacity = Math.max(0, 1 - Math.pow(progress, 1.4))

        if (ripple.opacity <= 0.01) return false

        // Draw ring
        ctx.strokeStyle = atmosphereColor.replace(")", `, ${ripple.opacity * 0.5})`).replace("rgb", "rgba")
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        ctx.stroke()

        // Draw glow
        const innerRadius = Math.max(0, ripple.radius * 0.75)
        const outerRadius = ripple.radius * 1.15
        const gradient = ctx.createRadialGradient(ripple.x, ripple.y, innerRadius, ripple.x, ripple.y, outerRadius)
        const glowAlpha = Math.max(0, Math.min(1, ripple.opacity * 0.3))
        gradient.addColorStop(0, atmosphereColor.replace(")", `, ${glowAlpha})`).replace("rgb", "rgba"))
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, outerRadius, 0, Math.PI * 2)
        ctx.fill()

        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate(performance.now())
    canvas.addEventListener("click", handleClick)
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("click", handleClick)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      isInitializedRef.current = false
    }
  }, [atmosphereColor])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-pointer z-1"
    />
  )
}
