"use client"

import { useRef, useEffect, useState, useCallback } from "react"

interface StardustSignatureProps {
  clickPosition: { x: number; y: number }
  onComplete: () => void
}

export function StardustSignature({ clickPosition, onComplete }: StardustSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<"shockwave" | "gathering" | "glowing">("shockwave")
  const [showSignature, setShowSignature] = useState(false)
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
    const clickX = clickPosition.x * canvas.width
    const clickY = clickPosition.y * canvas.height

    // More particles with better distribution
    const particles = Array.from({ length: 300 }, (_, i) => {
      const angle = (i / 300) * Math.PI * 2 + Math.random() * 0.5
      const targetRadius = 15 + Math.random() * 140
      const startRadius = 80 + Math.random() * 300
      const startAngle = Math.random() * Math.PI * 2
      return {
        x: clickX + Math.cos(startAngle) * startRadius,
        y: clickY + Math.sin(startAngle) * startRadius,
        targetX: centerX + Math.cos(angle) * targetRadius,
        targetY: centerY + Math.sin(angle) * targetRadius,
        size: 0.8 + Math.random() * 3,
        speed: 0.012 + Math.random() * 0.02,
        progress: 0,
        hue: Math.random() > 0.2 ? 35 + Math.random() * 25 : 270 + Math.random() * 40,
        brightness: 0.5 + Math.random() * 0.5,
        trail: [] as { x: number; y: number }[],
      }
    })

    // Outer ring particles
    const outerParticles = Array.from({ length: 80 }, (_, i) => {
      const angle = (i / 80) * Math.PI * 2
      return {
        x: clickX + (Math.random() - 0.5) * 400,
        y: clickY + (Math.random() - 0.5) * 400,
        targetX: centerX + Math.cos(angle) * (160 + Math.random() * 40),
        targetY: centerY + Math.sin(angle) * (160 + Math.random() * 40),
        size: 0.4 + Math.random() * 1.2,
        speed: 0.008 + Math.random() * 0.012,
        progress: 0,
        hue: 45,
        brightness: 0.3 + Math.random() * 0.4,
        trail: [] as { x: number; y: number }[],
      }
    })

    const allParticles = [...particles, ...outerParticles]

    let shockwaveRadius = 0
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Shockwave effect (first 800ms) - more dramatic
      if (elapsed < 800) {
        shockwaveRadius = (elapsed / 800) * Math.max(canvas.width, canvas.height) * 1.5
        const shockwaveOpacity = 1 - elapsed / 800

        // Multiple expanding rings with gradient
        for (let i = 0; i < 4; i++) {
          const ringRadius = shockwaveRadius * (1 - i * 0.12)
          const ringOpacity = shockwaveOpacity * (1 - i * 0.25)

          const innerRadius = Math.max(0, ringRadius - 10)
          const outerRadius = Math.max(1, ringRadius + 10)

          ctx.beginPath()
          ctx.arc(clickX, clickY, Math.max(0, ringRadius), 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(clickX, clickY, innerRadius, clickX, clickY, outerRadius)
          gradient.addColorStop(0, "transparent")
          gradient.addColorStop(0.5, `rgba(251, 191, 36, ${ringOpacity * 0.7})`)
          gradient.addColorStop(1, "transparent")
          ctx.strokeStyle = gradient
          ctx.lineWidth = 4 - i
          ctx.stroke()
        }

        // Chromatic aberration flash
        if (elapsed < 150) {
          const flashOpacity = (1 - elapsed / 150) * 0.7
          // RGB split effect
          ctx.fillStyle = `rgba(255, 100, 100, ${flashOpacity * 0.3})`
          ctx.fillRect(-5, 0, canvas.width, canvas.height)
          ctx.fillStyle = `rgba(100, 100, 255, ${flashOpacity * 0.3})`
          ctx.fillRect(5, 0, canvas.width, canvas.height)
          ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }

      // Particles gathering with trails
      if (elapsed > 200) {
        const gatherProgress = Math.min((elapsed - 200) / 2200, 1)

        allParticles.forEach((p) => {
          p.progress = Math.min(p.progress + p.speed, 1)
          const easeProgress = 1 - Math.pow(1 - p.progress * gatherProgress, 3)

          const x = p.x + (p.targetX - p.x) * easeProgress
          const y = p.y + (p.targetY - p.y) * easeProgress

          // Store trail
          p.trail.push({ x, y })
          if (p.trail.length > 8) p.trail.shift()

          const alpha = p.brightness * (0.4 + easeProgress * 0.6)

          // Draw trail
          if (p.trail.length > 1 && p.size > 1) {
            ctx.beginPath()
            ctx.moveTo(p.trail[0].x, p.trail[0].y)
            for (let i = 1; i < p.trail.length; i++) {
              ctx.lineTo(p.trail[i].x, p.trail[i].y)
            }
            ctx.strokeStyle = `hsla(${p.hue}, 100%, 70%, ${alpha * 0.3})`
            ctx.lineWidth = p.size * 0.5
            ctx.stroke()
          }

          // Glow effect
          if (p.size > 1) {
            const glowSize = p.size * 5
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
            gradient.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${alpha * 0.7})`)
            gradient.addColorStop(0.5, `hsla(${p.hue}, 100%, 65%, ${alpha * 0.3})`)
            gradient.addColorStop(1, "transparent")
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(x, y, glowSize, 0, Math.PI * 2)
            ctx.fill()
          }

          // Core
          ctx.beginPath()
          ctx.arc(x, y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${p.hue}, 100%, ${70 + p.brightness * 25}%, ${alpha})`
          ctx.fill()
        })
      }

      if (elapsed < 5000) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    // Phase transitions
    const timer1 = setTimeout(() => setPhase("gathering"), 800)
    const timer2 = setTimeout(() => {
      setShowSignature(true)
      setPhase("glowing")
    }, 2500)
    const timer3 = setTimeout(handleComplete, 5500)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [clickPosition, handleComplete])

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Signature text with enhanced glow */}
      {showSignature && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative signature-appear">
            {/* Outer glow layers */}
            <div className="absolute inset-0 -m-8 flex items-center justify-center">
              <div
                className="w-96 h-96 rounded-full signature-glow"
                style={{ background: "radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)" }}
              />
            </div>

            <h1
              className="text-8xl md:text-[10rem] font-serif relative"
              style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f59e0b 60%, #ea580c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 60px rgba(251, 191, 36, 1)) drop-shadow(0 0 120px rgba(251, 191, 36, 0.6))",
              }}
            >
              つむ
            </h1>
          </div>
        </div>
      )}

      {/* Animated glow pulse */}
      {phase === "glowing" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[30rem] h-[30rem] md:w-[36rem] md:h-[36rem] rounded-full glow-pulse"
            style={{
              background:
                "radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, rgba(234, 88, 12, 0.1) 40%, transparent 70%)",
            }}
          />
        </div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.8) 100%)" }}
      />

      <style jsx>{`
        .signature-appear {
          animation: signatureAppear 1.2s ease-out both;
        }
        .signature-glow {
          animation: glowPulse 2s ease-in-out infinite;
        }
        .glow-pulse {
          animation: glowPulse 2.5s ease-in-out infinite;
        }
        @keyframes signatureAppear {
          0% { opacity: 0; transform: scale(0.5); filter: blur(10px); }
          50% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
