// Web Audio API Synthesizer - 0 KB external footprint for Ghar Ki Safai!

class SoundManager {
  private ctx: AudioContext | null = null
  private muted = false

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('diwali-safai-muted')
      this.muted = savedMute === 'true'
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public isMuted(): boolean {
    return this.muted
  }

  public toggleMute(): boolean {
    this.muted = !this.muted
    localStorage.setItem('diwali-safai-muted', String(this.muted))
    return this.muted
  }

  // Catch dust / clean floor: crisp 8-bit blip
  public playCatch() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(580, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08)

      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.09)
    } catch {
      // Audio autoplay policy
    }
  }

  // Catch Diya: bright golden chime
  public playDiya() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.13)
    } catch {
      // Audio blocked
    }
  }

  // Catch Kaju Katli: sweet double power-up sparkle
  public playKaju() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [659.25, 880, 1174.66] // E5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = ctx.currentTime + idx * 0.06

        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.12, start)
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.09)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.1)
      })
    } catch {
      // Audio error
    }
  }

  // Mummy's Flying Chappal Hit: slap / bonk + low thump
  public playChappal() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(260, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.18)

      gain.gain.setValueAtTime(0.35, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.19)
    } catch {
      // Audio error
    }
  }

  // Soan Papdi penalty: sad wah-wah buzzer
  public playSoanPapdi() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      osc.frequency.setValueAtTime(196, ctx.currentTime + 0.1)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.23)
    } catch {
      // Audio error
    }
  }

  // Sharma Ji Ka Beta alert: siren whoop
  public playSharmaJi() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(500, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1)
      osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.2)

      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.26)
    } catch {
      // Audio error
    }
  }

  // Firework burst: pop + crackle
  public playFirework() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.26)
    } catch {
      // Audio error
    }
  }

  // Victory Fanfare: Royal Diwali celebration jingle
  public playVictoryFanfare() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      // Festive Dhol / celebration melody notes: C4, E4, G4, C5, G4, C5
      const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 523.25]
      const durations = [0.12, 0.12, 0.14, 0.22, 0.12, 0.4]
      let timeOffset = 0

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = ctx.currentTime + timeOffset
        const dur = durations[i]

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.25, start)
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + dur + 0.02)

        timeOffset += dur * 0.8
      })
    } catch {
      // Audio error
    }
  }
}

export const sound = new SoundManager()
