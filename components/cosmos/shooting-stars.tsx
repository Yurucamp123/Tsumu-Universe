"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Star {
    id: number
    startX: number
    startY: number
    endX: number
    endY: number
    duration: number
    delay: number
    size: number
    color: string
    glowColor: string
    angle: number // Actual trajectory angle for proper trail rotation
}

interface ShootingStarsProps {
    frequency?: number // bursts per minute
}

export function ShootingStars({ frequency = 6 }: ShootingStarsProps) {
    const [stars, setStars] = useState<Star[]>([])
    const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)

    // Track viewport width for responsive scaling
    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        let starId = 0

        const createStar = (burstDelay: number = 0): Star => {
            // Get actual viewport dimensions for accurate calculations
            const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1920
            const viewportH = typeof window !== 'undefined' ? window.innerHeight : 1080

            // Start from top-left corner area (0-15% width, 0-15% height) in pixels
            const startXPx = Math.random() * 0.15 * viewportW
            const startYPx = Math.random() * 0.15 * viewportH

            // Responsive angle - steeper on smaller screens for better visibility
            const isMobile = viewportWidth < 768
            const isTablet = viewportWidth >= 768 && viewportWidth < 1024
            const angle = isMobile ? 45 : isTablet ? 37 : 30 // Mobile: 45°, Tablet: 37°, Desktop: 30°

            // Calculate distance to ensure star reaches bottom of screen
            const radians = (angle * Math.PI) / 180
            // Target: bottom of screen (110% to go slightly beyond viewport) in pixels
            const targetYPx = 1.1 * viewportH
            const verticalDistancePx = targetYPx - startYPx
            const totalDistancePx = verticalDistancePx / Math.sin(radians)

            const endXPx = startXPx + totalDistancePx * Math.cos(radians)
            const endYPx = targetYPx

            // Convert back to percentages for storage
            const startX = (startXPx / viewportW) * 100
            const startY = (startYPx / viewportH) * 100
            const endX = (endXPx / viewportW) * 100
            const endY = (endYPx / viewportH) * 100

            // Enhanced color palette with glow
            const colorVariants = [
                { color: "rgba(255, 255, 255, 1)", glow: "rgba(147, 197, 253, 0.8)" }, // White with blue glow
                { color: "rgba(147, 197, 253, 1)", glow: "rgba(59, 130, 246, 0.9)" }, // Blue
                { color: "rgba(196, 181, 253, 1)", glow: "rgba(139, 92, 246, 0.8)" }, // Purple
                { color: "rgba(251, 191, 36, 1)", glow: "rgba(245, 158, 11, 0.9)" }, // Gold
            ]
            const selectedColor = colorVariants[Math.floor(Math.random() * colorVariants.length)]

            // Responsive sizing based on viewport
            const baseSize = isMobile ? 0.8 : isTablet ? 1 : 1.2

            // Responsive speed - slower on smaller screens for better visibility
            const baseDuration = isMobile ? 1.2 : isTablet ? 1.0 : 0.8
            const durationVariation = 0.4

            return {
                id: starId++,
                startX,
                startY,
                endX,
                endY,
                duration: baseDuration + Math.random() * durationVariation, // Responsive speed
                delay: burstDelay,
                size: (1 + Math.random() * 1) * baseSize, // Responsive size
                color: selectedColor.color,
                glowColor: selectedColor.glow,
                angle: angle, // Use responsive angle for perfect alignment
            }
        }

        const spawnBurst = () => {
            // Create a burst of 1-5 shooting stars
            const burstSize = 1 + Math.floor(Math.random() * 5) // 1-5 stars
            const newStars: Star[] = []

            for (let i = 0; i < burstSize; i++) {
                // Stagger stars within the burst (100-300ms apart)
                const burstDelay = i * (0.1 + Math.random() * 0.2)
                const newStar = createStar(burstDelay)
                newStars.push(newStar)

                // Remove star after animation completes
                setTimeout(() => {
                    setStars((prev) => prev.filter((s) => s.id !== newStar.id))
                }, (newStar.duration + newStar.delay) * 1000 + 500)
            }

            setStars((prev) => [...prev, ...newStars])
        }

        // Spawn bursts every 3-5 seconds for realistic meteor shower
        const spawnInterval = () => {
            spawnBurst()
            // Random interval between 3-5 seconds
            const nextInterval = 3000 + Math.random() * 2000
            return setTimeout(() => {
                spawnInterval()
            }, nextInterval)
        }

        // Start spawning after 2 seconds
        const initialTimer = setTimeout(() => {
            spawnInterval()
        }, 2000)

        return () => {
            clearTimeout(initialTimer)
        }
    }, [frequency, viewportWidth])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatePresence>
                {stars.map((star) => {
                    // Calculate pixel positions for transform
                    const startXPx = `${star.startX}vw`
                    const startYPx = `${star.startY}vh`
                    const endXPx = `${star.endX}vw`
                    const endYPx = `${star.endY}vh`

                    return (
                        <motion.div
                            key={star.id}
                            className="absolute top-0 left-0"
                            initial={{
                                x: startXPx,
                                y: startYPx,
                                opacity: 0,
                            }}
                            animate={{
                                x: endXPx,
                                y: endYPx,
                                opacity: [0, 1, 1, 0.6, 0],
                            }}
                            transition={{
                                duration: star.duration,
                                delay: star.delay,
                                ease: "linear", // Linear easing for perfectly straight trajectory
                                opacity: {
                                    times: [0, 0.05, 0.5, 0.9, 1],
                                    duration: star.duration,
                                },
                            }}
                        >
                            {/* Main trail */}
                            <div
                                style={{
                                    width: viewportWidth < 768 ? "100px" : viewportWidth < 1024 ? "140px" : "180px", // Responsive trail length
                                    height: `${star.size}px`,
                                    background: `linear-gradient(to right, 
                  transparent 0%, 
                  ${star.glowColor} 20%,
                  ${star.color} 70%, 
                  rgba(255,255,255,1) 100%)`,
                                    boxShadow: `
                  0 0 ${star.size * (viewportWidth < 768 ? 3 : 4)}px ${star.glowColor},
                  0 0 ${star.size * (viewportWidth < 768 ? 6 : 8)}px ${star.glowColor},
                  0 0 ${star.size * (viewportWidth < 768 ? 9 : 12)}px ${star.color}`,
                                    borderRadius: "50%",
                                    transform: `rotate(${star.angle}deg)`, // Use calculated trajectory angle
                                    filter: viewportWidth < 768 ? "blur(0.3px)" : "blur(0.5px)",
                                }}
                            />
                            {/* Bright head */}
                            <div
                                className="absolute"
                                style={{
                                    right: "0",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: `${star.size * 2}px`,
                                    height: `${star.size * 2}px`,
                                    background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${star.color} 50%, transparent 100%)`,
                                    boxShadow: `0 0 ${star.size * (viewportWidth < 768 ? 4 : 6)}px rgba(255,255,255,0.9)`,
                                    borderRadius: "50%",
                                }}
                            />
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
