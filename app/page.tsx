"use client"

import { useState } from "react"
import { GenesisIntro } from "@/components/genesis-intro"
import { LivingCosmos } from "@/components/living-cosmos"
import { GiftBoxLanding } from "@/components/gift-box-landing"

export default function Home() {
    const [giftBoxOpened, setGiftBoxOpened] = useState(false)
    const [introComplete, setIntroComplete] = useState(false)

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-background">
            {!giftBoxOpened ? (
                <GiftBoxLanding onOpen={() => setGiftBoxOpened(true)} />
            ) : !introComplete ? (
                <GenesisIntro onComplete={() => setIntroComplete(true)} />
            ) : (
                <LivingCosmos />
            )}
        </main>
    )
}
