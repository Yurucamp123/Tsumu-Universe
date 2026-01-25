"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface GiftBoxLandingProps {
    onOpen: () => void
}

export function GiftBoxLanding({ onOpen }: GiftBoxLandingProps) {
    const [mounted, setMounted] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [isOpening, setIsOpening] = useState(false)
    const [showLight, setShowLight] = useState(false)
    const [showMagic, setShowMagic] = useState(false)
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number; size: number }>>([])
    const [magicParticles, setMagicParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string; size: number; delay: number }>>([])

    useEffect(() => {
        setMounted(true)

        // Ambient particles
        const newParticles = Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 4,
            duration: 5 + Math.random() * 4,
            size: 2 + Math.random() * 3,
        }))
        setParticles(newParticles)

        // Physics-based magic particles (Confetti-like explosion)
        const colors = ['#fbbf24', '#f59e0b', '#ec4899', '#d946ef', '#8b5cf6', '#ffffff']
        const newMagicParticles = Array.from({ length: 150 }, (_, i) => {
            const angle = (i / 150) * Math.PI * 2 + (Math.random() - 0.5)
            const velocity = 5 + Math.random() * 15
            return {
                id: i,
                x: 50, // Center percentage
                y: 50,
                vx: Math.cos(angle) * velocity, // Velocity X
                vy: Math.sin(angle) * velocity - 15, // Velocity Y (initial upward boost)
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 2 + Math.random() * 4,
                delay: Math.random() * 0.2,
            }
        })
        setMagicParticles(newMagicParticles)
    }, [])

    const handleClick = () => {
        if (isOpening) return
        setIsOpening(true)
        // Timing sequence for realistic feel
        setTimeout(() => setShowLight(true), 200) // Light starts leaking early
        setTimeout(() => setShowMagic(true), 500) // Explosion happens when lid flies off
        setTimeout(() => onOpen(), 3500)
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 overflow-hidden">
            {/* Starfield */}
            <div className="absolute inset-0">
                {mounted && Array.from({ length: 120 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: Math.random() * 2 + 0.5,
                            height: Math.random() * 2 + 0.5,
                        }}
                        animate={{
                            opacity: [0.2, 0.9, 0.2],
                            scale: [1, 1.4, 1],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            {/* Floating particles */}
            {mounted && particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full blur-sm"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                        background: particle.id % 3 === 0
                            ? 'radial-gradient(circle, #fbbf24, transparent)'
                            : particle.id % 3 === 1
                                ? 'radial-gradient(circle, #ec4899, transparent)'
                                : 'radial-gradient(circle, #a855f7, transparent)',
                        boxShadow: `0 0 ${particle.size * 4}px ${particle.id % 3 === 0 ? '#fbbf24' : particle.id % 3 === 1 ? '#ec4899' : '#a855f7'
                            }`,
                    }}
                    animate={{
                        y: [0, -50, 0],
                        x: [0, Math.sin(particle.id) * 30, 0],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Enhanced Magical Effects Overlay */}
            <AnimatePresence>
                {showMagic && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                        {/* 1. Flash Burst */}
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0 bg-white/40 mix-blend-overlay"
                        />

                        {/* 2. Shockwave Rings */}
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={`shockwave-${i}`}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50"
                                initial={{ width: 0, height: 0, opacity: 0.8, borderWidth: 10 }}
                                animate={{
                                    width: 1500,
                                    height: 1500,
                                    opacity: 0,
                                    borderWidth: 0
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 0.1,
                                    ease: "easeOut"
                                }}
                            />
                        ))}

                        {/* 3. Physics Particles Explosion */}
                        {magicParticles.map((p) => (
                            <motion.div
                                key={`mp-${p.id}`}
                                className="absolute rounded-full"
                                style={{
                                    width: p.size,
                                    height: p.size,
                                    backgroundColor: p.color,
                                    boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                                    left: '50%',
                                    top: '50%',
                                }}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                                animate={{
                                    x: p.vx * 20, // Scale up trajectory
                                    y: p.vy * 20 + 200, // Add gravity effect (200px drop)
                                    opacity: [1, 1, 0],
                                    scale: [0, 1.5, 0],
                                }}
                                transition={{
                                    duration: 2 + Math.random(),
                                    delay: p.delay,
                                    ease: "circOut" // Initial pop then slow down
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
                {/* Japanese text */}
                <motion.div
                    initial={{ opacity: 0, y: -60 }}
                    animate={{
                        opacity: isOpening ? 0 : 1,
                        y: isOpening ? -80 : 0,
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-center mb-16"
                >
                    <motion.h1
                        className="text-6xl md:text-7xl font-serif mb-2"
                        style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 50%, #f59e0b 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 900,
                            letterSpacing: '0.15em',
                            filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))',
                        }}
                    >
                        特別な贈り物
                    </motion.h1>
                    <motion.p
                        className="text-xl md:text-2xl font-serif mt-4"
                        style={{
                            background: 'linear-gradient(90deg, #e9d5ff 0%, #f3e8ff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                        }}
                    >
                        あなたのために
                    </motion.p>
                </motion.div>

                {/* Animated Gift box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        rotateY: 0,
                    }}
                    transition={{ duration: 1.5, delay: 1, type: "spring", bounce: 0.4 }}
                    className="relative cursor-pointer select-none"
                    onClick={handleClick}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    style={{ perspective: '2000px' }}
                >
                    {/* Gift box container */}
                    <motion.div
                        className="relative"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{
                            y: isHovering && !isOpening ? -15 : [0, -12, 0],
                            rotateY: isHovering && !isOpening ? 8 : 0,
                            rotateX: isHovering && !isOpening ? -6 : 0,
                            scale: isOpening ? 0.9 : 1, // Slight squash before opening could be nice, or simple
                        }}
                        transition={{
                            y: isHovering ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: "easeInOut" },
                            rotateY: { duration: 0.4 },
                            rotateX: { duration: 0.4 },
                            scale: { duration: 0.3 },
                        }}
                    >
                        {/* Lid with enhanced opening physics */}
                        <motion.div
                            className="relative w-56 h-24"
                            style={{
                                transformStyle: 'preserve-3d',
                                transformOrigin: 'bottom center',
                                zIndex: 10,
                            }}
                            animate={{
                                rotateX: isOpening ? -200 : 0, // Opens wider
                                y: isOpening ? -300 : 0, // Flies higher
                                z: isOpening ? 200 : 0, // Flies forward/out
                                rotateY: isOpening ? 45 : 0, // Tumbles a bit
                                rotateZ: isOpening ? 15 : 0,
                                opacity: isOpening ? 0 : 1,
                            }}
                            transition={{
                                duration: 1.2,
                                ease: [0.17, 0.67, 0.63, 1.48], // BackIn or Spring-like ease
                                delay: 0.1,
                            }}
                        >
                            {/* Lid Content (Unchanged visual) */}
                            {/* Lid top */}
                            <div className="absolute w-56 h-56 rounded-xl" style={{ transform: 'rotateX(-90deg) translateZ(12px)', background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 40%, #f472b6 70%, #fda4af 100%)', boxShadow: 'inset 0 0 60px rgba(255, 255, 255, 0.4), 0 10px 40px rgba(236, 72, 153, 0.5)' }}>
                                <div className="absolute inset-4 border-2 border-yellow-300/40 rounded-lg" />
                                <div className="absolute inset-7 border border-yellow-200/30 rounded-md" />
                            </div>
                            {/* Lid sides */}
                            <div className="absolute w-56 h-24 rounded-t-xl" style={{ transform: 'translateZ(112px)', background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)', boxShadow: 'inset 0 10px 30px rgba(0, 0, 0, 0.3)' }} />
                            <div className="absolute w-56 h-24" style={{ transform: 'translateZ(-112px) rotateY(180deg)', background: 'linear-gradient(180deg, #b91c1c 0%, #991b1b 100%)' }} />
                            <div className="absolute w-56 h-24" style={{ transform: 'rotateY(-90deg) translateZ(112px)', background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)' }} />
                            <div className="absolute w-56 h-24" style={{ transform: 'rotateY(90deg) translateZ(112px)', background: 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)' }} />
                            {/* Lid Ribbons */}
                            <motion.div className="absolute w-14 h-56 rounded-sm" style={{ transform: 'rotateX(-90deg) translateZ(13px)', left: '50%', marginLeft: '-28px', background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 20%, #fbbf24 50%, #f59e0b 100%)', boxShadow: '0 0 30px rgba(251, 191, 36, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5)' }} />
                            <motion.div className="absolute w-56 h-14 rounded-sm" style={{ transform: 'rotateX(-90deg) translateZ(13px)', top: '50%', marginTop: '-28px', background: 'linear-gradient(90deg, #fef3c7 0%, #fde68a 20%, #fbbf24 50%, #f59e0b 100%)', boxShadow: '0 0 30px rgba(251, 191, 36, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5)' }} />
                            {/* Bow */}
                            <motion.div className="absolute" style={{ transform: 'rotateX(-90deg) translateZ(14px)', left: '50%', top: '50%', marginLeft: '-40px', marginTop: '-40px', width: '80px', height: '80px' }} animate={{ scale: isHovering ? 1.15 : [1, 1.06, 1], rotate: isHovering ? 5 : 0 }} transition={{ scale: isHovering ? { duration: 0.3 } : { duration: 2.5, repeat: Infinity }, rotate: { duration: 0.3 } }}>
                                <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%, #fef3c7 0%, #fde68a 25%, #fbbf24 60%, #f59e0b 100%)', boxShadow: '0 0 40px rgba(251, 191, 36, 1), inset 0 0 30px rgba(255, 255, 255, 0.6)' }}><div className="absolute inset-3 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400" /><div className="absolute inset-6 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300" /></div>
                                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-14 rounded-full" style={{ background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)', transform: 'translateY(-50%) rotate(-45deg) scaleX(0.75)', boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)' }} />
                                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-14 rounded-full" style={{ background: 'linear-gradient(225deg, #fde68a 0%, #fbbf24 100%)', transform: 'translateY(-50%) rotate(45deg) scaleX(0.75)', boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)' }} />
                                <div className="absolute -bottom-6 -left-4 w-10 h-16 rounded-b-full" style={{ background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)', transform: 'rotate(-15deg)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.6)' }} />
                                <div className="absolute -bottom-6 -right-4 w-10 h-16 rounded-b-full" style={{ background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)', transform: 'rotate(15deg)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.6)' }} />
                            </motion.div>
                        </motion.div>

                        {/* Box body (Unchanged visual) */}
                        <div className="relative w-56 h-56" style={{ transformStyle: 'preserve-3d' }}>
                            <div className="absolute w-56 h-56 rounded-xl" style={{ transform: 'translateZ(112px)', background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 30%, #ec4899 70%, #f472b6 100%)', boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.3), inset 0 20px 40px rgba(255, 255, 255, 0.15)' }}><div className="absolute inset-4 border-2 border-yellow-300/30 rounded-lg" /></div>
                            <div className="absolute w-56 h-56 rounded-xl" style={{ transform: 'translateZ(-112px) rotateY(180deg)', background: 'linear-gradient(135deg, #991b1b 0%, #be123c 50%, #db2777 100%)' }} />
                            <div className="absolute w-56 h-56" style={{ transform: 'rotateY(-90deg) translateZ(112px)', background: 'linear-gradient(135deg, #b91c1c 0%, #db2777 100%)', boxShadow: 'inset 20px 0 40px rgba(0, 0, 0, 0.3)' }} />
                            <div className="absolute w-56 h-56" style={{ transform: 'rotateY(90deg) translateZ(112px)', background: 'linear-gradient(135deg, #b91c1c 0%, #db2777 100%)', boxShadow: 'inset -20px 0 40px rgba(0, 0, 0, 0.3)' }} />
                            <div className="absolute w-56 h-56 rounded-xl" style={{ transform: 'rotateX(90deg) translateZ(112px)', background: 'linear-gradient(135deg, #7f1d1d 0%, #881337 100%)' }} />
                            <div className="absolute w-14 h-56 rounded-sm" style={{ transform: 'translateZ(113px)', left: '50%', marginLeft: '-28px', background: 'linear-gradient(180deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)', boxShadow: '0 0 25px rgba(251, 191, 36, 0.7)' }} />
                            <div className="absolute w-56 h-14 rounded-sm" style={{ transform: 'translateZ(113px)', top: '50%', marginTop: '-28px', background: 'linear-gradient(90deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)', boxShadow: '0 0 25px rgba(251, 191, 36, 0.7)' }} />

                            {/* Inner Light Glow (NO SQUARE, NO STAR) */}
                            <AnimatePresence>
                                {showLight && (
                                    <>
                                        {/* Soft Inner Glow (Spherical) */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{
                                                opacity: [0, 0.8, 1, 0],
                                                scale: [0.5, 1.2, 1.5, 2]
                                            }}
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-2xl"
                                            style={{
                                                transform: 'translateZ(100px)',
                                                background: 'radial-gradient(circle, rgba(253, 224, 71, 0.6) 0%, transparent 70%)',
                                            }}
                                            transition={{ duration: 2 }}
                                        />

                                        {/* Spiral magic rising */}
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={`spiral-${i}`}
                                                className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-white box-content border-2 border-yellow-300"
                                                style={{ transform: 'translateZ(114px)' }}
                                                initial={{ opacity: 1, y: 0, scale: 1 }}
                                                animate={{
                                                    y: -200 - Math.random() * 100,
                                                    x: [0, Math.sin(i) * 50],
                                                    opacity: 0,
                                                    scale: 0,
                                                }}
                                                transition={{ duration: 1.5, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Instruction */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: isOpening ? 0 : [0.6, 1, 0.6],
                    }}
                    transition={{
                        opacity: isOpening ? { duration: 0.4 } : { duration: 2.5, repeat: Infinity },
                        delay: 2,
                    }}
                    className="absolute bottom-16 text-center"
                >
                    <p
                        className="text-xl md:text-2xl font-serif tracking-widest"
                        style={{
                            background: 'linear-gradient(90deg, #fde68a 0%, #fbbf24 50%, #fde68a 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 600,
                            filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.5))',
                        }}
                    >
                        タップして開く
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
