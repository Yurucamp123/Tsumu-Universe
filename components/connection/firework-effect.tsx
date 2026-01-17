"use client"

import { useEffect, useRef } from "react"

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    alpha: number
    color: string
    size: number
}

interface FireworkEffectProps {
    onComplete: () => void
}

export function FireworkEffect({ onComplete }: FireworkEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const animationRef = useRef<number | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d", { alpha: false })
        if (!ctx) return

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        // Optimized: fewer, larger explosions
        const createExplosion = (x: number, y: number, particleCount: number, colorScheme: string[]) => {
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount
                const velocity = 2 + Math.random() * 4
                const color = colorScheme[Math.floor(Math.random() * colorScheme.length)]

                particlesRef.current.push({
                    x,
                    y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    alpha: 1,
                    color,
                    size: Math.random() * 3 + 2,
                })
            }
        }

        // Reduced color schemes
        const colorSchemes = [
            ['#FFD700', '#FFA500', '#FF8C00'], // Gold
            ['#FF1493', '#FF69B4', '#FFB6C1'], // Pink
            ['#9370DB', '#BA55D3', '#DDA0DD'], // Purple
        ]

        // Fewer explosions with reduced particle count
        createExplosion(canvas.width / 2, canvas.height / 2, 120, colorSchemes[0])

        const explosionSchedule = [
            { delay: 500, x: 0.35, y: 0.45, count: 80, scheme: 1 },
            { delay: 1000, x: 0.65, y: 0.45, count: 80, scheme: 2 },
            { delay: 1500, x: 0.5, y: 0.35, count: 100, scheme: 0 },
            { delay: 2500, x: 0.25, y: 0.55, count: 90, scheme: 1 },
            { delay: 3500, x: 0.75, y: 0.55, count: 90, scheme: 2 },
            { delay: 4500, x: 0.5, y: 0.5, count: 120, scheme: 0 },
            { delay: 6000, x: 0.4, y: 0.4, count: 85, scheme: 1 },
            { delay: 7500, x: 0.6, y: 0.4, count: 85, scheme: 2 },
            { delay: 9000, x: 0.5, y: 0.6, count: 100, scheme: 0 },
            { delay: 10500, x: 0.3, y: 0.5, count: 80, scheme: 1 },
            { delay: 12000, x: 0.7, y: 0.5, count: 80, scheme: 2 },
            { delay: 13500, x: 0.5, y: 0.45, count: 150, scheme: 0 }, // Grand finale
        ]

        explosionSchedule.forEach(({ delay, x, y, count, scheme }) => {
            setTimeout(() => {
                createExplosion(
                    canvas.width * x,
                    canvas.height * y,
                    count,
                    colorSchemes[scheme]
                )
            }, delay)
        })

        let lastTime = performance.now()

        const animate = (currentTime: number) => {
            if (!ctx || !canvas) return

            const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2)
            lastTime = currentTime

            // Simple fade
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Batch rendering
            particlesRef.current = particlesRef.current.filter(p => {
                p.x += p.vx * deltaTime
                p.y += p.vy * deltaTime
                p.vy += 0.1 * deltaTime
                p.alpha -= 0.012 * deltaTime

                if (p.alpha <= 0) return false

                // Simple rendering without gradients
                ctx.globalAlpha = p.alpha
                ctx.fillStyle = p.color
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fill()

                return true
            })

            ctx.globalAlpha = 1

            if (particlesRef.current.length > 0) {
                animationRef.current = requestAnimationFrame(animate)
            } else {
                setTimeout(onComplete, 500)
            }
        }

        animate(performance.now())

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [onComplete])

    return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" />
}
