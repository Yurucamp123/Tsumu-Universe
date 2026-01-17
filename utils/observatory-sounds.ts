// Sound effect utilities for Observatory module

export const playLaserScan = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create laser scan sound effect
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Laser sweep from high to low frequency
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 1.5)

    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 1.3)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5)

    oscillator.type = 'sine'
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1.5)
}

export const playResultAppear = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create sparkle/chime sound
    const oscillator1 = audioContext.createOscillator()
    const oscillator2 = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator1.connect(gainNode)
    oscillator2.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Two-tone chime
    oscillator1.frequency.value = 800
    oscillator2.frequency.value = 1200

    // Quick fade
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator1.type = 'sine'
    oscillator2.type = 'sine'

    oscillator1.start(audioContext.currentTime)
    oscillator2.start(audioContext.currentTime)
    oscillator1.stop(audioContext.currentTime + 0.3)
    oscillator2.stop(audioContext.currentTime + 0.3)
}

export const playButtonClick = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create click sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 600

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

    oscillator.type = 'square'
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
}
