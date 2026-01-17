"use client"

import { motion } from 'framer-motion'
import { FileMusic, Video } from 'lucide-react'
import type { SearchResult } from '@/types/search'

interface SearchResults3DProps {
    results: SearchResult[]
    onResultClick: (result: SearchResult) => void
}

export function SearchResults3D({ results, onResultClick }: SearchResults3DProps) {
    // Generate random positions for floating shards
    const getRandomPosition = (index: number) => {
        const angle = (index / results.length) * Math.PI * 2
        const radius = 150 + Math.random() * 100
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius + (Math.random() - 0.5) * 100
        }
    }

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center">
            {results.map((result, index) => {
                const pos = getRandomPosition(index)
                const isSheet = result.type === 'sheet'

                return (
                    <motion.div
                        key={result.id}
                        initial={{ scale: 0, opacity: 0, rotateY: -180 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            rotateY: 0,
                            x: pos.x,
                            y: pos.y
                        }}
                        transition={{
                            delay: index * 0.1,
                            type: 'spring',
                            damping: 15,
                            stiffness: 100
                        }}
                        whileHover={{
                            scale: 1.1,
                            rotateY: 10,
                            z: 50,
                            boxShadow: isSheet
                                ? '0 0 40px rgba(74,158,255,0.6)'
                                : '0 0 40px rgba(255,74,110,0.6)'
                        }}
                        onClick={() => {
                            // Open in new tab directly instead of preview modal
                            window.open(result.url, '_blank', 'noopener,noreferrer')
                            // Still call the callback for potential analytics
                            onResultClick(result)
                        }}
                        className="absolute cursor-pointer group"
                        style={{
                            perspective: '1000px'
                        }}
                    >
                        {/* Shard Container */}
                        <div
                            className={`
                relative p-6 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300
                ${isSheet
                                    ? 'bg-blue-500/10 border-blue-400/40 hover:border-blue-400'
                                    : 'bg-red-500/10 border-red-400/40 hover:border-red-400'
                                }
              `}
                            style={{
                                background: isSheet
                                    ? 'rgba(74,158,255,0.2)'
                                    : 'rgba(255,74,110,0.2)',
                                boxShadow: isSheet
                                    ? '0 0 20px rgba(74,158,255,0.2)'
                                    : '0 0 20px rgba(255,74,110,0.2)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center mb-3">
                                {isSheet ? (
                                    <FileMusic className="w-8 h-8 text-blue-300" />
                                ) : (
                                    <Video className="w-8 h-8 text-red-300" />
                                )}
                            </div>

                            {/* Title */}
                            <div className="text-center">
                                <p
                                    className={`text-sm font-bold line-clamp-2 ${isSheet ? 'text-blue-200' : 'text-red-200'
                                        }`}
                                    style={{ maxWidth: '200px' }}
                                >
                                    {result.title}
                                </p>
                                <p
                                    className={`text-xs mt-2 ${isSheet ? 'text-blue-400/60' : 'text-red-400/60'
                                        }`}
                                >
                                    {isSheet ? 'Sheet Music' : 'Video Tutorial'}
                                </p>
                            </div>

                            {/* Glow effect on hover */}
                            <div
                                className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                  ${isSheet ? 'bg-blue-400/10' : 'bg-red-400/10'}
                `}
                            />

                            {/* Floating animation */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                animate={{
                                    y: [0, -10, 0]
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />
                        </div>

                        {/* Particle trail effect */}
                        <motion.div
                            className={`absolute top-0 left-1/2 w-1 h-1 rounded-full -translate-x-1/2 ${isSheet ? 'bg-blue-400' : 'bg-red-400'
                                }`}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                y: [-20, -40]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.3
                            }}
                        />
                    </motion.div>
                )
            })}
        </div>
    )
}
