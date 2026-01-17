"use client"

import { useState, useCallback } from "react"
import { Preloader } from "./intro/preloader"
import { TouchUniverse } from "./intro/touch-universe"
import { StardustSignature } from "./intro/stardust-signature"
import { ExpansionTransition } from "./intro/expansion-transition"

type IntroPhase = "loading" | "touch" | "signature" | "expansion" | "complete"

interface GenesisIntroProps {
  onComplete: () => void
}

export function GenesisIntro({ onComplete }: GenesisIntroProps) {
  const [phase, setPhase] = useState<IntroPhase>("loading")
  const [clickPosition, setClickPosition] = useState({ x: 0.5, y: 0.5 })

  const handleLoadComplete = useCallback(() => {
    setPhase("touch")
  }, [])

  const handleTouch = useCallback((x: number, y: number) => {
    setClickPosition({ x, y })
    setPhase("signature")
  }, [])

  const handleSignatureComplete = useCallback(() => {
    setPhase("expansion")
  }, [])

  const handleExpansionComplete = useCallback(() => {
    setPhase("complete")
    onComplete()
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black z-50">
      {phase === "loading" && <Preloader onComplete={handleLoadComplete} />}

      {phase === "touch" && <TouchUniverse onTouch={handleTouch} />}

      {phase === "signature" && (
        <StardustSignature clickPosition={clickPosition} onComplete={handleSignatureComplete} />
      )}

      {phase === "expansion" && <ExpansionTransition onComplete={handleExpansionComplete} />}
    </div>
  )
}
