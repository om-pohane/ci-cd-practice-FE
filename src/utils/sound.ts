// Web Audio API Synthesizer - 0 KB external footprint!

class SoundManager {
  private ctx: AudioContext | null = null
  private muted = false

  constructor() {
    // Lazy init on first user interaction
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('botclash-muted')
      this.muted = savedMute === 'true'
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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
    localStorage.setItem('botclash-muted', String(this.muted))
    return this.muted
  }

  // Laser shot / weapon attack sound
  public playAttackSound() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(480, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15)

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.16)
    } catch {
      // AudioContext could be blocked by browser policy until gesture
    }
  }

  // Heavy metal hit / damage sound
  public playHitSound() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(120, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.21)
    } catch {
      // Ignore
    }
  }

  // Critical explosion boom sound
  public playCritSound() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35)

      gain.gain.setValueAtTime(0.35, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.36)
    } catch {
      // Ignore
    }
  }

  // Victory fanfare chime
  public playVictorySound() {
    if (this.muted) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [261.63, 329.63, 392.0, 523.25] // C, E, G, High C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1)

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + idx * 0.1)
        osc.stop(ctx.currentTime + idx * 0.1 + 0.32)
      })
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundManager()
