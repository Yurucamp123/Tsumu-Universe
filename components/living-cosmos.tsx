"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { MemoryStars } from "@/components/cosmos/memory-stars"
import { PianoVoid } from "@/components/cosmos/piano-void"
import { RealTimeAtmosphere } from "@/components/cosmos/real-time-atmosphere"
import { GalaxiesNebulas } from "@/components/cosmos/galaxies-nebulas"
import { ShootingStars } from "@/components/cosmos/shooting-stars"
import { MessageStar } from "@/components/cosmos/message-star"
import { MessageModal } from "@/components/connection/message-modal"
import { FireworkEffect } from "@/components/connection/firework-effect"
import { SuccessNotification } from "@/components/connection/success-notification"
import { ObservatoryButton } from "@/components/observatory/observatory-button"
import { ObservatoryModal } from "@/components/observatory/observatory-modal"
import { LetterModal } from "@/components/letter-modal"
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
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [showFirework, setShowFirework] = useState(false)
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false)

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

  const handleMessageSend = async (message: string) => {
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Success - show both effects independently
      setIsMessageModalOpen(false)
      setShowFirework(true)
      setShowSuccessNotification(true)

      // Notification stays for full 15 seconds
      setTimeout(() => setShowSuccessNotification(false), 15000)

      // Firework also lasts exactly 15 seconds
      setTimeout(() => setShowFirework(false), 15000)
    } catch (error) {
      console.error('Error sending message:', error)
      alert("メッセージの送信に失敗しました。\n(開発中: webhook URLを確認してください)")
    }
  }

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
    const baseStarCount = isMobile ? 80 : 150

    // Use seeded random for consistent initialization (avoid hydration mismatch)
    let seed = 12345
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    // Create star clusters for more realistic distribution
    const clusterCount = isMobile ? 3 : 5
    const clusters = Array.from({ length: clusterCount }, () => ({
      x: seededRandom(),
      y: seededRandom(),
      radius: 0.15 + seededRandom() * 0.2,
      density: 0.6 + seededRandom() * 0.4,
    }))

    // Milky Way band parameters
    const milkyWayAngle = -30 * (Math.PI / 180) // -30 degrees
    const milkyWayWidth = 0.25
    const milkyWayIntensity = 0.7

    const stars = Array.from({ length: baseStarCount }, (_, i) => {
      const rand = seededRandom()

      // Determine if star is in a cluster or Milky Way
      let x, y
      const inCluster = rand < 0.4 // 40% of stars in clusters
      const inMilkyWay = rand >= 0.4 && rand < 0.7 // 30% in Milky Way

      if (inCluster) {
        // Place in a random cluster
        const cluster = clusters[Math.floor(seededRandom() * clusters.length)]
        const angle = seededRandom() * Math.PI * 2
        const distance = seededRandom() * cluster.radius * cluster.density
        x = cluster.x + Math.cos(angle) * distance
        y = cluster.y + Math.sin(angle) * distance
      } else if (inMilkyWay) {
        // Place along Milky Way band
        x = seededRandom()
        const centerY = x * Math.tan(milkyWayAngle) + 0.5
        const offset = (seededRandom() - 0.5) * milkyWayWidth
        y = centerY + offset
      } else {
        // Random placement
        x = seededRandom()
        y = seededRandom()
      }

      // Clamp to screen bounds
      x = Math.max(0, Math.min(1, x))
      y = Math.max(0, Math.min(1, y))

      // Depth layer (0 = far, 3 = near)
      const depthRand = seededRandom()
      let depth = 0
      if (depthRand > 0.7) depth = 1
      if (depthRand > 0.85) depth = 2
      if (depthRand > 0.95) depth = 3

      // Size based on depth
      const baseSize = [0.3, 0.6, 1.0, 1.5][depth]
      const sizeVariation = seededRandom() * 0.8
      let size = baseSize + sizeVariation
      if (seededRandom() > 0.97) size += 1.5 // Some extra large stars

      // Star type based on size and randomness
      const typeRand = seededRandom()
      let starType: 'white-dwarf' | 'main-sequence' | 'blue-giant' | 'red-giant' | 'supergiant'
      if (size < 0.8) starType = 'white-dwarf'
      else if (typeRand > 0.95) starType = 'blue-giant'
      else if (typeRand > 0.90) starType = 'red-giant'
      else if (typeRand > 0.98) starType = 'supergiant'
      else starType = 'main-sequence'

      return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (seededRandom() - 0.5) * 0.0003 * (depth + 1), // Gentle horizontal drift
        vy: (0.001 + seededRandom() * 0.002) * (depth + 1), // Vertical drift (faster for closer stars)
        size,
        depth,
        brightness: 0.4 + seededRandom() * 0.6,
        speed: 0.3 + seededRandom() * 1.2,
        phase: seededRandom() * Math.PI * 2,
        starType,
        pulseSpeed: 0.5 + seededRandom() * 1.5,
        inMilkyWay,
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

      // Dynamic nebula gradient (very dark for deep space)
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const nebulaPulse = 0.8 + 0.2 * Math.sin(time * 0.3)
      const nebulaGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.5)
      nebulaGrad.addColorStop(0, `rgba(139, 92, 246, ${0.018 * nebulaPulse})`)
      nebulaGrad.addColorStop(0.4, `rgba(236, 72, 153, ${0.009 * nebulaPulse})`)
      nebulaGrad.addColorStop(0.7, `rgba(251, 191, 36, ${0.005 * nebulaPulse})`)
      nebulaGrad.addColorStop(1, "transparent")
      ctx.fillStyle = nebulaGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Milky Way band - diagonal glow across the screen
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-30 * (Math.PI / 180)) // -30 degrees

      const milkyWayGradient = ctx.createLinearGradient(0, -canvas.height, 0, canvas.height)
      const milkyWayAlpha = 0.02 + 0.008 * Math.sin(time * 0.2)
      milkyWayGradient.addColorStop(0, "transparent")
      milkyWayGradient.addColorStop(0.35, `rgba(200, 210, 255, ${milkyWayAlpha * 0.3})`)
      milkyWayGradient.addColorStop(0.5, `rgba(220, 225, 255, ${milkyWayAlpha})`)
      milkyWayGradient.addColorStop(0.65, `rgba(200, 210, 255, ${milkyWayAlpha * 0.3})`)
      milkyWayGradient.addColorStop(1, "transparent")

      ctx.fillStyle = milkyWayGradient
      ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2)
      ctx.restore()

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

        // Gentle autonomous drift (both horizontal and vertical)
        star.x += star.vx * deltaTime * 0.1
        star.y += star.vy * deltaTime * 0.1

        // Wrap around horizontally
        if (star.x > 1.1) {
          star.x = -0.1
        } else if (star.x < -0.1) {
          star.x = 1.1
        }

        // Wrap around vertically: when star goes below screen, reappear at top
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

        // Realistic star color system based on star type
        let baseRgb: string
        let glowRgb: string
        let coreAlphaMult = 1.0
        let glowAlphaMult = 1.0
        let hasLensFlare = false

        switch (star.starType) {
          case 'blue-giant':
            baseRgb = "147, 197, 253" // Blue
            glowRgb = "59, 130, 246" // Deeper blue glow
            coreAlphaMult = 1.4
            glowAlphaMult = 0.7
            hasLensFlare = size > 1.5
            break
          case 'red-giant':
            baseRgb = "251, 146, 60" // Orange-red
            glowRgb = "239, 68, 68" // Red glow
            coreAlphaMult = 1.3
            glowAlphaMult = 0.6
            hasLensFlare = size > 1.5
            break
          case 'supergiant':
            baseRgb = "255, 215, 0" // Gold
            glowRgb = "251, 191, 36" // Golden glow
            coreAlphaMult = 1.5
            glowAlphaMult = 0.8
            hasLensFlare = true
            break
          case 'white-dwarf':
            baseRgb = "200, 210, 255" // Pale blue-white
            glowRgb = "147, 197, 253" // Blue glow
            coreAlphaMult = 0.9
            glowAlphaMult = 0.3
            break
          default: // main-sequence
            baseRgb = "255, 255, 255" // White
            glowRgb = "200, 210, 255" // Pale blue glow
            coreAlphaMult = 1.0
            glowAlphaMult = 0.4
        }

        // Extra brightness for Milky Way stars
        if (star.inMilkyWay) {
          coreAlphaMult *= 1.2
          glowAlphaMult *= 1.3
        }

        // Depth-based opacity (farther = dimmer)
        const depthAlpha = [0.4, 0.6, 0.8, 1.0][star.depth]

        // Multi-layer glow for all stars (more detailed)
        if (star.size > 0.8) {
          // Outer glow layer
          const outerGlowSize = hasLensFlare ? size * 6 : size * 3.5
          const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, outerGlowSize)
          outerGradient.addColorStop(0, `rgba(${glowRgb}, ${alpha * glowAlphaMult * depthAlpha})`)
          outerGradient.addColorStop(0.3, `rgba(${glowRgb}, ${alpha * 0.2 * depthAlpha})`)
          outerGradient.addColorStop(1, "transparent")
          ctx.fillStyle = outerGradient
          ctx.beginPath()
          ctx.arc(x, y, outerGlowSize, 0, Math.PI * 2)
          ctx.fill()

          // Middle glow layer
          const midGlowSize = hasLensFlare ? size * 4 : size * 2
          const midGradient = ctx.createRadialGradient(x, y, 0, x, y, midGlowSize)
          midGradient.addColorStop(0, `rgba(${glowRgb}, ${alpha * glowAlphaMult * depthAlpha})`)
          midGradient.addColorStop(0.5, `rgba(${glowRgb}, ${alpha * 0.4 * depthAlpha})`)
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
          innerGradient.addColorStop(0, `rgba(${baseRgb}, ${Math.min(1, alpha * coreAlphaMult * depthAlpha)})`)
          innerGradient.addColorStop(0.6, `rgba(${glowRgb}, ${alpha * glowAlphaMult * depthAlpha})`)
          innerGradient.addColorStop(1, "transparent")
          ctx.fillStyle = innerGradient
          ctx.beginPath()
          ctx.arc(x, y, innerGlowSize, 0, Math.PI * 2)
          ctx.fill()
        }

        // Star core with subtle gradient
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
        coreGradient.addColorStop(0, `rgba(${baseRgb}, ${Math.min(1, alpha * coreAlphaMult * 1.05 * depthAlpha)})`)
        coreGradient.addColorStop(0.7, `rgba(${baseRgb}, ${Math.min(1, alpha * coreAlphaMult * depthAlpha)})`)
        coreGradient.addColorStop(1, `rgba(${baseRgb}, ${alpha * 0.7 * depthAlpha})`)
        ctx.fillStyle = coreGradient
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // Bright center point for larger stars
        if (star.size > 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * secondaryTwinkle * 1.2 * depthAlpha})`
          ctx.beginPath()
          ctx.arc(x, y, size * 0.4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Lens flare effect for supergiants and large stars
        if (hasLensFlare && twinkle > 0.7) {
          ctx.save()
          ctx.translate(x, y)
          ctx.globalAlpha = alpha * 0.6 * depthAlpha

          // Horizontal flare
          ctx.strokeStyle = `rgb(${baseRgb})`
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(-size * 4, 0)
          ctx.lineTo(size * 4, 0)
          ctx.stroke()

          // Vertical flare
          ctx.beginPath()
          ctx.moveTo(0, -size * 4)
          ctx.lineTo(0, size * 4)
          ctx.stroke()

          ctx.restore()
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
      <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
        <div
          className="pointer-events-auto cursor-pointer group transition-transform duration-700 hover:scale-110"
          onClick={() => setIsLetterModalOpen(true)}
        >
          <h1
            className="text-6xl md:text-8xl font-serif mb-4 transition-all duration-500 drop-shadow-[0_0_40px_rgba(251,191,36,0.6)] group-hover:drop-shadow-[0_0_80px_rgba(251,191,36,1)]"
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 30%, #f59e0b 60%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: 1,
            }}
          >
            つむの宇宙
          </h1>



          {/* Tooltip */}
          <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-2 pointer-events-none">
            <div className="relative bg-black/60 backdrop-blur-md px-5 py-2 rounded-full border border-amber-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              {/* Arrow pointing down */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/60 border-b border-r border-amber-500/30 transform rotate-45"></div>

              <span className="text-amber-400 text-xs animate-pulse">✨</span>
              <span className="text-amber-100 font-serif tracking-widest text-sm whitespace-nowrap">クリックして手紙を読む</span>
              <span className="text-amber-400 text-xs animate-pulse">✨</span>
            </div>
          </div>
        </div>
        <p className="text-amber-100/50 text-lg tracking-[0.3em] uppercase transition-colors duration-500 group-hover:text-amber-100 group-hover:drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] mt-2" style={{ opacity: 1 }}>
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

      {/* Connection Module */}
      <MessageStar onOpen={() => setIsMessageModalOpen(true)} />
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        onSend={handleMessageSend}
      />

      {/* Letter Modal */}
      <LetterModal isOpen={isLetterModalOpen} onClose={() => setIsLetterModalOpen(false)} />

      {showFirework && <FireworkEffect onComplete={() => setShowFirework(false)} />}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
      />
    </div>
  )
}
