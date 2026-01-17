"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Sparkles, Loader2 } from "lucide-react"

interface MessageModalProps {
    isOpen: boolean
    onClose: () => void
    onSend: (message: string) => Promise<void>
}

export function MessageModal({ isOpen, onClose, onSend }: MessageModalProps) {
    const [message, setMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (message.trim() && !isSending) {
            setIsSending(true)
            await onSend(message)
            setIsSending(false)
            setMessage("")
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isSending ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-black/80 border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(251,191,36,0.2)] overflow-hidden pointer-events-auto"
                    >
                        {/* Decorative Background */}
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 blur-[60px]" />

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 relative">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                <h3 className="text-xl font-serif text-amber-100">星への手紙</h3>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isSending}
                                className="text-amber-100/50 hover:text-amber-100 transition-colors disabled:opacity-30"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="relative space-y-4">
                            <div className="relative group">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="想いを宇宙に届ける..."
                                    disabled={isSending}
                                    className="w-full h-40 bg-white/5 border border-amber-500/20 rounded-xl p-4 text-amber-50 placeholder:text-amber-100/20 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all resize-none font-serif leading-relaxed disabled:opacity-50"
                                    autoFocus
                                    maxLength={2000}
                                />
                                {/* Glow effect on focus */}
                                <div className="absolute inset-0 -z-10 bg-amber-500/5 rounded-xl blur transition-opacity opacity-0 group-focus-within:opacity-100" />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isSending}
                                    className="group flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20 min-w-[140px] justify-center"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-lg">送信</span>
                                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
