"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface PreloaderProps {
  onComplete: () => void
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [, setWaveTick] = useState(0) // Force re-render for wave animation
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const progressRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const waveTimeRef = useRef(0)
  const waveAnimationRef = useRef<number | null>(null)

  const handleComplete = useCallback(() => {
    setIsVisible(false)
    setTimeout(onComplete, 600)
  }, [onComplete])

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

    // More particles with variety
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 2,
      speed: 0.5 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      isGold: Math.random() > 0.6,
      drift: (Math.random() - 0.5) * 0.3,
    }))

    let time = 0
    const animateParticles = () => {
      time += 0.015
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Subtle nebula background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.6,
      )
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.03)")
      gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.02)")
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        // Gentle floating motion
        p.y -= 0.15
        p.x += p.drift * Math.sin(time + p.phase)

        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }

        const twinkle = 0.3 + 0.7 * Math.sin(time * p.speed + p.phase)
        const color = p.isGold ? `rgba(251, 191, 36, ${twinkle})` : `rgba(255, 255, 255, ${twinkle * 0.8})`

        // Glow for larger particles
        if (p.size > 1) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
          glow.addColorStop(
            0,
            p.isGold ? `rgba(251, 191, 36, ${twinkle * 0.4})` : `rgba(200, 220, 255, ${twinkle * 0.3})`,
          )
          glow.addColorStop(1, "transparent")
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animateParticles)
    }

    animationRef.current = requestAnimationFrame(animateParticles)

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Mark as mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Wave animation loop (separate from progress to avoid hydration issues)
  useEffect(() => {
    if (!isMounted) return
    
    let lastWaveTime = performance.now()
    const waveAnimate = () => {
      const now = performance.now()
      const delta = (now - lastWaveTime) / 1000
      lastWaveTime = now
      waveTimeRef.current += delta
      // Force re-render for wave animation using separate state
      setWaveTick((prev) => prev + 1)
      waveAnimationRef.current = requestAnimationFrame(waveAnimate)
    }
    
    waveAnimationRef.current = requestAnimationFrame(waveAnimate)
    
    return () => {
      if (waveAnimationRef.current) cancelAnimationFrame(waveAnimationRef.current)
    }
  }, [isMounted])

  // Progress animation - smooth and stable
  useEffect(() => {
    if (!isMounted) return
    
    const duration = 2500
    let lastTime = performance.now()
    let accumulatedTime = 0

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
        lastTime = currentTime
      }

      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      accumulatedTime += deltaTime

      // Use easing function for smooth progress
      const t = Math.min(accumulatedTime / duration, 1)
      // Ease-out cubic for smooth deceleration
      const easedT = 1 - Math.pow(1 - t, 3)
      const newProgress = easedT * 100

      setProgress(newProgress)

      if (t < 1) {
        progressRef.current = requestAnimationFrame(animate)
      } else {
        // Ensure we end at exactly 100%
        setProgress(100)
        setTimeout(() => handleComplete(), 300)
      }
    }

    progressRef.current = requestAnimationFrame(animate)

    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [handleComplete, isMounted])

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Title with enhanced styling */}
        <div className="text-center preloader-title">
          <h1 className="text-xl md:text-2xl font-light tracking-[0.4em] text-amber-100/50 mb-3 uppercase">Entering</h1>
          <h2
            className="text-5xl md:text-7xl font-serif tracking-wider"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 30px rgba(251, 191, 36, 0.5))",
            }}
          >
            つむの宇宙
          </h2>
          <p className="text-amber-100/30 text-sm tracking-[0.3em] mt-3 uppercase">Tsumu's Universe</p>
        </div>

        {/* Enhanced soundwave visualizer */}
        <div className="relative w-80 md:w-96 h-24 flex items-center justify-center">
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const isActive = (i / 32) * 100 <= progress
              const centerDistance = Math.abs(i - 16) / 16
              // Smoother height calculation with easing
              const baseHeight = isActive ? 16 + (1 - centerDistance) * 48 : 4
              // Use ref-based time to avoid hydration mismatch
              const waveOffset = isActive && isMounted ? Math.sin(waveTimeRef.current * 5 + i * 0.3) * 8 : 0
              const height = Math.max(4, baseHeight + waveOffset)

              return (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: `${height}px`,
                    background: isActive
                      ? `linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)`
                      : "rgba(255, 255, 255, 0.1)",
                    boxShadow: isActive ? "0 0 12px rgba(251, 191, 36, 0.6)" : "none",
                    transition: isMounted ? "height 0.1s ease-out, background 0.2s ease-out" : "none",
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex flex-col items-center gap-4 preloader-progress">
          <div className="relative w-64 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #fbbf24, #f59e0b, #ea580c)",
                boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
                transition: "width 50ms linear",
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-amber-100/40 text-xs tracking-[0.3em] uppercase">Loading</span>
            <span className="text-amber-400 font-mono text-lg tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-20 h-20 opacity-40">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-amber-400 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-amber-400 to-transparent" />
      </div>
      <div className="absolute top-8 right-8 w-20 h-20 opacity-40">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-amber-400 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-amber-400 to-transparent" />
      </div>
      <div className="absolute bottom-8 left-8 w-20 h-20 opacity-40">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-amber-400 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-amber-400 to-transparent" />
      </div>
      <div className="absolute bottom-8 right-8 w-20 h-20 opacity-40">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-amber-400 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-amber-400 to-transparent" />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%)" }}
      />

      <style jsx>{`
        .preloader-title {
          animation: slideUp 1s ease-out 0.2s both;
        }
        .preloader-progress {
          animation: fadeIn 0.8s ease-out 0.5s both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
