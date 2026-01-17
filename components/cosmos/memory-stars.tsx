"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type React from "react"
import { useMousePosition } from "@/hooks/use-mouse-position"
import { SONGS } from "@/utils/songs"
import { playPianoNote } from "@/utils/audio"
import type { Song } from "@/types/song"
import { CelestialModal } from "./celestial-modal"

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  brightness: number
  color: string
  songTitle: string
  songArtist: string
  song: Song
  rotation: number
  rotationSpeed: number
}

interface Props {
  emotionalColor?: string
  onSongHover?: (song: Song | null) => void
}

export function MemoryStars({ emotionalColor, onSongHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mousePosHook = useMousePosition()
  const mousePosRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number | null>(null)
  const hoveredStarRef = useRef<Star | null>(null)
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStar, setSelectedStar] = useState<Star | null>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    mousePosRef.current = mousePosHook
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
    }
    resize()
    window.addEventListener("resize", resize)

    if (starsRef.current.length === 0) {
      starsRef.current = SONGS.map((song, i) => {
        const angle = (i / SONGS.length) * Math.PI * 2
        const radius = 250 + Math.random() * 150
        return {
          x: Math.cos(angle) * radius + canvas.width / 2,
          y: Math.sin(angle) * radius + canvas.height / 2,
          vx: 0,
          vy: 0,
          size: 6 + Math.random() * 8, // Smaller stars
          brightness: 0.8 + Math.random() * 0.2,
          color: song.color,
          songTitle: song.title,
          songArtist: song.artist,
          song,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: 0.001 + Math.random() * 0.003,
        }
      })
    }

    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 1.5)
      lastTime = currentTime

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const currentMousePos = mousePosRef.current

      starsRef.current.forEach((star) => {
        // Mouse interaction
        const dx = currentMousePos.x - star.x
        const dy = currentMousePos.y - star.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const interactionRadius = 200

        if (distance < interactionRadius && distance > 0) {
          const normalizedDist = distance / interactionRadius
          // Very gentle movement - reduced force significantly
          const force = Math.pow(1 - normalizedDist, 2.5) * 0.05 * deltaTime
          const angle = Math.atan2(dy, dx)
          star.vx -= Math.cos(angle) * force
          star.vy -= Math.sin(angle) * force
        }

        // Center attraction
        const centerDx = canvas.width / 2 - star.x
        const centerDy = canvas.height / 2 - star.y
        const centerDistance = Math.sqrt(centerDx * centerDx + centerDy * centerDy)
        const homeRadius = 400

        if (centerDistance > homeRadius) {
          const normalizedCenterDist = (centerDistance - homeRadius) / homeRadius
          const force = Math.min(normalizedCenterDist * 0.06 * deltaTime, 0.25)
          const angle = Math.atan2(centerDy, centerDx)
          star.vx += Math.cos(angle) * force
          star.vy += Math.sin(angle) * force
        }

        // Damping
        const damping = Math.pow(0.98, deltaTime)
        star.vx *= damping
        star.vy *= damping

        star.x += star.vx * deltaTime
        star.y += star.vy * deltaTime

        // Boundaries
        const margin = star.size * 1.5
        if (star.x < margin) {
          star.x = margin
          star.vx *= -0.4
        } else if (star.x > canvas.width - margin) {
          star.x = canvas.width - margin
          star.vx *= -0.4
        }
        if (star.y < margin) {
          star.y = margin
          star.vy *= -0.4
        } else if (star.y > canvas.height - margin) {
          star.y = canvas.height - margin
          star.vy *= -0.4
        }

        star.rotation += star.rotationSpeed

        // Hover detection
        const distToMouse = Math.hypot(currentMousePos.x - star.x, currentMousePos.y - star.y)
        const hoverRadius = star.size * 2.2
        const isHovered = distToMouse < hoverRadius

        if (isHovered && hoveredStarRef.current !== star) {
          hoveredStarRef.current = star
          setHoveredStar(star)
          onSongHover?.(star.song)
        } else if (!isHovered && hoveredStarRef.current === star) {
          hoveredStarRef.current = null
          setHoveredStar(null)
          onSongHover?.(null)
        }

        const isHoveredForRender = hoveredStarRef.current === star
        const hoverScale = isHoveredForRender ? 1.3 : 1
        const effectiveSize = star.size * hoverScale

        // Color logic: normal white color when not hovered, song color when hovered
        const color = isHoveredForRender ? star.color : "rgb(255, 255, 255)"
        const brightnessMultiplier = isHoveredForRender ? 1.5 : 0.8
        const twinkle = 0.7 + 0.3 * Math.sin(performance.now() * 0.003 + star.rotation * 2)

        // Parse color to rgba
        const colorMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        const r = colorMatch ? parseInt(colorMatch[1]) : 255
        const g = colorMatch ? parseInt(colorMatch[2]) : 255
        const b = colorMatch ? parseInt(colorMatch[3]) : 255

        // Multi-layer glow for realistic star effect
        // Outer glow (very subtle)
        const outerGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, effectiveSize * 4)
        outerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 0.15 * twinkle})`)
        outerGlow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 0.05 * twinkle})`)
        outerGlow.addColorStop(1, "transparent")
        ctx.fillStyle = outerGlow
        ctx.beginPath()
        ctx.arc(star.x, star.y, effectiveSize * 4, 0, Math.PI * 2)
        ctx.fill()

        // Middle glow
        const middleGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, effectiveSize * 2.5)
        middleGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 0.4 * twinkle})`)
        middleGlow.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 0.15 * twinkle})`)
        middleGlow.addColorStop(1, "transparent")
        ctx.fillStyle = middleGlow
        ctx.beginPath()
        ctx.arc(star.x, star.y, effectiveSize * 2.5, 0, Math.PI * 2)
        ctx.fill()

        // Inner bright core
        ctx.save()
        ctx.translate(star.x, star.y)
        ctx.rotate(star.rotation)

        // Core with sharp edges
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize * 0.8)
        coreGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 1.2 * twinkle})`)
        coreGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 0.9 * twinkle})`)
        coreGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 0.6 * twinkle})`)
        ctx.fillStyle = coreGradient
        ctx.beginPath()
        ctx.arc(0, 0, effectiveSize * 0.7, 0, Math.PI * 2)
        ctx.fill()

        // Sharp center point
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.brightness * brightnessMultiplier * 1.5 * twinkle})`
        ctx.beginPath()
        ctx.arc(0, 0, effectiveSize * 0.3, 0, Math.PI * 2)
        ctx.fill()

        // Rotation ring (only when hovered)
        if (isHoveredForRender) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(0, 0, effectiveSize * 1.1, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Sparkle effect when hovered
        if (isHoveredForRender && twinkle > 0.8) {
          const sparkleSize = effectiveSize * 0.4
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`
          ctx.lineWidth = 1
          // Cross sparkle
          ctx.beginPath()
          ctx.moveTo(-sparkleSize * 2, 0)
          ctx.lineTo(sparkleSize * 2, 0)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, -sparkleSize * 2)
          ctx.lineTo(0, sparkleSize * 2)
          ctx.stroke()
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
  }, [emotionalColor, onSongHover])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    e.stopPropagation()

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    const clickedStar = [...starsRef.current]
      .reverse()
      .find((star) => {
        const dist = Math.hypot(clickX - star.x, clickY - star.y)
        return dist < star.size * 2.2
      })

    if (clickedStar) {
      // Play a pleasant piano note when clicking a star
      // Use different notes based on star index for variety
      const notes: Array<"C" | "D" | "E" | "F" | "G" | "A" | "B" | "C5"> = ["C", "D", "E", "F", "G", "A", "B", "C5"]
      const noteIndex = starsRef.current.indexOf(clickedStar) % notes.length
      playPianoNote(notes[noteIndex], 0.5)

      console.log("Clicked star:", clickedStar.songTitle)

      setSelectedStar(clickedStar)
      setModalOpen(true)
    } else {
      // Forward click to elements below
      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = 'none'
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY)
        canvasRef.current.style.pointerEvents = 'auto'

        if (elementBelow && elementBelow instanceof HTMLElement) {
          const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: e.clientX,
            clientY: e.clientY
          })
          elementBelow.dispatchEvent(event)
        }
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        data-star-canvas
        className="absolute inset-0 w-full h-full cursor-pointer z-25"
        onClick={handleCanvasClick}
      />

      {/* Hover tooltip */}
      {hoveredStar && !modalOpen && (
        <div
          className="fixed pointer-events-none text-center z-30"
          style={{
            left: `${hoveredStar.x}px`,
            top: `${hoveredStar.y - 60}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-400/30">
            <p className="text-sm font-serif text-yellow-100">{hoveredStar.songTitle}</p>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-1">
              {hoveredStar.songArtist}
            </p>
            <div className="h-[1px] w-full bg-white/10 my-1.5" />
            <p className="text-[10px] text-white/30 uppercase tracking-widest italic">
              記憶を再生する
            </p>
          </div>
        </div>
      )}

      <CelestialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type="star"
        color={selectedStar?.color || "rgb(255, 255, 255)"}
        song={selectedStar?.song}
        position={selectedStar ? { x: selectedStar.x, y: selectedStar.y } : undefined}
      />
    </>
  )
}
