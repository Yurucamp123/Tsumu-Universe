"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface ExpansionTransitionProps {
  onComplete: () => void
}

export function ExpansionTransition({ onComplete }: ExpansionTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isFading, setIsFading] = useState(false)
  const animationRef = useRef<number | null>(null)

  const handleComplete = useCallback(() => {
    onComplete()
  }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // More stars with better distribution
    const stars = Array.from({ length: 500 }, () => {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 0.4
      return {
        x: 0.5 + Math.cos(angle) * radius * 0.2,
        y: 0.5 + Math.sin(angle) * radius * 0.2,
        z: 0.1 + Math.random() * 0.9,
        size: 0.4 + Math.random() * 2.5,
        isGold: Math.random() > 0.7,
        isPurple: Math.random() > 0.92,
        brightness: 0.4 + Math.random() * 0.6,
        trail: [] as { x: number; y: number }[],
      }
    })

    const startTime = Date.now()
    const duration = 2500

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing: ease out cubic for smoother acceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw central glow that fades
      const centralGlowOpacity = 1 - progress
      const centralGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200)
      centralGrad.addColorStop(0, `rgba(251, 191, 36, ${centralGlowOpacity * 0.5})`)
      centralGrad.addColorStop(0.5, `rgba(234, 88, 12, ${centralGlowOpacity * 0.3})`)
      centralGrad.addColorStop(1, "transparent")
      ctx.fillStyle = centralGrad
      ctx.beginPath()
      ctx.arc(centerX, centerY, 200, 0, Math.PI * 2)
      ctx.fill()

      // Draw expanding stars with trails
      stars.forEach((star) => {
        const expansion = 1 + easeProgress * 6 * star.z
        const dx = (star.x - 0.5) * canvas.width * expansion
        const dy = (star.y - 0.5) * canvas.height * expansion
        const x = centerX + dx
        const y = centerY + dy

        // Skip if off-screen
        if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) return

        // Store trail points
        star.trail.push({ x, y })
        if (star.trail.length > 6) star.trail.shift()

        const size = star.size * (1 + easeProgress * star.z * 0.8)
        const alpha = star.brightness * (1 - progress * 0.4)

        // Determine colors
        let coreColor: string
        let glowColor: string
        if (star.isGold) {
          coreColor = `rgba(251, 191, 36, ${alpha})`
          glowColor = `rgba(251, 191, 36, ${alpha * 0.5})`
        } else if (star.isPurple) {
          coreColor = `rgba(196, 181, 253, ${alpha})`
          glowColor = `rgba(167, 139, 250, ${alpha * 0.5})`
        } else {
          coreColor = `rgba(255, 255, 255, ${alpha})`
          glowColor = `rgba(200, 210, 255, ${alpha * 0.4})`
        }

        // Draw trail (speed line effect)
        if (star.trail.length > 1 && progress > 0.1) {
          ctx.beginPath()
          ctx.moveTo(star.trail[0].x, star.trail[0].y)
          for (let i = 1; i < star.trail.length; i++) {
            ctx.lineTo(star.trail[i].x, star.trail[i].y)
          }
          ctx.strokeStyle = glowColor
          ctx.lineWidth = size * 0.6
          ctx.lineCap = "round"
          ctx.stroke()
        }

        // Glow
        if (size > 1) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
          gradient.addColorStop(0, glowColor)
          gradient.addColorStop(1, "transparent")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, size * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Core
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = coreColor
        ctx.fill()
      })

      // Radial speed lines
      if (progress > 0.15) {
        const lineAlpha = ((progress - 0.15) / 0.85) * 0.35
        for (let i = 0; i < 48; i++) {
          const angle = (i / 48) * Math.PI * 2
          const innerR = 40 + easeProgress * 200
          const outerR = innerR + 60 + easeProgress * 250

          const gradient = ctx.createLinearGradient(
            centerX + Math.cos(angle) * innerR,
            centerY + Math.sin(angle) * innerR,
            centerX + Math.cos(angle) * outerR,
            centerY + Math.sin(angle) * outerR,
          )
          gradient.addColorStop(0, "transparent")
          gradient.addColorStop(0.3, `rgba(251, 191, 36, ${lineAlpha})`)
          gradient.addColorStop(1, "transparent")

          ctx.beginPath()
          ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR)
          ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR)
          ctx.strokeStyle = gradient
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsFading(true)
        setTimeout(handleComplete, 700)
      }
    }

    // Start after brief delay
    const startTimer = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate)
    }, 200)

    return () => {
      clearTimeout(startTimer)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [handleComplete])

  return (
    <div
      className={`absolute inset-0 bg-black transition-opacity duration-600 ${isFading ? "opacity-0" : "opacity-100"}`}
    >
      {/* Initial signature that explodes */}
      <div className="absolute inset-0 flex items-center justify-center signature-explode">
        <h1
          className="text-8xl md:text-[10rem] font-serif"
          style={{
            background: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f59e0b 60%, #ea580c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 60px rgba(251, 191, 36, 1))",
          }}
        >
          つむ
        </h1>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0, 0, 0, 0.8) 100%)" }}
      />

      <style jsx>{`
        .signature-explode {
          animation: signatureExplode 0.6s ease-out forwards;
        }
        @keyframes signatureExplode {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2); filter: blur(20px); }
        }
      `}</style>
    </div>
  )
}
