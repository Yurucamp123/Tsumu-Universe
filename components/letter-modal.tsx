"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, Sparkles } from "lucide-react"

interface LetterModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LetterModal({ isOpen, onClose }: LetterModalProps) {
    // Stagger animation for text content
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
                    />

                    {/* Centered Modal Container */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.8, bounce: 0.25 }}
                            className="pointer-events-auto relative w-[95vw] h-[90vh] max-w-7xl max-h-[900px] bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row backdrop-filter backdrop-blur-xl"
                            style={{
                                boxShadow: "0 0 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)"
                            }}
                        >
                            {/* Ambient Particles Layer */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                                {[...Array(15)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute rounded-full bg-white/10"
                                        style={{
                                            width: Math.random() * 4 + 1 + 'px',
                                            height: Math.random() * 4 + 1 + 'px',
                                            left: Math.random() * 100 + '%',
                                            top: Math.random() * 100 + '%',
                                        }}
                                        animate={{
                                            y: [0, -20, 0],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 3 + Math.random() * 4,
                                            repeat: Infinity,
                                            delay: Math.random() * 5,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Decorative gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none z-0" />

                            {/* Close button with enhanced hover */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-3 rounded-full bg-black/20 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5 hover:border-white/30 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            >
                                <X size={24} />
                            </button>

                            {/* Left Side: Artwork Display */}
                            <div className="w-full md:w-3/5 h-[45%] md:h-full relative bg-black/20 flex items-center justify-center p-8 group z-10 overflow-hidden">
                                <motion.div
                                    className="relative w-full h-full max-h-[400px] md:max-h-full"
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                >
                                    <Image
                                        src="/tsumu-image.png"
                                        alt="Tsumu's drawing"
                                        fill
                                        className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-1000 ease-in-out group-hover:scale-105"
                                        priority
                                    />

                                    {/* Overlay shine effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                </motion.div>

                                {/* Bottom gradient for mobile transition */}
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900/40 to-transparent md:hidden pointer-events-none" />
                            </div>

                            {/* Right Side: Letter Content */}
                            <div className="w-full md:w-2/5 h-[55%] md:h-full relative flex flex-col justify-center p-6 md:p-12 lg:p-16 z-10 overflow-y-auto">
                                <motion.div
                                    className="relative z-10 space-y-8"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.div variants={itemVariants} className="flex items-center space-x-3 text-amber-300/80">
                                        <Sparkles size={18} className="animate-pulse" />
                                        <span className="text-xs font-mono tracking-widest uppercase">Special Message</span>
                                    </motion.div>

                                    <motion.h3
                                        variants={itemVariants}
                                        className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-500 tracking-wide pb-2"
                                        style={{ fontFamily: '"Noto Serif JP", serif' }}
                                    >
                                        つむへ
                                    </motion.h3>

                                    <div className="space-y-6 text-gray-200 leading-loose font-serif tracking-wide text-base md:text-lg">
                                        <motion.p variants={itemVariants}>
                                            これは僕が描いた君の絵だよ。
                                        </motion.p>
                                        <motion.p variants={itemVariants}>
                                            君の趣味であるピアノと、<br />
                                            僕の趣味である空を眺めることを<br />
                                            組み合わせてみたんだ。
                                        </motion.p>
                                        <motion.div variants={itemVariants} className="pt-4">
                                            <p className="text-amber-100/90 text-xl font-medium border-l-2 border-amber-500/50 pl-4 py-1">
                                                気に入ってくれると嬉しいな。
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Signature */}
                                    <motion.div
                                        variants={itemVariants}
                                        className="pt-12 border-t border-white/10 flex justify-end"
                                    >
                                        <div className="group flex flex-col items-end">
                                            <div className="text-xs text-white/30 font-mono tracking-[0.2em] mb-1">SENT FROM</div>
                                            <div className="text-lg md:text-xl text-white/50 font-serif tracking-widest uppercase group-hover:text-amber-200 transition-colors duration-500">
                                                タイヘイ
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
