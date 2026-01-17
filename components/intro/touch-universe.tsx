"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"

interface TouchUniverseProps {
  onTouch: (x: number, y: number) => void
}

export function TouchUniverse({ onTouch }: TouchUniverseProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [clickEnabled, setClickEnabled] = useState(false)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const animationRef = useRef<number | null>(null)

  // Play piano note on click
  const playNote = useCallback(() => {
    try {
      const audioContext = new (
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 523.25 // C5 note
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1.2)
    } catch {
      // Audio not supported
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || !clickEnabled) return
      playNote()

      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      onTouch(x, y)
    },
    [onTouch, playNote, clickEnabled],
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // More stars with better distribution
    const stars = Array.from({ length: 250 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.3 + Math.random() * 2.5,
      speed: 0.3 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      isGold: Math.random() > 0.8,
      isPurple: Math.random() > 0.95,
    }))

    // Orbiting particles around button
    const orbitParticles = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: 120 + Math.random() * 40,
      speed: 0.2 + Math.random() * 0.3,
      size: 1 + Math.random() * 2,
    }))

    let time = 0
    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw nebula gradient
      const nebulaGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.5)
      nebulaGrad.addColorStop(0, "rgba(139, 92, 246, 0.08)")
      nebulaGrad.addColorStop(0.4, "rgba(236, 72, 153, 0.04)")
      nebulaGrad.addColorStop(0.7, "rgba(251, 191, 36, 0.02)")
      nebulaGrad.addColorStop(1, "transparent")
      ctx.fillStyle = nebulaGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars with twinkling
      stars.forEach((star, i) => {
        const twinkle = 0.4 + 0.6 * Math.sin(time * star.speed + star.phase + i * 0.1)
        const x = star.x * canvas.width
        const y = star.y * canvas.height
        const alpha = twinkle * star.brightness

        // Glow for larger stars
        if (star.size > 1.2) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 4)
          let glowColor: string
          if (star.isGold) {
            glowColor = `rgba(251, 191, 36, ${alpha * 0.5})`
          } else if (star.isPurple) {
            glowColor = `rgba(167, 139, 250, ${alpha * 0.5})`
          } else {
            glowColor = `rgba(200, 210, 255, ${alpha * 0.3})`
          }
          gradient.addColorStop(0, glowColor)
          gradient.addColorStop(1, "transparent")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x, y, star.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Star core
        ctx.beginPath()
        ctx.arc(x, y, star.size, 0, Math.PI * 2)
        if (star.isGold) {
          ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`
        } else if (star.isPurple) {
          ctx.fillStyle = `rgba(196, 181, 253, ${alpha})`
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        }
        ctx.fill()
      })

      // Draw orbiting particles
      orbitParticles.forEach((p) => {
        p.angle += p.speed * 0.01
        const x = centerX + Math.cos(p.angle) * p.radius
        const y = centerY + Math.sin(p.angle) * p.radius
        const alpha = 0.4 + 0.3 * Math.sin(time * 2 + p.angle)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3)
        gradient.addColorStop(0, `rgba(251, 191, 36, ${alpha})`)
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, p.size * 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      })

      // Mouse follow nebula
      const mx = mouseRef.current.x * canvas.width
      const my = mouseRef.current.y * canvas.height
      const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 200)
      mouseGrad.addColorStop(0, "rgba(139, 92, 246, 0.12)")
      mouseGrad.addColorStop(0.5, "rgba(236, 72, 153, 0.06)")
      mouseGrad.addColorStop(1, "transparent")
      ctx.fillStyle = mouseGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationRef.current = requestAnimationFrame(animate)
    }

    // Fade in after short delay
    setIsReady(true)
    setTimeout(() => setIsVisible(true), 100)
    setTimeout(() => setClickEnabled(true), 800)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 bg-black transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${clickEnabled ? "cursor-pointer" : "cursor-default"}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Central button with enhanced effects */}
      {isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative button-appear">
            {/* Multiple glow rings */}
            <div className="absolute inset-0 -m-16 rounded-full bg-gradient-to-r from-amber-400/5 to-orange-500/5 ring-pulse-1" />
            <div className="absolute inset-0 -m-10 rounded-full border border-amber-400/20 ring-pulse-2" />
            <div className="absolute inset-0 -m-4 rounded-full border border-amber-400/30 ring-pulse-3" />

            {/* Main button */}
            <button
              className={`relative px-12 py-6 rounded-full overflow-hidden group
                         bg-gradient-to-br from-amber-400/10 via-orange-500/5 to-purple-500/5
                         border border-amber-400/40 backdrop-blur-md
                         transition-all duration-500
                         ${clickEnabled ? "hover:shadow-[0_0_60px_rgba(251,191,36,0.4)] hover:border-amber-400/60" : ""}`}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />

              <span className="relative z-10 flex flex-col items-center gap-2">
                <span
                  className="text-3xl md:text-4xl font-serif tracking-wider"
                  style={{
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))",
                  }}
                >
                  宇宙に触れる
                </span>
                <span className="text-amber-100/50 text-sm tracking-[0.25em] uppercase">Touch the Universe</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Hint text */}
      {clickEnabled && (
        <p className="absolute bottom-12 left-1/2 -translate-x-1/2 text-amber-100/30 text-sm tracking-[0.2em] z-10 hint-appear">
          Click anywhere to begin your journey
        </p>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.6) 100%)" }}
      />

      <style jsx>{`
        .button-appear {
          animation: buttonAppear 1s ease-out 0.3s both;
        }
        .hint-appear {
          animation: fadeIn 0.8s ease-out 0.5s both;
        }
        .ring-pulse-1 {
          animation: ringPulse 4s ease-in-out infinite;
        }
        .ring-pulse-2 {
          animation: ringPulse 3s ease-in-out infinite 0.5s;
        }
        .ring-pulse-3 {
          animation: ringPulse 2.5s ease-in-out infinite 1s;
        }
        .shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes buttonAppear {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
