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
}

interface ShootingStarsProps {
    frequency?: number // bursts per minute
}

export function ShootingStars({ frequency = 6 }: ShootingStarsProps) {
    const [stars, setStars] = useState<Star[]>([])

    useEffect(() => {
        let starId = 0

        const createStar = (burstDelay: number = 0): Star => {
            // Start from top-right corner area (85-100% width, 0-15% height)
            const startX = 85 + Math.random() * 15
            const startY = Math.random() * 15

            // Diagonal trajectory toward bottom of screen (full travel)
            const angle = 35 + Math.random() * 20 // 35-55 degrees

            // Calculate distance to ensure star reaches bottom of screen
            const radians = (angle * Math.PI) / 180
            // Target: bottom of screen (110% to go slightly beyond viewport)
            const targetY = 110
            const verticalDistance = targetY - startY
            const totalDistance = verticalDistance / Math.sin(radians)

            const endX = startX - totalDistance * Math.cos(radians)
            const endY = targetY

            // Enhanced color palette with glow
            const colorVariants = [
                { color: "rgba(255, 255, 255, 1)", glow: "rgba(147, 197, 253, 0.8)" }, // White with blue glow
                { color: "rgba(147, 197, 253, 1)", glow: "rgba(59, 130, 246, 0.9)" }, // Blue
                { color: "rgba(196, 181, 253, 1)", glow: "rgba(139, 92, 246, 0.8)" }, // Purple
                { color: "rgba(251, 191, 36, 1)", glow: "rgba(245, 158, 11, 0.9)" }, // Gold
            ]
            const selectedColor = colorVariants[Math.floor(Math.random() * colorVariants.length)]

            return {
                id: starId++,
                startX,
                startY,
                endX,
                endY,
                duration: 1.5 + Math.random() * 1, // 1.5-2.5s for faster, realistic speed
                delay: burstDelay,
                size: 1 + Math.random() * 1, // 1-2px head (thinner, more realistic)
                color: selectedColor.color,
                glowColor: selectedColor.glow,
            }
        }

        const spawnBurst = () => {
            // Create a burst of 3-5 shooting stars
            const burstSize = 3 + Math.floor(Math.random() * 3)
            const newStars: Star[] = []

            for (let i = 0; i < burstSize; i++) {
                // Stagger stars slightly within the burst (0-300ms)
                const burstDelay = Math.random() * 0.3
                const newStar = createStar(burstDelay)
                newStars.push(newStar)

                // Remove star after animation completes
                setTimeout(() => {
                    setStars((prev) => prev.filter((s) => s.id !== newStar.id))
                }, (newStar.duration + newStar.delay) * 1000 + 500)
            }

            setStars((prev) => [...prev, ...newStars])
        }

        // Spawn burst every 10 seconds (6 bursts per minute)
        const interval = 10000 // 10 seconds
        const timer = setInterval(spawnBurst, interval)

        // Spawn initial burst after 2 seconds
        const initialTimer = setTimeout(spawnBurst, 2000)

        return () => {
            clearInterval(timer)
            clearTimeout(initialTimer)
        }
    }, [frequency])

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatePresence>
                {stars.map((star) => (
                    <motion.div
                        key={star.id}
                        className="absolute"
                        initial={{
                            left: `${star.startX}%`,
                            top: `${star.startY}%`,
                            opacity: 0,
                        }}
                        animate={{
                            left: `${star.endX}%`,
                            top: `${star.endY}%`,
                            opacity: [0, 1, 1, 0.6, 0],
                        }}
                        transition={{
                            duration: star.duration,
                            delay: star.delay,
                            ease: [0.25, 0.1, 0.25, 1], // Smoother easing
                            opacity: {
                                times: [0, 0.05, 0.5, 0.9, 1],
                                duration: star.duration,
                            },
                        }}
                    >
                        {/* Main trail */}
                        <div
                            style={{
                                width: "180px", // Longer trail
                                height: `${star.size}px`,
                                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  ${star.glowColor} 20%,
                  ${star.color} 70%, 
                  rgba(255,255,255,1) 100%)`,
                                boxShadow: `
                  0 0 ${star.size * 4}px ${star.glowColor},
                  0 0 ${star.size * 8}px ${star.glowColor},
                  0 0 ${star.size * 12}px ${star.color}`,
                                borderRadius: "50%",
                                transform: "rotate(-35deg)",
                                filter: "blur(0.5px)",
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
                                boxShadow: `0 0 ${star.size * 6}px rgba(255,255,255,0.9)`,
                                borderRadius: "50%",
                            }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
