"use client"

import type { Song } from "@/types/song"
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Loader2, Pause, Play, X } from "lucide-react"
import { memo, useEffect, useMemo, useRef, useState } from 'react'

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

interface Props {
    isOpen: boolean
    onClose: () => void
    type: string
    color: string
    song?: Song
    position?: { x: number; y: number }
}

const VisualizerBar = memo(({ i, isPlaying, color }: { i: number, isPlaying: boolean, color: string }) => {
    return (
        <div className="flex-1 h-full relative group flex flex-col justify-end items-center">
            {/* Peak Indicator Dot */}
            <motion.div
                animate={isPlaying ? {
                    y: [-5, -15 - (i % 7) * 4 - Math.random() * 10, -5],
                    opacity: [0, 1, 0.4, 0]
                } : { y: -5, opacity: 0 }}
                transition={isPlaying ? {
                    repeat: Infinity,
                    duration: 0.8 + (i % 4) * 0.2,
                    delay: i * 0.03,
                    ease: "easeOut"
                } : { duration: 0.3 }}
                className="w-[3px] h-[3px] rounded-full bg-white shadow-[0_0_8px_#fff] will-change-transform"
                style={{ transform: 'translateZ(0)' }}
            />
            {/* Main Bar */}
            <motion.div
                animate={isPlaying ? {
                    scaleY: [0.3, 0.6 + (i % 10) * 0.04, 0.3, 0.8 + (i % 8) * 0.02, 0.3],
                    opacity: [0.6, 1, 0.6]
                } : { scaleY: 0.1, opacity: 0.3 }}
                transition={isPlaying ? {
                    repeat: Infinity,
                    duration: 1.2 + (i % 5) * 0.2,
                    delay: i * 0.02,
                    ease: "linear"
                } : { duration: 0.5 }}
                className="w-full h-full rounded-t-[3px] origin-bottom will-change-transform"
                style={{
                    background: `linear-gradient(to top, ${color} 0%, #fff 100%)`,
                    boxShadow: `0 0 10px ${color.replace("rgb", "rgba").replace(")", ", 0.2)")}`,
                    transform: 'translateZ(0)'
                }}
            />
        </div>
    )
})

const ReflectionBar = memo(({ i, isPlaying }: { i: number, isPlaying: boolean }) => {
    return (
        <motion.div
            animate={isPlaying ? {
                scaleY: [0.2, 0.4 + (i % 6) * 0.1, 0.2],
                x: [0, 2, -2, 0],
                opacity: [0.05, 0.1, 0.05]
            } : { scaleY: 0.05, opacity: 0.02 }}
            transition={isPlaying ? {
                repeat: Infinity,
                duration: 1.5 + (i % 4) * 0.5,
                ease: "easeInOut"
            } : { duration: 1 }}
            className="flex-1 w-full bg-white rounded-b-full origin-top will-change-transform"
            style={{ transform: 'translateZ(0)' }}
        />
    )
})


// Simple Disc Animation - Subtle ring pulse when playing
const DiscPlayingEffect = memo(({ isPlaying, isBuffering, color }: { isPlaying: boolean, isBuffering: boolean, color: string }) => {
    if (!isPlaying && !isBuffering) return null

    return (
        <>
            {/* Subtle pulse ring on outer edge */}
            <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0, 0.15, 0.1, 0.2, 0],
                    scale: [0.98, 1, 0.99, 1, 0.98],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    boxShadow: `inset 0 0 30px 5px ${color}40, 0 0 20px 2px ${color}20`,
                }}
            />
        </>
    )
})


