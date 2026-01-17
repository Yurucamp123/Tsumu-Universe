"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { MemoryStars } from "@/components/cosmos/memory-stars"
import { PianoVoid } from "@/components/cosmos/piano-void"
import { RealTimeAtmosphere } from "@/components/cosmos/real-time-atmosphere"
import { GalaxiesNebulas } from "@/components/cosmos/galaxies-nebulas"
import { ShootingStars } from "@/components/cosmos/shooting-stars"
import { ObservatoryButton } from "@/components/observatory/observatory-button"
import { ObservatoryModal } from "@/components/observatory/observatory-modal"
import { isJapanDaytime } from "@/utils/time"

interface AtmosphereColors {
  primary: string
  accent: string
  glow: string
}

export function LivingCosmos() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [atmosphereColors, setAtmosphereColors] = useState<AtmosphereColors>({
    primary: "rgb(255, 215, 0)",
    accent: "rgba(255, 215, 0, 0.7)",
    glow: "rgba(255, 215, 0, 0.5)",
  })
  const [emotionalColor, setEmotionalColor] = useState<string | undefined>(undefined)
  const [isObservatoryOpen, setIsObservatoryOpen] = useState(false)

  // Use refs to avoid re-renders
  const atmosphereColorsRef = useRef<AtmosphereColors>(atmosphereColors)
  const nebulaSpeedsRef = useRef({ day: 1.2, night: 0.4 })
  const isDayTimeRef = useRef(isJapanDaytime())
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const animationRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)

  // Update day/night status periodically
  useEffect(() => {
    const updateTime = () => {
      isDayTimeRef.current = isJapanDaytime()
      nebulaSpeedsRef.current = isDayTimeRef.current
        ? { day: 1.2, night: 0.4 }
        : { day: 0.5, night: 1.2 }
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    }
  }, [])

  const updateAtmosphereWithSpeed = useCallback((colors: AtmosphereColors) => {
    atmosphereColorsRef.current = colors
    setAtmosphereColors(colors)
  }, [])

  const handleSongHover = useCallback((song: { color: string } | null) => {
    setEmotionalColor(song?.color)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitializedRef.current) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    isInitializedRef.current = true

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)

    // Optimized particle count for better performance
    const isMobile = window.innerWidth < 768
    const starCount = isMobile ? 100 : 200

    // Use seeded random for consistent initialization (avoid hydration mismatch)
    let seed = 12345
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    const stars = Array.from({ length: starCount }, () => {
      const rand = seededRandom()
      const sizeRand = seededRandom()
      // More varied star sizes with better distribution
      let size = 0.3 + sizeRand * 2.5
      if (sizeRand > 0.95) size += 1.5 // Some extra large stars

      return {
        x: seededRandom(),
        y: seededRandom(),
        baseX: seededRandom(),
        baseY: seededRandom(),
        vy: 0.002 + seededRandom() * 0.003, // Extremely slow downward movement
        size,
        brightness: 0.5 + seededRandom() * 0.5,
        speed: 0.3 + seededRandom() * 1.2, // Smoother speed variation
        phase: seededRandom() * Math.PI * 2,
        isGold: rand > 0.85,
        isPurple: rand > 0.92,
        isBright: rand > 0.96,
        isBlue: rand > 0.88 && rand <= 0.92,
        isPink: rand > 0.80 && rand <= 0.85,
        pulseSpeed: 0.5 + seededRandom() * 1.5, // Individual pulse speeds
      }
    })

    let time = 0
    let lastTime = performance.now()

    const animate = () => {
      const currentTime = performance.now()
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 1.5)
      lastTime = currentTime
      time += 0.006 * deltaTime

      // Clear and draw background
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background gradient (always visible)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      bgGradient.addColorStop(0, "#020010")
      bgGradient.addColorStop(0.5, "#08041a")
      bgGradient.addColorStop(1, "#020010")
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dynamic nebula gradient (like intro page)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const nebulaPulse = 0.8 + 0.2 * Math.sin(time * 0.3)
      const nebulaGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.5)
      nebulaGrad.addColorStop(0, `rgba(139, 92, 246, ${0.08 * nebulaPulse})`)
      nebulaGrad.addColorStop(0.4, `rgba(236, 72, 153, ${0.04 * nebulaPulse})`)
      nebulaGrad.addColorStop(0.7, `rgba(251, 191, 36, ${0.02 * nebulaPulse})`)
      nebulaGrad.addColorStop(1, "transparent")
      ctx.fillStyle = nebulaGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Nebula rendering (simplified)
      const speedMultiplier = isDayTimeRef.current ? nebulaSpeedsRef.current.day : nebulaSpeedsRef.current.night
      const colorMatch = atmosphereColorsRef.current.primary.match(/\d+/g)
      const r = colorMatch ? parseInt(colorMatch[0]) : 255
      const g = colorMatch ? parseInt(colorMatch[1]) : 215
      const b = colorMatch ? parseInt(colorMatch[2]) : 0
      const isDay = isDayTimeRef.current

      // Only 3 nebulas for better performance
      const nebulas = [
        {
          x: 0.2,
          y: 0.3,
          r: 0.4,
          color1: isDay ? `${r}, ${Math.floor(g * 0.4)}, ${b}` : "88, 28, 135",
          color2: isDay ? `${Math.floor(r * 0.7)}, ${Math.floor(g * 0.5)}, ${b}` : "59, 130, 246",
          alpha: isDay ? 0.08 : 0.1,
          speedX: 0.12 * speedMultiplier,
          speedY: 0.15 * speedMultiplier,
        },
        {
          x: 0.8,
          y: 0.4,
          r: 0.35,
          color1: isDay ? `${Math.floor(r * 0.8)}, ${Math.floor(g * 0.6)}, ${b}` : "147, 51, 234",
          color2: isDay ? `${r}, ${Math.floor(g * 0.5)}, ${b}` : "236, 72, 153",
          alpha: isDay ? 0.07 : 0.08,
          speedX: 0.15 * speedMultiplier,
          speedY: 0.12 * speedMultiplier,
        },
        {
          x: 0.5,
          y: 0.75,
          r: 0.45,
          color1: isDay ? `${r}, ${g}, ${b}` : "236, 72, 153",
          color2: isDay ? `${Math.floor(r * 0.75)}, ${Math.floor(g * 0.75)}, ${b}` : "147, 51, 234",
          alpha: isDay ? 0.08 : 0.09,
          speedX: 0.1 * speedMultiplier,
          speedY: 0.2 * speedMultiplier,
        },
      ]

      nebulas.forEach((n) => {
        const offsetX = Math.sin(time * n.speedX) * 25
        const offsetY = Math.cos(time * n.speedY) * 20
        const pulseAlpha = n.alpha * (0.85 + 0.15 * Math.sin(time * 0.4))

        const nebula = ctx.createRadialGradient(
          canvas.width * n.x + offsetX,
          canvas.height * n.y + offsetY,
          0,
          canvas.width * n.x + offsetX,
          canvas.height * n.y + offsetY,
          canvas.width * n.r,
        )
        nebula.addColorStop(0, `rgba(${n.color1}, ${pulseAlpha})`)
        nebula.addColorStop(0.5, `rgba(${n.color2}, ${pulseAlpha * 0.5})`)
        nebula.addColorStop(1, "transparent")
        ctx.fillStyle = nebula
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      })

      // Mouse glow (simplified)
      const mouseX = mouseRef.current.x * canvas.width
      const mouseY = mouseRef.current.y * canvas.height
      if (mouseRef.current.x !== 0.5 || mouseRef.current.y !== 0.5) {
        const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150)
        mouseGlow.addColorStop(0, "rgba(139, 92, 246, 0.06)")
        mouseGlow.addColorStop(1, "transparent")
        ctx.fillStyle = mouseGlow
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Stars rendering with enhanced detail and smoother animations
      stars.forEach((star, i) => {
        // Smoother, more varied twinkling with individual pulse speeds
        const twinkle = 0.5 + 0.5 * Math.sin(time * star.speed * star.pulseSpeed + star.phase + i * 0.1)
        const secondaryTwinkle = 0.6 + 0.4 * Math.cos(time * star.speed * star.pulseSpeed * 0.7 + star.phase)

        // Extremely slow downward movement (from top to bottom)
        star.y += star.vy * deltaTime * 0.1

        // Wrap around: when star goes below screen, reappear at top
        if (star.y > 1.1) {
          star.y = -0.1
          star.x = Math.random() // Randomize x position when reappearing
        }

        const baseX = star.x * canvas.width
        const baseY = star.y * canvas.height

        // Mouse interaction (very gentle)
        const dx = baseX - mouseX
        const dy = baseY - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repulsionRadius = 150

        let targetX = baseX
        let targetY = baseY

        if (dist < repulsionRadius && dist > 0) {
          // Smoother repulsion force with quadratic falloff
          const normalizedDist = dist / repulsionRadius
          const force = Math.pow(1 - normalizedDist, 2) * 12 * deltaTime
          targetX = baseX + (dx / dist) * force
          targetY = baseY + (dy / dist) * force
        }

        // Smooth interpolation for mouse interaction
        const lerpFactor = 0.05 * deltaTime
        const finalX = baseX + (targetX - baseX) * lerpFactor
        const finalY = baseY + (targetY - baseY) * lerpFactor

        const x = finalX
        const y = finalY
        const alpha = Math.max(0, Math.min(1, star.brightness * twinkle))
        const size = star.size * (0.85 + twinkle * 0.3)

        // Enhanced color system using base RGB strings for safety
        let baseRgb: string
        let glowRgb: string
        let coreAlphaMult = 1.0
        let glowAlphaMult = 1.0

        if (star.isBright) {
          baseRgb = "255, 255, 255"
          glowRgb = "255, 255, 255"
          coreAlphaMult = 1.3
          glowAlphaMult = 0.6
        } else if (star.isGold) {
          baseRgb = "251, 191, 36"
          glowRgb = "251, 191, 36"
          coreAlphaMult = 1.1
          glowAlphaMult = 0.5
        } else if (star.isPurple) {
          baseRgb = "196, 181, 253"
          glowRgb = "167, 139, 250"
          coreAlphaMult = 1.1
          glowAlphaMult = 0.5
        } else if (star.isBlue) {
          baseRgb = "147, 197, 253"
          glowRgb = "59, 130, 246"
          coreAlphaMult = 1.1
          glowAlphaMult = 0.5
        } else if (star.isPink) {
          baseRgb = "251, 207, 232"
          glowRgb = "236, 72, 153"
          coreAlphaMult = 1.1
          glowAlphaMult = 0.5
        } else {
          baseRgb = "255, 255, 255"
          glowRgb = "200, 210, 255"
          coreAlphaMult = 0.95
          glowAlphaMult = 0.35
        }

        // Multi-layer glow for all stars (more detailed)
        if (star.size > 0.8) {
          // Outer glow layer
          const outerGlowSize = star.isBright ? size * 5 : size * 3.5
          const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, outerGlowSize)
          outerGradient.addColorStop(0, `rgba(${glowRgb}, ${alpha * glowAlphaMult})`)
          outerGradient.addColorStop(0.3, `rgba(${glowRgb}, ${alpha * 0.2})`)
          outerGradient.addColorStop(1, "transparent")
          ctx.fillStyle = outerGradient
          ctx.beginPath()
          ctx.arc(x, y, outerGlowSize, 0, Math.PI * 2)
          ctx.fill()

          // Middle glow layer
          const midGlowSize = star.isBright ? size * 3 : size * 2
          const midGradient = ctx.createRadialGradient(x, y, 0, x, y, midGlowSize)
          midGradient.addColorStop(0, `rgba(${glowRgb}, ${alpha * glowAlphaMult})`)
          midGradient.addColorStop(0.5, `rgba(${glowRgb}, ${alpha * 0.4})`)
          midGradient.addColorStop(1, "transparent")
          ctx.fillStyle = midGradient
          ctx.beginPath()
          ctx.arc(x, y, midGlowSize, 0, Math.PI * 2)
          ctx.fill()
        }

        // Inner glow (for larger stars)
        if (star.size > 1.2) {
          const innerGlowSize = size * 1.5
          const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, innerGlowSize)
          innerGradient.addColorStop(0, `rgba(${baseRgb}, ${Math.min(1, alpha * coreAlphaMult)})`)
          innerGradient.addColorStop(0.6, `rgba(${glowRgb}, ${alpha * glowAlphaMult})`)
          innerGradient.addColorStop(1, "transparent")
          ctx.fillStyle = innerGradient
          ctx.beginPath()
          ctx.arc(x, y, innerGlowSize, 0, Math.PI * 2)
          ctx.fill()
        }

        // Star core with subtle gradient
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
        coreGradient.addColorStop(0, `rgba(${baseRgb}, ${Math.min(1, alpha * coreAlphaMult * 1.05)})`)
        coreGradient.addColorStop(0.7, `rgba(${baseRgb}, ${Math.min(1, alpha * coreAlphaMult)})`)
        coreGradient.addColorStop(1, `rgba(${baseRgb}, ${alpha * 0.7})`)
        ctx.fillStyle = coreGradient
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // Bright center point for larger stars
        if (star.size > 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * secondaryTwinkle * 1.2})`
          ctx.beginPath()
          ctx.arc(x, y, size * 0.4, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      isInitializedRef.current = false
    }
  }, [handleMouseMove])

  return (
    <div className="absolute inset-0 bg-[#020010]">
      <RealTimeAtmosphere emotionalColor={emotionalColor} onAtmosphereChange={updateAtmosphereWithSpeed} />

      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ display: "block" }} />

      {/* Shooting Stars Effect - Above canvas but below interactive elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <ShootingStars frequency={6} />
      </div>

      <PianoVoid atmosphereColor={atmosphereColors.primary} />

      <GalaxiesNebulas atmosphereColor={atmosphereColors.primary} onHover={handleSongHover} />

      <MemoryStars emotionalColor={atmosphereColors.primary} onSongHover={handleSongHover} />

      {/* Welcome text - always visible, no opacity transition */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
        <h1
          className="text-6xl md:text-8xl font-serif mb-4"
          style={{
            background: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f59e0b 60%, #ea580c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 40px rgba(251, 191, 36, 0.6))",
            opacity: 1,
          }}
        >
          つむの宇宙
        </h1>
        <p className="text-amber-100/50 text-lg tracking-[0.3em] uppercase" style={{ opacity: 1 }}>
          あなたの宇宙へようこそ
        </p>
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.6) 100%)" }}
      />

      {/* Observatory System */}
      <ObservatoryButton onClick={() => setIsObservatoryOpen(true)} />
      <ObservatoryModal isOpen={isObservatoryOpen} onClose={() => setIsObservatoryOpen(false)} />
    </div>
  )
}
