// Web Audio API Synthesizer - 0 KB external footprint for Ghar Ki Safai: Survival Mode!

class SoundEngine {
  private ctx: AudioContext | null = null
  private sfxEnabled = true
  private musicEnabled = true
  private vibrationEnabled = true
  private isBgmPlaying = false
  private bgmInterval: number | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const sfx = localStorage.getItem('diwali-sfx-enabled')
      if (sfx !== null) this.sfxEnabled = sfx === 'true'

      const music = localStorage.getItem('diwali-music-enabled')
      if (music !== null) this.musicEnabled = music === 'true'

      const vib = localStorage.getItem('diwali-vibration-enabled')
      if (vib !== null) this.vibrationEnabled = vib === 'true'
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
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  // --- Settings ---
  public isSfxEnabled(): boolean {
    return this.sfxEnabled
  }

  public setSfxEnabled(val: boolean) {
    this.sfxEnabled = val
    if (typeof window !== 'undefined') {
      localStorage.setItem('diwali-sfx-enabled', String(val))
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled
  }

  public setMusicEnabled(val: boolean) {
    this.musicEnabled = val
    if (typeof window !== 'undefined') {
      localStorage.setItem('diwali-music-enabled', String(val))
    }
    if (!val) {
      this.stopBgm()
    } else {
      this.startBgm()
    }
  }

  public isVibrationEnabled(): boolean {
    return this.vibrationEnabled
  }

  public setVibrationEnabled(val: boolean) {
    this.vibrationEnabled = val
    if (typeof window !== 'undefined') {
      localStorage.setItem('diwali-vibration-enabled', String(val))
    }
  }

  public triggerVibration(pattern: number | number[]) {
    if (!this.vibrationEnabled || typeof window === 'undefined') return
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern)
      }
    } catch {
      // Haptics unavailable
    }
  }

  // Backwards compatibility
  public isMuted(): boolean {
    return !this.sfxEnabled
  }

  public toggleMute(): boolean {
    const next = !this.sfxEnabled
    this.setSfxEnabled(next)
    this.setMusicEnabled(next)
    return !next
  }

  // --- Sound Effects ---

  // 1. Sweeping broom whoosh (synthesized white noise through bandpass filter)
  public playBroomSweep() {
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const bufferSize = ctx.sampleRate * 0.12
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(800, ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.1)
      filter.Q.value = 3

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.11)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start()
      noise.stop(ctx.currentTime + 0.12)
    } catch {
      // Autoplay safety
    }
  }

  // 2. Catch / clean dust (crisp 8-bit blip)
  public playCatch() {
    this.playBroomSweep()
  }

  // 3. Golden Laxmi Coin: Sparkling 2-tone chime (B5 -> E6)
  public playCoin() {
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [987.77, 1318.51] // B5, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = now + idx * 0.05

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.18, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.13)
      })
    } catch {
      // Audio error
    }
  }

  // 4. Sacred Clay Diya: Warm bell chime with harmonics
  public playDiya() {
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const fundamental = 880 // A5

      // Dual harmonic oscillators for bell resonance
      ;[1, 2.02].forEach((mult, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(fundamental * mult, now)

        const volume = i === 0 ? 0.22 : 0.09
        gain.gain.setValueAtTime(volume, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.3)
      })
    } catch {
      // Audio blocked
    }
  }

  // 5. Kaju Katli Power-Up: Ascending 4-tone retro sugar rush
  public playKaju() {
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = ctx.currentTime + idx * 0.05

        osc.type = 'square'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.12, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.11)
      })
    } catch {
      // Audio error
    }
  }

  // 6. Mummy's Flying Chappal Hit: Low bass punch + loud slap noise + haptics
  public playChappal() {
    this.triggerVibration([80, 50, 100])
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      // 1. Slap noise
      const bufferSize = ctx.sampleRate * 0.08
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const slapGain = ctx.createGain()
      slapGain.gain.setValueAtTime(0.35, now)
      slapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

      noise.connect(slapGain)
      slapGain.connect(ctx.destination)
      noise.start(now)

      // 2. Heavy bass punch
      const osc = ctx.createOscillator()
      const punchGain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, now)
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22)

      punchGain.gain.setValueAtTime(0.4, now)
      punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

      osc.connect(punchGain)
      punchGain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.23)
    } catch {
      // Audio error
    }
  }

  // 7. Soan Papdi Penalty: Comical downward cartoon slide whistle
  public playSoanPapdi() {
    this.triggerVibration(40)
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.28)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.29)
    } catch {
      // Audio error
    }
  }

  // 8. Sharma Ji Ka Beta: Boastful 3-tone horn fanfare
  public playSharmaJi() {
    this.triggerVibration([60, 40, 60])
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [392, 523.25, 783.99] // G4, C5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = now + idx * 0.08

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.18, start)
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.13)
      })
    } catch {
      // Audio error
    }
  }

  // 9. Firework burst (pop + sparkle crackle)
  public playFirework() {
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(280, now)
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.2)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.23)
    } catch {
      // Audio error
    }
  }

  // 10. Victory Fanfare: Royal Dhol + Shehnai inspired celebration melody
  public playVictoryFanfare() {
    this.triggerVibration([100, 50, 100, 50, 200])
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]
      const durations = [0.1, 0.1, 0.12, 0.15, 0.15, 0.18, 0.45]
      let timeOffset = 0

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = ctx.currentTime + timeOffset
        const dur = durations[i]

        osc.type = i === notes.length - 1 ? 'sine' : 'triangle'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.24, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + dur + 0.02)

        timeOffset += dur * 0.75
      })
    } catch {
      // Audio error
    }
  }

  // 11. Game Over: Comical sad slide
  public playGameOver() {
    this.triggerVibration([120, 80, 150])
    if (!this.sfxEnabled) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [370, 349.23, 329.63, 293.66] // F#4, F4, E4, D4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = now + idx * 0.14

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, start)
        if (idx === notes.length - 1) {
          osc.frequency.exponentialRampToValueAtTime(180, start + 0.35)
        }

        gain.gain.setValueAtTime(0.2, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + 0.26)
      })
    } catch {
      // Audio error
    }
  }

  // --- 8-Bit Festive Diwali Background Music (BGM) ---
  public startBgm() {
    if (!this.musicEnabled || this.isBgmPlaying) return
    const ctx = this.getContext()
    if (!ctx) return

    this.isBgmPlaying = true

    // Festive Indian 8-bit pentatonic melody loop: Raga Bhupali / Durga vibes in 8-bit chiptune
    // Notes: C4, D4, E4, G4, A4, C5 (261.63, 293.66, 329.63, 392.00, 440.00, 523.25)
    const melody = [
      261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66, 329.63, 392.0, 440.0, 523.25,
      659.25, 523.25, 440.0, 392.0,
    ]
    const bassline = [130.81, 130.81, 164.81, 164.81, 196.0, 196.0, 146.83, 146.83]

    let step = 0
    const stepDurationMs = 180

    const playStep = () => {
      if (!this.isBgmPlaying || !this.musicEnabled) return
      const currentCtx = this.getContext()
      if (!currentCtx) return

      try {
        const now = currentCtx.currentTime

        // Melody note (soft square wave)
        const melFreq = melody[step % melody.length]
        const melOsc = currentCtx.createOscillator()
        const melGain = currentCtx.createGain()
        melOsc.type = 'triangle'
        melOsc.frequency.setValueAtTime(melFreq, now)

        melGain.gain.setValueAtTime(0.05, now)
        melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

        melOsc.connect(melGain)
        melGain.connect(currentCtx.destination)

        melOsc.start(now)
        melOsc.stop(now + 0.17)

        // Bass groove on quarter beats
        if (step % 2 === 0) {
          const bassFreq = bassline[Math.floor(step / 2) % bassline.length]
          const bassOsc = currentCtx.createOscillator()
          const bassGain = currentCtx.createGain()
          bassOsc.type = 'sine'
          bassOsc.frequency.setValueAtTime(bassFreq, now)

          bassGain.gain.setValueAtTime(0.07, now)
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

          bassOsc.connect(bassGain)
          bassGain.connect(currentCtx.destination)

          bassOsc.start(now)
          bassOsc.stop(now + 0.32)
        }

        step++
      } catch {
        // Safe catch
      }
    }

    this.bgmInterval = window.setInterval(playStep, stepDurationMs)
  }

  public stopBgm() {
    this.isBgmPlaying = false
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval)
      this.bgmInterval = null
    }
  }
}

export const sound = new SoundEngine()
