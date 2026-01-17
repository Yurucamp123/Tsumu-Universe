"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import type { SearchResult } from '@/types/search'

interface PreviewModalProps {
    result: SearchResult | null
    onClose: () => void
}

export function PreviewModal({ result, onClose }: PreviewModalProps) {
    if (!result) return null

    const isSheet = result.type === 'sheet'

    return (
        <AnimatePresence>
            {result && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Glassmorphism Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[20px]"
                        style={{
                            backdropFilter: 'blur(20px) saturate(180%)'
                        }}
                    />

                    {/* Preview Container */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`
              relative w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden
              ${isSheet
                                ? 'bg-blue-500/5 border-2 border-blue-400/30 shadow-[0_0_100px_rgba(74,158,255,0.3)]'
                                : 'bg-red-500/5 border-2 border-red-400/30 shadow-[0_0_100px_rgba(255,74,110,0.3)]'
                            }
            `}
                        style={{
                            backdropFilter: 'blur(40px) saturate(180%)',
                            background: isSheet
                                ? 'linear-gradient(135deg, rgba(74,158,255,0.05) 0%, rgba(0,0,0,0.4) 100%)'
                                : 'linear-gradient(135deg, rgba(255,74,110,0.05) 0%, rgba(0,0,0,0.4) 100%)'
                        }}
                    >
                        {/* Header */}
                        <div className="relative p-6 border-b border-white/10 backdrop-blur-xl bg-black/20">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 pr-4">
                                    <h3
                                        className={`text-xl font-bold line-clamp-1 ${isSheet ? 'text-blue-200' : 'text-red-200'
                                            }`}
                                    >
                                        {result.title}
                                    </h3>
                                    <p className="text-white/40 text-sm mt-1">
                                        {isSheet ? 'Sheet Music Preview' : 'Video Tutorial'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Open in new tab */}
                                    <a
                                        href={result.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`
                      p-3 rounded-xl transition-all border
                      ${isSheet
                                                ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-400/30'
                                                : 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-400/30'
                                            }
                    `}
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>

                                    {/* Close button */}
                                    <button
                                        onClick={onClose}
                                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="relative w-full h-[calc(100%-88px)] bg-black/40">
                            <iframe
                                src={result.url}
                                className="w-full h-full"
                                title={result.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />

                            {/* Loading overlay */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300">
                                <div className="text-white/60 text-sm">Loading preview...</div>
                            </div>
                        </div>

                        {/* Decorative corner accents */}
                        <div
                            className={`absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 rounded-tl-3xl ${isSheet ? 'border-blue-400/40' : 'border-red-400/40'
                                }`}
                        />
                        <div
                            className={`absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 rounded-br-3xl ${isSheet ? 'border-blue-400/40' : 'border-red-400/40'
                                }`}
                        />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
