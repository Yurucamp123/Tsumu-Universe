"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Heart, Sparkles } from "lucide-react"

interface SuccessNotificationProps {
    isVisible: boolean
    onClose: () => void
}

export function SuccessNotification({ isVisible, onClose }: SuccessNotificationProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
                >
                    <div className="relative bg-gradient-to-br from-pink-900/90 to-purple-900/90 backdrop-blur-xl border-2 border-pink-400/40 rounded-3xl p-8 shadow-[0_0_80px_rgba(236,72,153,0.6)] max-w-md pointer-events-auto">
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-pink-400/30 blur-3xl rounded-full animate-pulse" />
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-400/30 blur-3xl rounded-full animate-pulse" />

                        {/* Content */}
                        <div className="relative text-center space-y-4">
                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <Heart className="w-16 h-16 text-pink-300 fill-pink-300 animate-pulse" />
                                    <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-3">
                                <h3 className="text-2xl font-serif text-pink-100 tracking-wide">
                                    メッセージが届きました
                                </h3>
                                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
                                <p className="text-pink-200/90 text-sm leading-relaxed">
                                    あなたの想いは星空を越えて、<br />
                                    大切な人のもとへ届きました
                                </p>
                            </div>

                            {/* Birthday wish */}
                            <div className="pt-4 border-t border-pink-400/20">
                                <p className="text-lg font-serif text-yellow-200 mb-2">
                                    🎂 お誕生日おめでとう 🎂
                                </p>
                                <p className="text-pink-100/80 text-sm italic leading-relaxed">
                                    この宇宙で一番輝いているあなたへ。<br />
                                    素敵な一年になりますように ✨
                                </p>
                            </div>

                            {/* Auto-close hint */}
                            <p className="text-pink-300/40 text-xs pt-2">
                                このメッセージは15秒後に消えます
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