// Subtle Constellation Sparkles Component - Refined for elegance
const ConstellationSparkles = memo(({ isPlaying, isBuffering, color }: { isPlaying: boolean, isBuffering: boolean, color: string }) => {
    // Generate stable sparkle positions using useMemo (only once)
    const sparkles = useMemo(() => {
        return Array.from({ length: 25 }).map((_, i) => {
            const angle = (i * 137.5) % 360 // Golden angle distribution
            // Modified: Only place sparkles in outer ring (25-45% radius) to avoid center glow
            const radius = 25 + Math.sqrt(i / 25) * 20 // Range: 25-45%
            const x = 50 + Math.cos((angle * Math.PI) / 180) * radius
            const y = 50 + Math.sin((angle * Math.PI) / 180) * radius

            return {
                id: i,
                x,
                y,
                size: 1 + (i % 2) * 0.5, // 1-1.5px (smaller, more subtle)
                duration: 2 + (i % 5) * 0.4, // 2-4s (slower, gentler)
                delay: (i * 0.2) % 4, // Staggered 0-4s
                color: i % 8 === 0 ? color : '#fff'
            }
        })
    }, [color])

    return (
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            {sparkles.map((sparkle) => (
                <motion.div
                    key={`star-${sparkle.id}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={(isPlaying || isBuffering) ? {
                        opacity: [0, 0.5, 0.8, 0.7, 0], // Brighter opacity (max 0.8)
                        scale: [0, 1, 0.9, 1.1, 0], // Subtle scale
                    } : { opacity: 0, scale: 0 }}
                    transition={(isPlaying || isBuffering) ? {
                        duration: sparkle.duration,
                        repeat: Infinity,
                        delay: sparkle.delay,
                        ease: "easeInOut"
                    } : { duration: 0.4 }}
                    className="absolute rounded-full will-change-transform"
                    style={{
                        left: `${sparkle.x}%`,
                        top: `${sparkle.y}%`,
                        width: `${sparkle.size}px`,
                        height: `${sparkle.size}px`,
                        background: sparkle.color,
                        boxShadow: `0 0 ${sparkle.size * 3}px ${sparkle.size}px ${sparkle.color}60, 0 0 ${sparkle.size * 6}px ${sparkle.size * 2}px ${sparkle.color}30`, // Brighter glow
                        filter: 'brightness(1.6)', // Increased brightness
                        transform: 'translateZ(0)'
                    }}
                />
            ))}
        </div>
    )
})


export function CelestialModal({ isOpen, onClose, type, color = "rgb(255, 100, 200)", song }: Props) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isBuffering, setIsBuffering] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)
    const playerRef = useRef<any>(null)
    const playerContainerId = 'youtube-player-container'

    // Extract YouTube ID
    const getYoutubeId = (url?: string) => {
        if (!url) return null
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const youtubeIdVal = song ? getYoutubeId(song.youtubeUrl) : null
    const thumbnailUrl = youtubeIdVal ? `https://img.youtube.com/vi/${youtubeIdVal}/maxresdefault.jpg` : null

    // Load YouTube API - Only on interaction
    useEffect(() => {
        if (!isOpen || !youtubeIdVal || !hasInteracted) return

        let isMounted = true

        const initPlayer = () => {
            // ... existing init logic
            if (!window.YT || !window.YT.Player || !isMounted) return

            if (playerRef.current) {
                // Already initialized
                return
            }

            playerRef.current = new window.YT.Player(playerContainerId, {
                videoId: youtubeIdVal,
                playerVars: {
                    enablejsapi: 1,
                    autoplay: 1, // Always autoplay on init
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    color: 'white',
                    origin: window.location.origin,
                    vq: 'medium',
                    suggestedQuality: 'medium',
                    iv_load_policy: 3,
                    playsinline: 1
                },
                events: {
                    onReady: (event: any) => {
                        if (isMounted) {
                            event.target.playVideo()
                            setIsPlaying(true)
                        }
                    },
                    onStateChange: (event: any) => {
                        if (!isMounted) return
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true)
                            setIsBuffering(false)
                        } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                            setIsPlaying(false)
                            setIsBuffering(false)
                        } else if (event.data === window.YT.PlayerState.BUFFERING) {
                            setIsBuffering(true)
                        }
                    }
                }
            })
        }

        if (!window.YT) {
            const tag = document.createElement('script')
            tag.src = "https://www.youtube.com/iframe_api"
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

            const originalOnReady = window.onYouTubeIframeAPIReady
            window.onYouTubeIframeAPIReady = () => {
                if (originalOnReady) originalOnReady()
                initPlayer()
            }
        } else {
            initPlayer()
        }

        return () => {
            isMounted = false
            // Don't destroy player on unmount to keep state if reopened, 
            // but for this modal architecture we might want cleanup
        }
    }, [isOpen, youtubeIdVal, hasInteracted])




    // Toggle Playback Logic
    const togglePlayback = () => {
        if (!hasInteracted) {
            setHasInteracted(true)
            // Player initialization happens in useEffect when hasInteracted becomes true
            return
        }

        if (!playerRef.current) return

        if (isPlaying) {
            playerRef.current.pauseVideo()
        } else {
            playerRef.current.playVideo()
        }
    }


    useEffect(() => {
        if (!isOpen) {
            setIsPlaying(false)
            if (playerRef.current) {
                playerRef.current.pauseVideo()
            }
        }
    }, [isOpen])

    useEffect(() => {
        setIsPlaying(false)
    }, [song])


    // Japanese translations for types
    const getJPType = (rawType: string) => {
        switch (rawType) {
            case "spiral": return "渦巻銀河"
            case "elliptical": return "楕円銀河"
            case "cloud": return "星雲"
            case "pillar": return "創造の柱"
            case "star": return "記憶の星"
            default: return "天体"
        }
    }

    const getTitle = () => {
        if (song) return song.title
        return getJPType(type)
    }

    const getSubtitle = () => {
        if (song) return song.artist
        if (type.includes("galaxy")) return "銀河系"
        return "星間雲"
    }

    const getDescription = () => {
        if (song) return song.description || "美しいピアノの旋律。"
        if (type === "spiral") return "塵とガス、星々が回転する円盤状の銀河。"
        if (type === "elliptical") return "滑らかな楕円形の星の集まり。"
        return "宇宙に広がるガスと塵の巨大な雲。"
    }

    const visualizerBars = Array.from({ length: 30 })
    const sparkleParticles = Array.from({ length: 25 })

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[20px] cursor-pointer"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-6xl h-[85vh] overflow-hidden rounded-[3rem] border border-white/20 bg-black/40 shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] flex flex-col md:flex-row backdrop-blur-[50px]"
                        style={{
                            boxShadow: `0 0 150px -40px ${color.replace("rgb", "rgba").replace(")", ", 0.5)")}, 
                          inset 0 0 0 1px rgba(255,255,255,0.1),
                          inset 0 0 100px -20px ${color.replace("rgb", "rgba").replace(")", ", 0.1)")}`,
                        }}
                    >
                        {/* Ambient Background Glows */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <motion.div
                                animate={{
                                    scale: isPlaying ? [1, 1.2, 1.1, 1.25, 1] : 1,
                                    opacity: isPlaying ? [0.15, 0.25, 0.2, 0.3, 0.15] : 0.08
                                }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -top-[20%] -right-[10%] w-[90%] h-[90%] rounded-full blur-[160px] mix-blend-screen"
                                style={{ background: color }}
                            />
                            <motion.div
                                animate={{
                                    scale: isPlaying ? [1, 1.3, 1.15, 1.35, 1] : 1,
                                    opacity: isPlaying ? [0.1, 0.2, 0.15, 0.25, 0.1] : 0.05
                                }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[140px] mix-blend-screen"
                                style={{ background: color }}
                            />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-10 right-10 z-50 p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/10 backdrop-blur-2xl group"
                        >
                            <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
                        </button>

                        {/* Left Section: Ultra HD Player (44%) */}
                        <div className="relative w-full md:w-[44%] h-full flex flex-col items-center justify-center p-14 border-b md:border-b-0 md:border-r border-white/10">

                            {/* Advanced Record Player Housing */}
                            <div className="relative mb-16 group">
                                {/* Realistic Groove Shadow */}
                                <div className="absolute inset-x-[-15%] top-[-5%] bottom-[-15%] rounded-full bg-black/40 blur-3xl opacity-60" />

                                {/* SHARP VINYL V4 */}
                                <div className="absolute inset-0 rounded-full z-0 pointer-events-none">
                                    {/* Rhythmic Pulse Ring (Celestial Resonance) */}
                                    <AnimatePresence>
                                        {isPlaying && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                                                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                                className="absolute inset-[-15%] rounded-full border border-white/10 blur-[2px]"
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Halo removed - was causing center glow */}
                                    <div className="absolute inset-[-1px] rounded-full border border-white/10 z-10" />
                                </div>

                                <motion.div
                                    animate={{ rotate: isPlaying ? 360 : 0 }}
                                    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                                    className="relative w-72 h-72 md:w-96 md:h-96 rounded-full shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] p-[4px] bg-gradient-to-br from-white/30 via-white/5 to-black/60 overflow-hidden will-change-transform"
                                >
                                    <div className="w-full h-full rounded-full bg-[#030303] flex items-center justify-center relative">
                                        {/* Ultra-HD Grooves */}
                                        <div className="absolute inset-0 rounded-full opacity-80"
                                            style={{ background: "repeating-radial-gradient(circle, #000 0, #000 1px, #111 1.5px, #000 2px)" }} />

                                        {/* Simple Ring Pulse Effect */}
                                        <DiscPlayingEffect isPlaying={isPlaying} isBuffering={isBuffering} color={color} />

                                        {/* Artwork Label with Realistic Spindle */}
                                        <div
                                            className="w-28 h-28 md:w-36 md:h-36 rounded-full relative z-30 flex items-center justify-center border-[8px] border-[#080808] shadow-[inset_0_0_40px_rgba(0,0,0,1),0_0_20px_rgba(0,0,0,0.8)] overflow-hidden bg-black"
                                        >
                                            {/* Center Spindle Cap (Metallic) */}
                                            <div className="w-6 h-6 rounded-full relative z-40 flex items-center justify-center bg-gradient-to-br from-[#888] via-[#222] to-[#444] border border-white/20 shadow-lg">
                                                <div className="w-1.5 h-1.5 bg-black/40 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Tonearm assembly */}
                                <div className="absolute -top-8 -right-16 w-32 h-44 z-30 pointer-events-none hidden md:block">
                                    <svg viewBox="0 0 100 160" className="w-full h-full filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)]">
                                        <circle cx="85" cy="35" r="14" fill="#111" />
                                        <circle cx="85" cy="35" r="6" fill="#444" />
                                        <motion.g
                                            animate={{ rotate: isPlaying ? [18, 22, 19, 23, 20] : 0, y: isPlaying ? [0, 1, 0, -1, 0] : 0 }}
                                            transition={{ duration: 4, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
                                            style={{ originX: "85px", originY: "35px" }}
                                        >
                                            <path d="M85 35 L25 150" stroke="#222" strokeWidth="8" strokeLinecap="round" />
                                            <path d="M85 35 L25 150" stroke="#444" strokeWidth="3" strokeLinecap="round" />
                                            <rect x="15" y="142" width="20" height="15" rx="3" fill="#0a0a0a" transform="rotate(-30 25 150)" />
                                            <circle cx="25" cy="150" r="2.5" fill="#f00" className="animate-pulse" />
                                        </motion.g>
                                    </svg>
                                </div>

                            </div>

                            {/* Song Meta (Japanese) - Added more spacing */}
                            <div className="mt-12 text-center space-y-5 px-8 relative z-10">
                                <motion.div
                                    key={getTitle()}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h2 className="text-3xl md:text-5xl font-bold text-white font-serif tracking-tight leading-tight mb-4">
                                        {getTitle()}
                                    </h2>
                                    <p className="text-amber-100/30 uppercase tracking-[0.5em] text-[10px] md:text-xs font-black">
                                        {getSubtitle()}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Celestial Resonance V7 (Pure Resonance) */}
                            <div className="mt-auto h-36 w-full flex flex-col relative px-10">
                                {/* Technical Detail Text */}
                                <div className="absolute -top-6 left-10 flex items-center gap-3 opacity-30">
                                    <div className="w-10 h-[1px] bg-white" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white">宙の共鳴周波数 / RESONANCE FREQ</span>
                                </div>

                                {/* Ethereal Foundation Block (New V7) */}
                                <motion.div
                                    animate={{
                                        opacity: isPlaying ? [0.1, 0.2, 0.1] : 0.05,
                                        scaleX: isPlaying ? [1, 1.02, 1] : 1
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute bottom-12 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent blur-sm z-0"
                                />

                                {/* Reflection Layer (Optimized) */}
                                <div className="absolute bottom-4 left-10 right-10 h-10 flex items-start justify-center gap-[3px] blur-[3px] pointer-events-none">
                                    {visualizerBars.map((_, i) => (
                                        <ReflectionBar key={`ref-${i}`} i={i} isPlaying={isPlaying} />
                                    ))}
                                </div>

                                {/* Visualizer Container */}
                                <div className="h-20 w-full flex items-end justify-center gap-[4px] relative z-10 mt-6">
                                    {visualizerBars.map((_, i) => (
                                        <VisualizerBar key={i} i={i} isPlaying={isPlaying} color={color} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Content & Media (56%) */}
                        <div className="relative w-full md:w-[56%] h-full flex flex-col p-14 justify-center bg-white/[0.01]">

                            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
                                <div className="flex items-center gap-6 mb-12">
                                    <span className="px-5 py-2 rounded-2xl text-[11px] font-black bg-white/5 text-white/50 border border-white/10 uppercase tracking-[0.3em]">
                                        {getJPType(type)}
                                    </span>
                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                    {song?.tiktokUrl && (
                                        <a
                                            href={song.tiktokUrl}
                                            target="_blank"
                                            className="flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white/80 transition-all hover:scale-105"
                                        >
                                            <span className="uppercase tracking-[0.2em]">オリジナル動画を視聴</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/50 text-2xl font-light leading-[1.8] mb-16 italic tracking-wider font-serif border-l-4 pl-8 border-white/10"
                                >
                                    「{getDescription()}」
                                </motion.p>

                                {song && youtubeIdVal && (
                                    <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] border border-white/5 group transition-all duration-700 hover:scale-[1.02] hover:border-white/20">

                                        {/* 1. The YouTube Player (Always rendered when interacted, sits behind thumbnail initially) */}
                                        <div className="absolute inset-0 w-full h-full bg-black">
                                            {hasInteracted && (
                                                <div id={playerContainerId} className="w-full h-full object-cover" />
                                            )}
                                        </div>

                                        {/* 2. The Thumbnail Overlay (Fades out only when ACTUALLY playing) */}
                                        <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 z-20 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                                            {thumbnailUrl && (
                                                <img
                                                    src={thumbnailUrl}
                                                    alt="Video Thumbnail"
                                                    className={`w-full h-full object-cover transition-all duration-700 ${isBuffering || hasInteracted ? "scale-105 blur-[2px]" : "scale-100 blur-0"}`}
                                                />
                                            )}

                                            <div className="absolute inset-0 bg-black/20" />

                                            {/* Center Controls Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center">

                                                {/* Initial Play Button */}
                                                {!hasInteracted && (
                                                    <div className="group/play cursor-pointer" onClick={togglePlayback}>
                                                        <div className="p-8 rounded-full bg-white/10 border border-white/20 text-white shadow-2xl backdrop-blur-sm transition-all duration-500 transform group-hover/play:scale-110 group-hover/play:bg-white/20">
                                                            <Play className="w-12 h-12 fill-current translate-x-1" />
                                                        </div>
                                                        <p className="mt-4 text-center text-xs font-black tracking-[0.2em] text-white/50 uppercase group-hover/play:text-white transition-colors">
                                                            Play Video
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Loading/Connecting State */}
                                                {hasInteracted && !isPlaying && (
                                                    <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                                                        <div className="relative">
                                                            <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-white animate-spin" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase animate-pulse">
                                                            Connecting...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gradient Overlay for Aesthetics (on top of everything) */}
                                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-black/40 z-30" />
                                    </div>
                                )}
                            </div>

                            {/* Localized Controls */}
                            <div className="mt-14 flex items-center gap-7 max-w-2xl mx-auto w-full">
                                <button
                                    onClick={togglePlayback}
                                    className={`flex-[2] py-6 px-10 rounded-[1.5rem] font-black text-xs tracking-[0.3em] flex items-center justify-center gap-5 transition-all duration-500 transform active:scale-95 shadow-2xl ${isPlaying
                                        ? "bg-white/5 text-white/50 border border-white/20 hover:bg-white/10 hover:text-white"
                                        : "bg-amber-100 text-black hover:shadow-[0_20px_60px_-10px_rgba(251,191,36,0.6)] hover:-translate-y-1.5"
                                        }`}
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                                    {isPlaying ? "宇宙の共鳴を一時停止" : "宇宙の記憶を再生する"}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="flex-1 py-6 px-10 rounded-[1.5rem] font-bold text-xs tracking-[0.2em] bg-white/5 text-white/40 border border-white/10 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-3"
                                >
                                    閉じる
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
