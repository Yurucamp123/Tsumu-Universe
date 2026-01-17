"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type React from "react"
import { useMousePosition } from "@/hooks/use-mouse-position"
import { playPianoNote } from "@/utils/audio"
import { SONGS } from "@/utils/songs"
import type { Song } from "@/types/song"
import { CelestialModal } from "./celestial-modal"

interface Galaxy {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  type: "spiral" | "elliptical"
  colors: {
    core: string
    arm1: string
    arm2: string
    outer: string
  }
  brightness: number
  vx?: number
  vy?: number
  song: Song
}

interface Nebula {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  colors: {
    center: string
    mid: string
    edge: string
  }
  brightness: number
  shape: "cloud" | "pillar"
  vx?: number
  vy?: number
  song: Song
}

interface Props {
  atmosphereColor: string
  onHover?: (song: { color: string } | null) => void
}

export function GalaxiesNebulas({ atmosphereColor, onHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const galaxiesRef = useRef<Galaxy[]>([])
  const nebulasRef = useRef<Nebula[]>([])
  const mousePosHook = useMousePosition()
  const mousePosRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number | null>(null)
  const hoveredObjectRef = useRef<Galaxy | Nebula | null>(null)
  const clickRippleRef = useRef<{ x: number; y: number; time: number; type: "galaxy" | "nebula" } | null>(null)
  const [hoveredObject, setHoveredObject] = useState<Galaxy | Nebula | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"spiral" | "elliptical" | "cloud" | "pillar" | null>(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedPosition, setSelectedPosition] = useState({ x: 0, y: 0 })
  const [selectedSong, setSelectedSong] = useState<Song | undefined>(undefined)
  const isInitializedRef = useRef(false)

  const scaleRef = useRef(1)

  useEffect(() => {
    // Normalize mouse position to 0-1 range
    mousePosRef.current = {
      x: mousePosHook.x / (typeof window !== "undefined" ? window.innerWidth : 1920),
      y: mousePosHook.y / (typeof window !== "undefined" ? window.innerHeight : 1080),
    }
  }, [mousePosHook.x, mousePosHook.y])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitializedRef.current) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    isInitializedRef.current = true

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Responsive scale: Base 1920px. 
      // minimal value 0.6 prevents objects from becoming too small on mobile
      // On mobile (portrait), we might want them slightly larger relative to width for touchability
      const isMobile = window.innerWidth < 768
      const baseScale = window.innerWidth / 1920
      scaleRef.current = isMobile ? Math.max(baseScale * 1.5, 0.5) : Math.max(baseScale, 0.6)
    }
    resize()
    window.addEventListener("resize", resize)




    // Initialize galaxies (smaller and more detailed)
    if (galaxiesRef.current.length === 0) {
      const galaxyCount = 4
      galaxiesRef.current = Array.from({ length: galaxyCount }, (_, i) => {
        const angle = (i / galaxyCount) * Math.PI * 2
        const distance = 0.25 + Math.random() * 0.15
        return {
          x: Math.cos(angle) * distance + 0.5,
          y: Math.sin(angle) * distance + 0.5,
          size: 18 + Math.random() * 12, // Much smaller: 18-30px
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: 0.001 + Math.random() * 0.002,
          type: Math.random() > 0.5 ? "spiral" : "elliptical",
          colors: {
            core: i === 0 ? "255, 215, 0" : i === 1 ? "139, 92, 246" : i === 2 ? "236, 72, 153" : "59, 130, 246",
            arm1: i === 0 ? "255, 180, 50" : i === 1 ? "167, 139, 250" : i === 2 ? "251, 146, 60" : "147, 51, 234",
            arm2: i === 0 ? "255, 140, 0" : i === 1 ? "196, 181, 253" : i === 2 ? "239, 68, 68" : "88, 28, 135",
            outer: i === 0 ? "200, 150, 50" : i === 1 ? "139, 92, 246" : i === 2 ? "200, 100, 100" : "59, 130, 246",
          },
          brightness: 0.7 + Math.random() * 0.3,
          song: SONGS[i % SONGS.length],
        }
      })
    }

    // Initialize nebulas (smaller and more detailed)
    if (nebulasRef.current.length === 0) {
      const nebulaCount = 5
      nebulasRef.current = Array.from({ length: nebulaCount }, (_, i) => {
        const angle = (i / nebulaCount) * Math.PI * 2 + Math.PI / 4
        const distance = 0.2 + Math.random() * 0.15
        return {
          x: Math.cos(angle) * distance + 0.5,
          y: Math.sin(angle) * distance + 0.5,
          size: 20 + Math.random() * 15, // Much smaller: 20-35px
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: 0.0005 + Math.random() * 0.001,
          colors: {
            center: i === 0 ? "139, 92, 246" : i === 1 ? "236, 72, 153" : i === 2 ? "59, 130, 246" : i === 3 ? "251, 191, 36" : "147, 51, 234",
            mid: i === 0 ? "167, 139, 250" : i === 1 ? "251, 146, 60" : i === 2 ? "147, 51, 234" : i === 3 ? "251, 191, 36" : "196, 181, 253",
            edge: i === 0 ? "196, 181, 253" : i === 1 ? "239, 68, 68" : i === 2 ? "88, 28, 135" : i === 3 ? "234, 88, 12" : "167, 139, 250",
          },
          brightness: 0.6 + Math.random() * 0.4,
          shape: Math.random() > 0.5 ? "cloud" : "pillar",
          song: SONGS[(i + 4) % SONGS.length],
        }
      })
    }

    let lastTime = performance.now()
    let time = 0

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 1.5)
      lastTime = currentTime
      time += 0.004 * deltaTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const mouseX = mousePosRef.current.x * canvas.width
      const mouseY = mousePosRef.current.y * canvas.height

      // Draw click ripple effect
      if (clickRippleRef.current) {
        clickRippleRef.current.time += deltaTime * 0.05
        if (clickRippleRef.current.time < 1) {
          const rippleX = clickRippleRef.current.x * canvas.width
          const rippleY = clickRippleRef.current.y * canvas.height
          const rippleSize = clickRippleRef.current.time * 200 * scaleRef.current
          const rippleAlpha = (1 - clickRippleRef.current.time) * 0.6

          const rippleGradient = ctx.createRadialGradient(rippleX, rippleY, 0, rippleX, rippleY, rippleSize)
          const color = clickRippleRef.current.type === "galaxy" ? "139, 92, 246" : "236, 72, 153"
          rippleGradient.addColorStop(0, `rgba(${color}, ${rippleAlpha})`)
          rippleGradient.addColorStop(0.5, `rgba(${color}, ${rippleAlpha * 0.5})`)
          rippleGradient.addColorStop(1, "transparent")

          ctx.fillStyle = rippleGradient
          ctx.beginPath()
          ctx.arc(rippleX, rippleY, rippleSize, 0, Math.PI * 2)
          ctx.fill()
        } else {
          clickRippleRef.current = null
        }
      }

      // Draw galaxies
      galaxiesRef.current.forEach((galaxy) => {
        const baseX = galaxy.x * canvas.width
        const baseY = galaxy.y * canvas.height
        const gsize = galaxy.size

        // Hover detection
        const dx = baseX - mouseX
        const dy = baseY - mouseY
        const distToMouse = Math.hypot(dx, dy)
        const hoverRadius = gsize * 2.5
        const isHovered = distToMouse < hoverRadius

        if (isHovered && hoveredObjectRef.current !== galaxy) {
          hoveredObjectRef.current = galaxy
          setHoveredObject(galaxy)
          onHover?.({ color: `rgb(${galaxy.colors.core})` })
        } else if (!isHovered && hoveredObjectRef.current === galaxy) {
          hoveredObjectRef.current = null
          setHoveredObject(null)
          onHover?.(null)
        }

        // Rotation update (slower when hovered)
        const rotationMultiplier = isHovered ? 0.2 : 1
        galaxy.rotation += galaxy.rotationSpeed * rotationMultiplier * deltaTime

        // Smooth movement - REMOVED ATTRACTION LOGIC AS REQUESTED
        // Galaxy stays in place relative to screen

        const gx = galaxy.x * canvas.width
        const gy = galaxy.y * canvas.height

        // Hover effects like stars - subtle
        const hoverScale = isHovered ? 1.1 : 1
        const effectiveSize = gsize * hoverScale * scaleRef.current
        const effectiveRotation = galaxy.rotation // Use direct accumulated rotation
        const brightness = isHovered ? galaxy.brightness * 1.5 : galaxy.brightness
        const glowIntensity = isHovered ? 1.3 : 1
        const twinkle = 0.7 + 0.3 * Math.sin(time * 2 + galaxy.rotation)

        ctx.save()
        ctx.translate(gx, gy)
        ctx.rotate(effectiveRotation)

        if (galaxy.type === "spiral") {
          // Draw spiral galaxy with highly detailed, sharp rendering
          // Multi-layer glow like stars for sharp detail
          // Outer glow (very subtle, like stars)
          const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 4)
          outerGlow.addColorStop(0, `rgba(${galaxy.colors.outer}, ${brightness * 0.15 * glowIntensity * twinkle})`)
          outerGlow.addColorStop(0.5, `rgba(${galaxy.colors.outer}, ${brightness * 0.05 * glowIntensity * twinkle})`)
          outerGlow.addColorStop(1, "transparent")
          ctx.fillStyle = outerGlow
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 4, 0, Math.PI * 2)
          ctx.fill()

          // Middle glow
          const middleGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 2.5)
          middleGlow.addColorStop(0, `rgba(${galaxy.colors.outer}, ${brightness * 0.4 * glowIntensity * twinkle})`)
          middleGlow.addColorStop(0.6, `rgba(${galaxy.colors.outer}, ${brightness * 0.15 * glowIntensity * twinkle})`)
          middleGlow.addColorStop(1, "transparent")
          ctx.fillStyle = middleGlow
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 2.5, 0, Math.PI * 2)
          ctx.fill()

          // Spiral arms (ultra-detailed with very sharp edges)
          for (let arm = 0; arm < 2; arm++) {
            const armAngle = (arm * Math.PI) + effectiveRotation
            const armColor = arm === 0 ? galaxy.colors.arm1 : galaxy.colors.arm2

            // Draw arms with ultra-sharp detail (multiple precise layers)
            for (let layer = 0; layer < 3; layer++) {
              const layerWidth = effectiveSize * (0.1 - layer * 0.03)
              const layerAlpha = brightness * (1.0 - layer * 0.15) * twinkle
              ctx.strokeStyle = `rgba(${armColor}, ${layerAlpha})`
              ctx.lineWidth = Math.max(0.5, layerWidth)
              ctx.lineCap = "round"
              ctx.lineJoin = "round"
              ctx.shadowBlur = layer === 0 ? 2 : 0
              ctx.shadowColor = `rgba(${armColor}, ${layerAlpha * 0.5})`

              ctx.beginPath()
              for (let i = 0; i < 150; i++) {
                const t = i / 150
                const radius = effectiveSize * 0.15 * t + effectiveSize * 0.55 * Math.pow(t, 1.5)
                const angle = armAngle + t * Math.PI * 3.2 + layer * 0.03
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius
                if (i === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
              }
              ctx.stroke()
              ctx.shadowBlur = 0
            }

            // Add subtle star points along arms (only when hovered, like stars)
            if (isHovered) {
              for (let i = 0; i < 8; i++) {
                const t = 0.15 + (i / 8) * 0.7
                const radius = effectiveSize * 0.15 * t + effectiveSize * 0.55 * Math.pow(t, 1.5)
                const angle = armAngle + t * Math.PI * 3.2
                const starX = Math.cos(angle) * radius
                const starY = Math.sin(angle) * radius
                const starSize = effectiveSize * 0.05 * twinkle

                // Star glow
                const starGlow = ctx.createRadialGradient(starX, starY, 0, starX, starY, starSize * 2)
                starGlow.addColorStop(0, `rgba(${armColor}, ${brightness * 0.8 * twinkle})`)
                starGlow.addColorStop(1, "transparent")
                ctx.fillStyle = starGlow
                ctx.beginPath()
                ctx.arc(starX, starY, starSize * 2, 0, Math.PI * 2)
                ctx.fill()

                // Star core
                ctx.fillStyle = `rgba(${armColor}, ${brightness * 1.2 * twinkle})`
                ctx.beginPath()
                ctx.arc(starX, starY, starSize, 0, Math.PI * 2)
                ctx.fill()
              }
            }
          }

          // Core glow (ultra-sharp like stars - multiple layers)
          // Inner bright core
          const innerCore = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 0.5)
          innerCore.addColorStop(0, `rgba(${galaxy.colors.core}, ${brightness * 1.4 * glowIntensity * twinkle})`)
          innerCore.addColorStop(0.5, `rgba(${galaxy.colors.core}, ${brightness * 1.1 * glowIntensity * twinkle})`)
          innerCore.addColorStop(1, `rgba(${galaxy.colors.core}, ${brightness * 0.7 * glowIntensity * twinkle})`)
          ctx.fillStyle = innerCore
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.5, 0, Math.PI * 2)
          ctx.fill()

          // Middle core glow
          const middleCore = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 0.8)
          middleCore.addColorStop(0, `rgba(${galaxy.colors.core}, ${brightness * 1.0 * glowIntensity * twinkle})`)
          middleCore.addColorStop(0.6, `rgba(${galaxy.colors.core}, ${brightness * 0.6 * glowIntensity * twinkle})`)
          middleCore.addColorStop(1, "transparent")
          ctx.fillStyle = middleCore
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.8, 0, Math.PI * 2)
          ctx.fill()

          // Ultra-sharp center point (like stars)
          ctx.fillStyle = `rgba(${galaxy.colors.core}, ${brightness * 1.8 * glowIntensity * twinkle})`
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.25, 0, Math.PI * 2)
          ctx.fill()

          // Brightest center dot
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 1.5 * glowIntensity * twinkle})`
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.1, 0, Math.PI * 2)
          ctx.fill()

          // Hover ring effect (subtle, like stars)
          if (isHovered) {
            ctx.strokeStyle = `rgba(${galaxy.colors.core}, ${brightness * 0.6 * twinkle})`
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.arc(0, 0, effectiveSize * 1.1, 0, Math.PI * 2)
            ctx.stroke()
          }
        } else {
          // Elliptical galaxy
          const ellipseGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize)
          ellipseGlow.addColorStop(0, `rgba(${galaxy.colors.core}, ${brightness * 0.8})`)
          ellipseGlow.addColorStop(0.4, `rgba(${galaxy.colors.arm1}, ${brightness * 0.5})`)
          ellipseGlow.addColorStop(0.7, `rgba(${galaxy.colors.outer}, ${brightness * 0.2})`)
          ellipseGlow.addColorStop(1, "transparent")
          ctx.fillStyle = ellipseGlow
          ctx.beginPath()
          ctx.ellipse(0, 0, effectiveSize * 0.6, effectiveSize * 0.4, effectiveRotation, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = `rgba(${galaxy.colors.core}, ${brightness})`
          ctx.beginPath()
          ctx.ellipse(0, 0, effectiveSize * 0.2, effectiveSize * 0.15, effectiveRotation, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      // Draw nebulas
      nebulasRef.current.forEach((nebula) => {
        const baseX = nebula.x * canvas.width
        const baseY = nebula.y * canvas.height
        const nsize = nebula.size

        nebula.rotation += nebula.rotationSpeed * deltaTime

        // Hover detection and movement
        const dx = baseX - mouseX
        const dy = baseY - mouseY
        const distToMouse = Math.hypot(dx, dy)
        const hoverRadius = nsize * 2.5
        const isHovered = distToMouse < hoverRadius

        if (isHovered && hoveredObjectRef.current !== nebula) {
          hoveredObjectRef.current = nebula
          setHoveredObject(nebula)
          // Change background color like stars
          onHover?.({ color: `rgb(${nebula.colors.center})` })
        } else if (!isHovered && hoveredObjectRef.current === nebula) {
          hoveredObjectRef.current = null
          setHoveredObject(null)
          onHover?.(null)
        }

        // Smooth movement when hovered (very very gentle, with boundaries)
        if (isHovered && distToMouse > 0 && distToMouse < hoverRadius) {
          const normalizedDist = distToMouse / hoverRadius
          // Extremely gentle movement - very slow
          const force = Math.pow(1 - normalizedDist, 2.5) * 0.002 * deltaTime
          const angle = Math.atan2(dy, dx)
          // Store velocity for smooth movement
          if (!nebula.vx) nebula.vx = 0
          if (!nebula.vy) nebula.vy = 0
          nebula.vx -= Math.cos(angle) * force
          nebula.vy -= Math.sin(angle) * force
        }

        // Damping and boundary check (like stars)
        if (nebula.vx !== undefined && nebula.vy !== undefined) {
          const damping = Math.pow(0.95, deltaTime)
          nebula.vx *= damping
          nebula.vy *= damping
          nebula.x += nebula.vx * deltaTime
          nebula.y += nebula.vy * deltaTime

          // Keep within bounds (prevent flying off screen)
          const margin = nsize / canvas.width
          if (nebula.x < margin) {
            nebula.x = margin
            nebula.vx *= -0.3
          } else if (nebula.x > 1 - margin) {
            nebula.x = 1 - margin
            nebula.vx *= -0.3
          }
          if (nebula.y < margin) {
            nebula.y = margin
            nebula.vy *= -0.3
          } else if (nebula.y > 1 - margin) {
            nebula.y = 1 - margin
            nebula.vy *= -0.3
          }
        }

        const nx = nebula.x * canvas.width
        const ny = nebula.y * canvas.height

        // Hover effects like stars - subtle
        const hoverScale = isHovered ? 1.3 : 1
        const effectiveSize = nsize * hoverScale * scaleRef.current
        const brightness = isHovered ? nebula.brightness * 1.5 : nebula.brightness
        const pulse = isHovered ? 0.95 + 0.15 * Math.sin(time * 3 + nebula.rotation) : 0.9 + 0.1 * Math.sin(time * 2 + nebula.rotation)
        const glowIntensity = isHovered ? 1.3 : 1
        const twinkle = 0.7 + 0.3 * Math.sin(time * 2 + nebula.rotation)

        ctx.save()
        ctx.translate(nx, ny)
        ctx.rotate(nebula.rotation)

        if (nebula.shape === "cloud") {
          // Beautiful cloud nebula with organic, detailed structure
          // Multiple organic layers for realistic nebula appearance

          // Layer 5: Outermost very faint glow
          const layer5 = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 3.5)
          layer5.addColorStop(0, `rgba(${nebula.colors.edge}, ${brightness * 0.08 * glowIntensity * twinkle * pulse})`)
          layer5.addColorStop(0.4, `rgba(${nebula.colors.edge}, ${brightness * 0.03 * glowIntensity * twinkle * pulse})`)
          layer5.addColorStop(1, "transparent")
          ctx.fillStyle = layer5
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 3.5, 0, Math.PI * 2)
          ctx.fill()

          // Layer 4: Outer wispy clouds
          const layer4 = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 2.8)
          layer4.addColorStop(0, `rgba(${nebula.colors.edge}, ${brightness * 0.2 * glowIntensity * twinkle * pulse})`)
          layer4.addColorStop(0.3, `rgba(${nebula.colors.mid}, ${brightness * 0.12 * glowIntensity * twinkle * pulse})`)
          layer4.addColorStop(0.7, `rgba(${nebula.colors.edge}, ${brightness * 0.05 * glowIntensity * twinkle * pulse})`)
          layer4.addColorStop(1, "transparent")
          ctx.fillStyle = layer4
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 2.8, 0, Math.PI * 2)
          ctx.fill()

          // Layer 3: Middle cloud structure
          const layer3 = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 2.0)
          layer3.addColorStop(0, `rgba(${nebula.colors.mid}, ${brightness * 0.35 * glowIntensity * twinkle * pulse})`)
          layer3.addColorStop(0.4, `rgba(${nebula.colors.mid}, ${brightness * 0.25 * glowIntensity * twinkle * pulse})`)
          layer3.addColorStop(0.7, `rgba(${nebula.colors.edge}, ${brightness * 0.15 * glowIntensity * twinkle * pulse})`)
          layer3.addColorStop(1, "transparent")
          ctx.fillStyle = layer3
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 2.0, 0, Math.PI * 2)
          ctx.fill()

          // Layer 2: Inner bright clouds
          const layer2 = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 1.4)
          layer2.addColorStop(0, `rgba(${nebula.colors.center}, ${brightness * 0.6 * glowIntensity * twinkle * pulse})`)
          layer2.addColorStop(0.3, `rgba(${nebula.colors.mid}, ${brightness * 0.5 * glowIntensity * twinkle * pulse})`)
          layer2.addColorStop(0.6, `rgba(${nebula.colors.mid}, ${brightness * 0.3 * glowIntensity * twinkle * pulse})`)
          layer2.addColorStop(1, "transparent")
          ctx.fillStyle = layer2
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 1.4, 0, Math.PI * 2)
          ctx.fill()

          // Layer 1: Core bright region
          const layer1 = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 0.9)
          layer1.addColorStop(0, `rgba(${nebula.colors.center}, ${brightness * 1.0 * glowIntensity * twinkle * pulse})`)
          layer1.addColorStop(0.4, `rgba(${nebula.colors.center}, ${brightness * 0.8 * glowIntensity * twinkle * pulse})`)
          layer1.addColorStop(0.7, `rgba(${nebula.colors.mid}, ${brightness * 0.6 * glowIntensity * twinkle * pulse})`)
          layer1.addColorStop(1, "transparent")
          ctx.fillStyle = layer1
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.9, 0, Math.PI * 2)
          ctx.fill()

          // Ultra-bright core (sharp and detailed)
          const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 0.5)
          coreGlow.addColorStop(0, `rgba(${nebula.colors.center}, ${brightness * 1.5 * glowIntensity * twinkle * pulse})`)
          coreGlow.addColorStop(0.5, `rgba(${nebula.colors.center}, ${brightness * 1.2 * glowIntensity * twinkle * pulse})`)
          coreGlow.addColorStop(1, `rgba(${nebula.colors.mid}, ${brightness * 0.8 * glowIntensity * twinkle * pulse})`)
          ctx.fillStyle = coreGlow
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.5, 0, Math.PI * 2)
          ctx.fill()

          // Sharp center point
          ctx.fillStyle = `rgba(${nebula.colors.center}, ${brightness * 2.0 * glowIntensity * twinkle * pulse})`
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.3, 0, Math.PI * 2)
          ctx.fill()

          // Brightest center dot
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 1.8 * glowIntensity * twinkle * pulse})`
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 0.12, 0, Math.PI * 2)
          ctx.fill()

          // Hover ring effect (subtle, like stars)
          if (isHovered) {
            ctx.strokeStyle = `rgba(${nebula.colors.center}, ${brightness * 0.6 * twinkle})`
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.arc(0, 0, effectiveSize * 1.1, 0, Math.PI * 2)
            ctx.stroke()
          }
        } else {
          // Pillar nebula (vertical structure)
          const pillarWidth = effectiveSize * 0.2
          const pillarHeight = effectiveSize * 0.8

          // Pillar glow
          const pillarGlow = ctx.createLinearGradient(-pillarWidth, -pillarHeight / 2, pillarWidth, pillarHeight / 2)
          pillarGlow.addColorStop(0, `rgba(${nebula.colors.edge}, ${brightness * 0.3 * pulse})`)
          pillarGlow.addColorStop(0.5, `rgba(${nebula.colors.mid}, ${brightness * 0.6 * pulse})`)
          pillarGlow.addColorStop(1, `rgba(${nebula.colors.edge}, ${brightness * 0.3 * pulse})`)

          ctx.fillStyle = pillarGlow
          ctx.beginPath()
          ctx.ellipse(0, 0, pillarWidth * 1.5, pillarHeight, 0, 0, Math.PI * 2)
          ctx.fill()

          // Pillar core
          const coreGradient = ctx.createLinearGradient(-pillarWidth * 0.5, -pillarHeight / 2, pillarWidth * 0.5, pillarHeight / 2)
          coreGradient.addColorStop(0, `rgba(${nebula.colors.center}, ${brightness * 0.8 * pulse})`)
          coreGradient.addColorStop(0.5, `rgba(${nebula.colors.mid}, ${brightness * 1.0 * pulse})`)
          coreGradient.addColorStop(1, `rgba(${nebula.colors.center}, ${brightness * 0.8 * pulse})`)

          ctx.fillStyle = coreGradient
          ctx.beginPath()
          ctx.ellipse(0, 0, pillarWidth * 0.6, pillarHeight * 0.9, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate(performance.now())

    return () => {
      window.removeEventListener("resize", resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      isInitializedRef.current = false
    }
  }, [atmosphereColor])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    e.stopPropagation()

    const rect = canvas.getBoundingClientRect()
    const clickX = (e.clientX - rect.left) / rect.width
    const clickY = (e.clientY - rect.top) / rect.height

    // Check galaxies
    const clickedGalaxy = galaxiesRef.current.find((galaxy) => {
      const dist = Math.hypot(clickX - galaxy.x, clickY - galaxy.y)
      return dist < (galaxy.size * 2.5) / rect.width
    })

    if (clickedGalaxy) {
      clickRippleRef.current = { x: clickedGalaxy.x, y: clickedGalaxy.y, time: 0, type: "galaxy" }
      playPianoNote("C5", 0.8)

      // Open modal with galaxy information
      setSelectedType(clickedGalaxy.type)
      setSelectedColor(`rgb(${clickedGalaxy.colors.core})`)
      setSelectedPosition({
        x: clickedGalaxy.x * window.innerWidth,
        y: clickedGalaxy.y * window.innerHeight
      })
      setSelectedPosition({
        x: clickedGalaxy.x * window.innerWidth,
        y: clickedGalaxy.y * window.innerHeight
      })
      setSelectedSong(clickedGalaxy.song)
      setModalOpen(true)

      // Visual feedback: temporary brightness boost
      clickedGalaxy.brightness *= 1.5
      setTimeout(() => {
        if (clickedGalaxy) clickedGalaxy.brightness /= 1.5
      }, 200)
      return
    }

    // Check nebulas
    const clickedNebula = nebulasRef.current.find((nebula) => {
      const dist = Math.hypot(clickX - nebula.x, clickY - nebula.y)
      return dist < (nebula.size * 2.5) / rect.width
    })

    if (clickedNebula) {
      clickRippleRef.current = { x: clickedNebula.x, y: clickedNebula.y, time: 0, type: "nebula" }
      playPianoNote("E", 0.8)

      // Open modal with nebula information
      setSelectedType(clickedNebula.shape)
      setSelectedColor(`rgb(${clickedNebula.colors.center})`)
      setSelectedPosition({
        x: clickedNebula.x * window.innerWidth,
        y: clickedNebula.y * window.innerHeight
      })
      setSelectedPosition({
        x: clickedNebula.x * window.innerWidth,
        y: clickedNebula.y * window.innerHeight
      })
      setSelectedSong(clickedNebula.song)
      setModalOpen(true)

      // Visual feedback: temporary brightness boost
      clickedNebula.brightness *= 1.5
      setTimeout(() => {
        if (clickedNebula) clickedNebula.brightness /= 1.5
      }, 200)
      return
    }

    // Forward interactions
    if (canvasRef.current) {
      canvasRef.current.style.pointerEvents = "none"
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY)
      canvasRef.current.style.pointerEvents = "auto"

      if (elementBelow && elementBelow instanceof HTMLElement) {
        elementBelow.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: e.clientX,
          clientY: e.clientY
        }))
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer z-5"
        onClick={handleCanvasClick}
      />

      {hoveredObject && (
        <div
          className="fixed pointer-events-none text-center z-30"
          style={{
            left: `${Math.max(window.innerWidth * 0.1, Math.min(window.innerWidth * 0.9, hoveredObject.x * (typeof window !== "undefined" ? window.innerWidth : 1920)))}px`,
            top: `${hoveredObject.y * (typeof window !== "undefined" ? window.innerHeight : 1080) - 60}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-purple-400/30">
            <p className="text-xs text-purple-100/40 uppercase tracking-widest mb-1">
              {hoveredObject.song.artist}
            </p>
            <div className="h-[1px] w-full bg-gradient-to-r from-purple-100/20 to-transparent mb-2" />
            <p className="text-xs text-purple-100/60 italic">
              クリックして詳細を見る
            </p>
          </div>
        </div>
      )}

      <CelestialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={selectedType ?? "star"}
        color={selectedColor}
        position={selectedPosition}
        song={selectedSong}
      />
    </>
  )
}

