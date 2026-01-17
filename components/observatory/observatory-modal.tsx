"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Loader2 } from 'lucide-react'
import type { SearchResult } from '@/types/search'
import { SearchResults3D } from '@/components/observatory/search-results-3d'
import { playLaserScan, playResultAppear } from '@/utils/observatory-sounds'

interface ObservatoryModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ObservatoryModal({ isOpen, onClose }: ObservatoryModalProps) {
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState<SearchResult[]>([])
    const [showLaserScan, setShowLaserScan] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setIsSearching(true)
        setShowLaserScan(true)
        setResults([])

        // Play laser scan sound
        try {
            playLaserScan()
        } catch (error) {
            console.error('Sound playback failed:', error)
        }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
            const data = await response.json()

            // Simulate laser scan delay
            setTimeout(() => {
                setResults(data.results || [])
                setIsSearching(false)
                setShowLaserScan(false)

                // Play result appear sound
                if (data.results && data.results.length > 0) {
                    try {
                        playResultAppear()
                    } catch (error) {
                        console.error('Sound playback failed:', error)
                    }
                }
            }, 1500)
        } catch (error) {
            console.error('Search failed:', error)
            setIsSearching(false)
            setShowLaserScan(false)
        }
    }

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop with camera zoom effect */}
                        <motion.div
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />

                        {/* Coordinate Grid Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: `
                  linear-gradient(rgba(0,217,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,217,255,0.1) 1px, transparent 1px)
                `,
                                backgroundSize: '50px 50px'
                            }}
                        />

                        {/* Main Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-4xl bg-black/40 backdrop-blur-2xl rounded-3xl border border-cyan-400/30 shadow-[0_0_100px_rgba(0,217,255,0.3)] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="relative p-8 border-b border-cyan-400/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-cyan-300 tracking-wider">
                                            観測所
                                        </h2>
                                        <p className="text-cyan-400/60 text-sm mt-1 tracking-widest">
                                            THE OBSERVATORY
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300/60 hover:text-cyan-300 transition-all border border-cyan-400/20"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Search Interface */}
                            <div className="p-8">
                                <form onSubmit={handleSearch} className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="曲名を入力してください..."
                                            className="w-full px-6 py-4 bg-black/40 border-2 border-cyan-400/30 rounded-2xl text-cyan-100 placeholder-cyan-400/40 focus:border-cyan-400 focus:outline-none transition-all text-lg backdrop-blur-sm"
                                            disabled={isSearching}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSearching || !query.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-cyan-400/30"
                                        >
                                            {isSearching ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Search className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Laser Scan Effect */}
                                    <AnimatePresence>
                                        {showLaserScan && (
                                            <motion.div
                                                initial={{ scaleX: 0, opacity: 0 }}
                                                animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                                                className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"
                                                style={{ transformOrigin: 'left' }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </form>

                                {/* Results Container */}
                                <div className="mt-8 min-h-[400px] relative">
                                    {results.length > 0 ? (
                                        <SearchResults3D
                                            results={results}
                                            onResultClick={() => { }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-[400px]">
                                            <p className="text-cyan-400/40 text-sm tracking-widest">
                                                {isSearching ? 'スキャン中...' : '検索結果がここに表示されます'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
