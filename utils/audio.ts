/**
 * Audio context for playing piano notes
 * Uses Web Audio API to generate sine wave tones
 */
let audioContext: AudioContext | null = null
let isAudioInitialized = false

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Resume audio context on first user interaction (autoplay policy)
    if (!isAudioInitialized) {
      const resumeAudio = () => {
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            isAudioInitialized = true
          })
        }
        // Remove listeners after first interaction
        document.removeEventListener('click', resumeAudio)
        document.removeEventListener('touchstart', resumeAudio)
      }

      document.addEventListener('click', resumeAudio, { once: true })
      document.addEventListener('touchstart', resumeAudio, { once: true })
    }
  }
  return audioContext
}

/**
 * Piano note frequencies (C Major scale + pentatonic notes)
 */
const PIANO_NOTES = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
  C5: 523.25,
}

export type PianoNote = keyof typeof PIANO_NOTES

/**
 * Play a piano note using sine wave with improved envelope
 */
export function playPianoNote(note: PianoNote = "C", duration = 0.3) {
  try {
    const ctx = getAudioContext()

    // Resume context if suspended (autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sine"
    oscillator.frequency.value = PIANO_NOTES[note]

    // Improved envelope for more realistic piano sound
    const now = ctx.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01) // Fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.1) // Slight decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration) // Smooth release

    oscillator.start(now)
    oscillator.stop(now + duration)
  } catch (error) {
    console.error("[Audio] Error playing piano note:", error)
  }
}

/**
 * Play random piano note from C Major scale
 */
export function playRandomNote() {
  const notes = Object.keys(PIANO_NOTES) as PianoNote[]
  const randomNote = notes[Math.floor(Math.random() * notes.length)]
  playPianoNote(randomNote, 0.4)
}
