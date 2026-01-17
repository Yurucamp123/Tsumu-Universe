"use client"

import { useState } from "react"
import { GenesisIntro } from "@/components/genesis-intro"
import { LivingCosmos } from "@/components/living-cosmos"

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-background">
      {!introComplete ? <GenesisIntro onComplete={() => setIntroComplete(true)} /> : <LivingCosmos />}
    </main>
  )
}
