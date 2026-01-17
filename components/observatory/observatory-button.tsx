"use client"

import { motion } from 'framer-motion'
import { Telescope } from 'lucide-react'
import { playButtonClick } from '@/utils/observatory-sounds'

interface ObservatoryButtonProps {
    onClick: () => void
}

export function ObservatoryButton({ onClick }: ObservatoryButtonProps) {
    const handleClick = () => {
        try {
            playButtonClick()
        } catch (error) {
            console.error('Sound playback failed:', error)
        }
        onClick()
    }

    return (
        <motion.button
            onClick={handleClick}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_50px_rgba(0,217,255,0.5)] transition-all duration-300 group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
                boxShadow: [
                    '0 0 30px rgba(0,217,255,0.3)',
                    '0 0 50px rgba(0,217,255,0.5)',
                    '0 0 30px rgba(0,217,255,0.3)'
                ]
            }}
            transition={{
                boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }
            }}
        >
            {/* Rotating ring */}
            <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Icon */}
            <Telescope className="w-6 h-6 text-cyan-300 relative z-10 group-hover:text-cyan-100 transition-colors" />

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-cyan-400/30 text-cyan-300 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                観測所を開く
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-400/30" />
            </div>
        </motion.button>
    )
}
