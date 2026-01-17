"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect, useState } from "react"
import { Sparkles, Mail } from "lucide-react"

interface MessageStarProps {
    onOpen: () => void
}

export function MessageStar({ onOpen }: MessageStarProps) {
    const controls = useAnimation()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Start animation loop
        const animateStar = async () => {
            setIsVisible(true)

            // Randomize starting delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 2000))

            // Initial position (off-screen left/right)
            const startFromLeft = Math.random() > 0.5
            const startX = startFromLeft ? -100 : window.innerWidth + 100
            const endX = startFromLeft ? window.innerWidth + 100 : -100

            // Horizon Y position (70% - 85% of screen height)
            const y = window.innerHeight * (0.7 + Math.random() * 0.15)

            await controls.start({
                x: [startX, endX],
                y: [y, y - 20, y], // Subtle wave
                opacity: [0, 1, 1, 0],
                rotate: startFromLeft ? 360 : -360,
                transition: {
                    duration: 20 + Math.random() * 10, // Slow drift 20-30s
                    ease: "linear",
                    times: [0, 0.1, 0.9, 1]
                }
            })

            setIsVisible(false)
            // Loop
            animateStar()
        }

        animateStar()

        return () => {
            controls.stop()
        }
    }, [controls])

    return (
        <motion.div
            animate={controls}
            className="fixed z-20 cursor-pointer group pointer-events-auto"
            onClick={onOpen}
            whileHover={{ scale: 1.2 }}
        >
            <div className="relative">
                {/* Star Core */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-amber-200 animate-pulse drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]" />
                    <div className="absolute inset-0 bg-amber-400/30 blur-xl rounded-full" />
                </div>

                {/* Trail Effect */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent blur-sm -z-10"
                    style={{ transform: "rotate(-15deg)" }}
                />

                {/* Hint Text (only visible on hover) */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-amber-100 text-xs tracking-widest bg-black/50 backdrop-blur px-2 py-1 rounded border border-amber-500/30">
                        流れ星に願いを
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
