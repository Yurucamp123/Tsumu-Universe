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


// Sparkling Effect for Disc
const DiscSparkles = memo(({ isPlaying, color }: { isPlaying: boolean, color: string }) => {
    if (!isPlaying) return null

    // Generate random static sparkles
    const sparkles = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3
    }))

    return (
        <div className="absolute inset-0 rounded-full z-20 pointer-events-none overflow-hidden">
            {sparkles.map((s) => (
                <motion.div
                    key={s.id}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                        rotate: [0, 45, 90]
                    }}
                    transition={{
                        duration: s.duration,
                        repeat: Infinity,
                        delay: s.delay,
                        ease: "easeInOut"
                    }}
                    className="absolute w-2 h-2 md:w-3 md:h-3"
                    style={{
                        top: s.top,
                        left: s.left,
                        background: `radial-gradient(circle, #fff 10%, ${color} 60%, transparent 100%)`,
                        boxShadow: `0 0 4px 1px #fff`,
                        clipPath: "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)" // Star shape
                    }}
                />
            ))}
        </div>
    )
})


// Simple Disc Animation
const DiscPlayingEffect = memo(({ isPlaying, isBuffering, color }: { isPlaying: boolean, isBuffering: boolean, color: string }) => {
    if (!isPlaying && !isBuffering) return null

    return (
        <>
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

// Cosmic Piano Visualizer - Left Panel Edition
const CosmicPiano = memo(({ isPlaying, color }: { isPlaying: boolean, color: string }) => {
    // Generate 80 keys (More keys as requested)
    const keys = useMemo(() => Array.from({ length: 80 }, (_, i) => i), [])

    return (
        // Lifted UP (bottom-20) and DRASTICALLY Narrower Width (max-w-[300px] mx-auto)
        // VISIBILITY FIX: Opacity 0 if not playing
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isPlaying ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute bottom-20 left-0 right-0 h-96 overflow-visible pointer-events-none z-0 px-4 w-full max-w-[300px] mx-auto"
        >

            {/* Nebula/Aurora Backdrop */}
            <motion.div
                animate={isPlaying ? { opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bottom-10 z-0 opacity-30"
                style={{
                    background: `radial-gradient(ellipse at center bottom, ${color}30 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                    transform: 'translateZ(0)'
                }}
            />

            {/* Floor Reflection */}
            <motion.div
                animate={{ opacity: isPlaying ? 0.3 : 0 }}
                transition={{ duration: 1 }}
                className="absolute top-full left-0 right-0 h-24 scale-y-[-1] mask-reflection z-0"
                style={{
                    maskImage: 'linear-gradient(to bottom, black, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
                }}
            >
                <div className="w-full h-full bg-gradient-to-t from-transparent via-white/10 to-transparent blur-xl" />
            </motion.div>

            {/* Key container - Tighter gap for more keys */}
            <div className="flex items-end justify-center h-full gap-[1px] md:gap-[2px] opacity-100 relative z-10 pb-2">
                {keys.map((i) => (
                    <PianoKey key={i} i={i} isPlaying={isPlaying} />
                ))}
            </div>
        </motion.div>
    )
})

const PianoKey = memo(({ i, isPlaying }: { i: number, isPlaying: boolean }) => {
    const [isActive, setIsActive] = useState(false)

    // Vivid Colors
    const noteColor = useMemo(() => {
        const hue = (180 + (i * 4)) % 360;
        return `hsl(${hue}, 100%, 70%)`;
    }, [i])

    useEffect(() => {
        if (!isPlaying) {
            setIsActive(false)
            return
        }

        const distanceFromCenter = Math.abs(i - 40); // Adjusted center for 80 keys
        const activityChance = 0.90 + (distanceFromCenter * 0.002);

        const interval = setInterval(() => {
            if (Math.random() > activityChance) {
                setIsActive(true)
                // Slower reset
                setTimeout(() => setIsActive(false), 1200 + Math.random() * 2000)
            }
        }, 300 + Math.random() * 1000)

        return () => clearInterval(interval)
    }, [isPlaying, i])

    // Floating Particles
    const sparkles = useMemo(() => Array.from({ length: 2 }).map(() => ({
        x: (Math.random() - 0.5) * 40,
        y: -30 - Math.random() * 80,
        scale: 0.5 + Math.random(),
        delay: Math.random() * 0.5
    })), [])

    return (
        <div className="relative flex-1 h-full flex flex-col justify-end items-center group">

            {/* The Beam - Thinner for more keys */}
            <motion.div
                animate={isActive ? {
                    height: [0, 80 + Math.random() * 80],
                    opacity: [0, 1, 1, 0],
                } : { height: 0, opacity: 0 }}
                transition={{
                    duration: 6,
                    times: [0, 0.1, 0.7, 1],
                    ease: "easeInOut"
                }}
                className="w-[2px] md:w-[3px] absolute bottom-0 rounded-t-lg origin-bottom"
                style={{
                    // Solid White Core -> Vibrant Color -> Transparent
                    background: `linear-gradient(to top, #ffffff 40%, ${noteColor} 90%, transparent)`,
                    boxShadow: `0 0 20px ${noteColor}`,
                    zIndex: 1
                }}
            />

            {/* The Base Hit - Smaller */}
            <motion.div
                animate={isActive ? {
                    scale: [0, 2, 0],
                    opacity: [1, 1, 0]
                } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-1.5 h-1.5 md:w-2 md:h-2 absolute bottom-0 rounded-full bg-white"
                style={{
                    boxShadow: `0 0 25px 6px ${noteColor}`,
                    zIndex: 2
                }}
            />

            {/* Slow Drifting Particles */}
            {sparkles.map((sparkle, idx) => (
                <motion.div
                    key={idx}
                    animate={isActive ? {
                        y: [0, sparkle.y],
                        x: [0, sparkle.x],
                        opacity: [1, 1, 1, 0],
                        scale: [0, sparkle.scale, 0]
                    } : { opacity: 0, y: 0 }}
                    transition={{
                        duration: 7 + Math.random() * 3,
                        ease: "easeOut",
                        delay: sparkle.delay
                    }}
                    className="absolute bottom-0 w-[2px] h-[2px] rounded-full bg-white"
                    style={{
                        boxShadow: `0 0 8px 2px ${noteColor}`,
                        zIndex: 3
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
    const [isPlayerReady, setIsPlayerReady] = useState(false)
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

    // Load YouTube API
    useEffect(() => {
        if (!isOpen || !youtubeIdVal || !hasInteracted) return

        let isMounted = true

        const initPlayer = () => {
            if (!window.YT || !window.YT.Player || !isMounted) return

            if (playerRef.current) return

            playerRef.current = new window.YT.Player(playerContainerId, {
                videoId: youtubeIdVal,
                playerVars: {
                    enablejsapi: 1,
                    autoplay: 1,
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
                            setIsPlayerReady(true)
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
        }
    }, [isOpen, youtubeIdVal, hasInteracted])


    // Toggle Playback Logic
    const togglePlayback = () => {
        if (!hasInteracted) {
            setHasInteracted(true)
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
            setIsPlayerReady(false)
            setHasInteracted(false)
            if (playerRef.current) {
                try {
                    playerRef.current.destroy()
                } catch (e) {
                    console.error("Error destroying player:", e)
                }
                playerRef.current = null
            }
        }
    }, [isOpen])

    useEffect(() => {
        setIsPlaying(false)
        setIsPlayerReady(false)
        setHasInteracted(false)
        if (playerRef.current) {
            try {
                playerRef.current.destroy()
            } catch (e) {
                console.error("Error destroying player:", e)
            }
            playerRef.current = null
        }
    }, [song])


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
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-6xl h-full lg:h-[85vh] overflow-y-auto lg:overflow-hidden rounded-none lg:rounded-[3rem] border-0 lg:border border-white/20 bg-black/90 lg:bg-black/40 shadow-none lg:shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] flex flex-col lg:flex-row backdrop-blur-[50px]"
                        style={{
                            boxShadow: `0 0 150px -40px ${color.replace("rgb", "rgba").replace(")", ", 0.5)")}, 
                          inset 0 0 0 1px rgba(255,255,255,0.1),
                          inset 0 0 100px -20px ${color.replace("rgb", "rgba").replace(")", ", 0.1)")}`,
                        }}
                    >
                        {/* Background */}
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
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                        </div>

                        {/* Top Right Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 lg:top-10 lg:right-10 z-50 p-3 lg:p-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 backdrop-blur-2xl group shadow-2xl"
                        >
                            <X className="w-5 h-5 lg:w-6 lg:h-6 transition-transform group-hover:rotate-90" />
                        </button>

                        {/* LEFT SECTION (Record Player & Info & Visualizer) */}
                        <div className="relative w-full lg:w-[44%] shrink-0 flex flex-col items-center justify-start pt-8 lg:pt-12 p-8 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/20 lg:bg-transparent min-h-[50vh] lg:min-h-full">

                            {/* Record Player Group */}
                            <div className="relative mb-8 group z-20">
                                <div className="absolute inset-x-[-15%] top-[-5%] bottom-[-15%] rounded-full bg-black/40 blur-3xl opacity-60" />
                                <div className="absolute inset-0 rounded-full z-0 pointer-events-none">
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
                                    <div className="absolute inset-[-1px] rounded-full border border-white/10 z-10" />
                                </div>
                                <motion.div
                                    animate={{ rotate: isPlaying ? 360 : 0 }}
                                    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                                    className="relative w-72 h-72 md:w-96 md:h-96 rounded-full shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] p-[4px] bg-gradient-to-br from-white/30 via-white/5 to-black/60 overflow-hidden"
                                >
                                    <div className="w-full h-full rounded-full bg-[#030303] flex items-center justify-center relative">
                                        <div className="absolute inset-0 rounded-full opacity-80"
                                            style={{ background: "repeating-radial-gradient(circle, #000 0, #000 1px, #111 1.5px, #000 2px)" }} />

                                        {/* Sparkling Effect */}
                                        <DiscSparkles isPlaying={isPlaying} color={color} />

                                        <DiscPlayingEffect isPlaying={isPlaying} isBuffering={isBuffering} color={color} />
                                        <div
                                            className="w-28 h-28 md:w-36 md:h-36 rounded-full relative z-30 flex items-center justify-center border-[8px] border-[#080808] shadow-[inset_0_0_40px_rgba(0,0,0,1),0_0_20px_rgba(0,0,0,0.8)] overflow-hidden bg-black"
                                        >
                                            <div className="w-6 h-6 rounded-full relative z-40 flex items-center justify-center bg-gradient-to-br from-[#888] via-[#222] to-[#444] border border-white/20 shadow-lg">
                                                <div className="w-1.5 h-1.5 bg-black/40 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Info */}
                            <div className="mt-2 w-full flex flex-col items-center relative z-20">
                                <motion.div
                                    key={getTitle()}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center w-full"
                                >
                                    {/* TITLE */}
                                    <h2 className="text-2xl md:text-4xl font-bold text-white font-serif tracking-tight leading-none mb-3 text-shadow-xl">{getTitle()}</h2>

                                    {/* SEPARATOR */}
                                    <div className="flex items-center justify-center gap-4 opacity-40 mb-3">
                                        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white whitespace-nowrap">宙の共鳴 / RESONANCE</span>
                                        <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white" />
                                    </div>

                                    {/* SUBTITLE */}
                                    <p className="text-amber-100/40 uppercase tracking-[0.4em] text-[11px] font-black">{getSubtitle()}</p>
                                </motion.div>
                            </div>

                            {/* VISUALIZER - Separated (Child of Left Panel) */}
                            <CosmicPiano isPlaying={isPlaying} color={color} />
                        </div>

                        {/* RIGHT SECTION (Content) */}
                        <div className="relative w-full lg:w-[56%] shrink-0 flex flex-col p-8 lg:p-14 justify-start lg:justify-center bg-white/[0.01]">

                            <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full relative z-20">
                                {/* Header */}
                                <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-8 lg:mb-12 pr-10 lg:pr-20">
                                    <span className="px-3 py-1.5 lg:px-5 lg:py-2 rounded-2xl text-[9px] lg:text-[11px] font-black bg-white/5 text-white/50 border border-white/10 uppercase tracking-[0.2em] lg:tracking-[0.3em] whitespace-nowrap">
                                        {getJPType(type)}
                                    </span>
                                    <div className="hidden lg:block h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                    {song?.tiktokUrl && (
                                        <a href={song.tiktokUrl} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white/80 transition-all hover:scale-105">
                                            <span className="uppercase tracking-[0.2em]">オリジナル動画を視聴</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/50 text-2xl font-light leading-[1.8] mb-16 italic tracking-wider font-serif border-l-4 pl-8 border-white/10"
                                >
                                    「{getDescription()}」
                                </motion.p>

                                {/* Video Player */}
                                <div className="mb-14 relative z-30">
                                    {song && youtubeIdVal && (
                                        <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] border border-white/5 group transition-all duration-700 hover:scale-[1.02] hover:border-white/20 z-30">
                                            <div className="absolute inset-0 w-full h-full bg-black">
                                                {hasInteracted && <div id={playerContainerId} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 z-20 ${isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                                                {thumbnailUrl && (
                                                    <img src={thumbnailUrl} alt="Video Thumbnail" className={`w-full h-full object-cover transition-all duration-700 ${isBuffering || hasInteracted ? "scale-105 blur-[2px]" : "scale-100 blur-0"}`} />
                                                )}
                                                <div className="absolute inset-0 bg-black/20" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {(!hasInteracted || (isPlayerReady && !isPlaying && !isBuffering)) && (
                                                        <div className="group/play cursor-pointer" onClick={(e) => { e.stopPropagation(); togglePlayback() }}>
                                                            <div className="p-8 rounded-full bg-white/10 border border-white/20 text-white shadow-2xl backdrop-blur-sm transition-all duration-500 transform group-hover/play:scale-110 group-hover/play:bg-white/20">
                                                                <Play className="w-12 h-12 fill-current translate-x-1" />
                                                            </div>
                                                            <p className="mt-4 text-center text-xs font-black tracking-[0.2em] text-white/50 uppercase group-hover/play:text-white transition-colors">Play Video</p>
                                                        </div>
                                                    )}
                                                    {hasInteracted && !isPlaying && !isPlayerReady && (
                                                        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                                                            <div className="relative">
                                                                <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-white animate-spin" />
                                                            </div>
                                                            <span className="text-[10px] font-black tracking-[0.3em] text-white/60 uppercase animate-pulse">Connecting...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-black/40 z-30" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CONTROLS */}
                            <div className="mt-auto md:mt-10 flex items-center gap-7 max-w-2xl mx-auto w-full relative z-40">
                                <button
                                    onClick={togglePlayback}
                                    className={`flex-[2] py-5 px-6 lg:py-6 lg:px-10 rounded-[1.5rem] font-black text-[10px] lg:text-xs tracking-[0.2em] lg:tracking-[0.3em] flex items-center justify-center gap-3 lg:gap-5 transition-all duration-500 transform active:scale-95 shadow-2xl ${isPlaying
                                        ? "bg-white/5 text-white/50 border border-white/20 hover:bg-white/10 hover:text-white"
                                        : "bg-amber-100 text-black hover:shadow-[0_20px_60px_-10px_rgba(251,191,36,0.6)] hover:-translate-y-1.5"
                                        }`}
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 lg:w-6 lg:h-6" /> : <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />}
                                    <span className="truncate">{isPlaying ? "宇宙の共鳴を一時停止" : "宇宙の記憶を再生する"}</span>
                                </button>

                                <button
                                    onClick={onClose}
                                    className="flex-1 py-5 px-6 lg:py-6 lg:px-10 rounded-[1.5rem] font-bold text-[10px] lg:text-xs tracking-[0.2em] bg-white/5 text-white/40 border border-white/10 hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-3 whitespace-nowrap"
                                >
                                    閉じる
                                </button>
                            </div>

                        </div>

                    </motion.div >
                </div >
            )
            }
        </AnimatePresence >
    )
}
