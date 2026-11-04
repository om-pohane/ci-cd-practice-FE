import { useEffect, useRef, useState, type FC } from 'react'
import type { AngerLevel, FallingItem, FloatingText, GameStats, ItemType, Particle, StageConfig } from '../types/diwali'
import { sound } from '../utils/sound'
import { PixelRenderer } from '../game/pixelRenderer'
import { GameHUD } from './GameHUD'
import { PauseModal } from './PauseModal'

interface GharKiSafaiGameProps {
  stage: StageConfig
  recipientName: string
  onVictory: (stats: GameStats) => void
  onGameOver: (stats: GameStats, reason: 'LIVES_LOST' | 'TIME_OUT') => void
  onQuitToMenu: () => void
  onOpenSettings: () => void
}

const ITEM_CONFIGS: Record<
  ItemType,
  { label: string; points: number; isHazard: boolean; baseSpeed: number }
> = {
  DUST: { label: 'Dust Bunny', points: 30, isHazard: false, baseSpeed: 0.65 },
  SPIDERWEB: { label: 'Spiderweb', points: 40, isHazard: false, baseSpeed: 0.6 },
  GOLD_COIN: { label: 'Laxmi Coin', points: 150, isHazard: false, baseSpeed: 0.8 },
  KAJU_KATLI: { label: 'Kaju Katli', points: 100, isHazard: false, baseSpeed: 0.85 },
  DIYA: { label: 'Sacred Diya', points: 60, isHazard: false, baseSpeed: 0.7 },
  CHAPPAL: { label: "Mummy's Chappal", points: 0, isHazard: true, baseSpeed: 0.95 },
  SOAN_PAPDI: { label: 'Re-Gifted Soan Papdi', points: -50, isHazard: true, baseSpeed: 0.75 },
  SHARMA_JI: { label: 'Sharma Ji Ka Beta', points: 0, isHazard: true, baseSpeed: 0.9 },
}

export const GharKiSafaiGame: FC<GharKiSafaiGameProps> = ({
  stage,
  recipientName,
  onVictory,
  onGameOver,
  onQuitToMenu,
  onOpenSettings,
}) => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<PixelRenderer | null>(null)

  // Core Game State
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(1)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(stage.timeLimit)
  const [isPaused, setIsPaused] = useState(false)
  const [isSpeedBoost, setIsSpeedBoost] = useState(false)
  const [speedBoostRemaining, setSpeedBoostRemaining] = useState(0)
  const [isSlowed, setIsSlowed] = useState(false)
  const [isHurt, setIsHurt] = useState(false)
  const [screenShake, setScreenShake] = useState(false)

  // Player position: percent 6% to 86%
  const [playerX, setPlayerX] = useState(48)
  const [playerFacing, setPlayerFacing] = useState<'left' | 'right'>('right')

  // Anger Meter State
  const [anger, setAnger] = useState(10)
  const [diyasCollected, setDiyasCollected] = useState(0)

  const angerLevel: AngerLevel =
    anger >= 85 ? 'RAGE' : anger >= 60 ? 'ANGRY' : anger >= 35 ? 'SUSPICIOUS' : 'CALM'
  const angerWarning =
    angerLevel === 'RAGE'
      ? 'CHAPPAL RAGE! Haath tez chalao, warna flying chappal aayegi!! 🔥'
      : angerLevel === 'ANGRY'
      ? 'Sharma ji ke bete ko dekho, unka pura ghar chamak raha hai!'
      : angerLevel === 'SUSPICIOUS'
      ? 'Diwali guests are almost here! Sweep faster!'
      : 'Shaabash! Keep sweeping, Mummy is watching happily!'

  // Floating text & particles
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const particlesRef = useRef<Particle[]>([])

  // Items tracking
  const itemsRef = useRef<FallingItem[]>([])
  const itemIdCounter = useRef(1)

  // Detailed statistics tracking
  const statsRef = useRef({
    dustCleared: 0,
    coinsCollected: 0,
    sweetsCollected: 0,
    diyasCollected: 0,
    chappalsDodged: 0,
    startTime: 0,
  })

  useEffect(() => {
    statsRef.current.startTime = Date.now()
  }, [])

  // Keyboard state
  const keysPressed = useRef<{ left: boolean; right: boolean }>({ left: false, right: false })
  const gameLoopRef = useRef<number | null>(null)

  // Cleanliness percentage
  const cleanlinessPercent = Math.min(100, Math.floor((score / stage.targetScore) * 100))

  // Floating text trigger
  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    const id = Date.now() + Math.random()
    setFloatingTexts((prev) => [...prev, { id, x, y, text, color, opacity: 1 }])
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id))
    }, 950)
  }

  // Spawn particle explosion
  const spawnParticles = (x: number, y: number, color: string, count = 8, shape: 'circle' | 'star' = 'circle') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 3 + 1
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02,
        shape,
      })
    }
  }

  // Handle Tab Visibility Change (auto-pause if user switches tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Keyboard Listener: Left, Right, A, D, Space (Pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setIsPaused((p) => !p)
        return
      }

      if (isPaused) return

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = true
        setPlayerFacing('left')
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = true
        setPlayerFacing('right')
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysPressed.current.left = false
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysPressed.current.right = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPaused])

  // 1-Second Countdown Timer
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })

      // Passive Mummy Anger growth over time
      setAnger((a) => Math.min(100, a + 0.6))
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused])

  // Check Game Over & Victory Conditions
  useEffect(() => {
    const timeTaken = Math.round((Date.now() - statsRef.current.startTime) / 1000)
    const finalStats: GameStats = {
      score,
      cleanlinessPercent,
      dustCleared: statsRef.current.dustCleared,
      coinsCollected: statsRef.current.coinsCollected,
      sweetsCollected: statsRef.current.sweetsCollected,
      chappalsDodged: statsRef.current.chappalsDodged,
      diyasCollected: statsRef.current.diyasCollected,
      timeTaken,
      livesRemaining: lives,
      stageId: stage.id,
      rankTitle: 'Safai Samrat',
    }

    // 1. Victory: Target score reached
    if (score >= stage.targetScore) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      sound.playVictoryFanfare()
      onVictory(finalStats)
      return
    }

    // 2. Game Over: Lives Lost
    if (lives <= 0) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      sound.playGameOver()
      onGameOver(finalStats, 'LIVES_LOST')
      return
    }

    // 3. Game Over: Time Expired without meeting target
    if (timeLeft <= 0) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      if (cleanlinessPercent >= 100) {
        sound.playVictoryFanfare()
        onVictory(finalStats)
      } else {
        sound.playGameOver()
        onGameOver(finalStats, 'TIME_OUT')
      }
    }
  }, [lives, timeLeft, score, cleanlinessPercent, stage, onVictory, onGameOver])

  // Main 60 FPS Delta-Time Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    rendererRef.current = new PixelRenderer(ctx, canvas.width, canvas.height)

    let lastSpawnTime = Date.now()
    let lastBoostEndTime = 0
    let lastSlowEndTime = 0
    let lastTime = performance.now()

    const loop = (currentTime: number) => {
      if (isPaused) {
        gameLoopRef.current = requestAnimationFrame(loop)
        return
      }

      const dt = Math.min(32, currentTime - lastTime) / 16.66 // Normalized delta-time (1.0 at 60fps)
      lastTime = currentTime
      const now = Date.now()

      // Canvas dimensions
      const width = canvas.width
      const height = canvas.height
      rendererRef.current?.resize(width, height)

      // 1. Player Movement from Keyboard
      const baseMoveSpeed = isSpeedBoost ? 1.7 : isSlowed ? 0.6 : 1.15
      setPlayerX((prev) => {
        let next = prev
        if (keysPressed.current.left) {
          next = Math.max(6, prev - baseMoveSpeed * dt)
        }
        if (keysPressed.current.right) {
          next = Math.min(88, prev + baseMoveSpeed * dt)
        }
        return next
      })

      // 2. Spawn items based on spawn interval (affected by anger level)
      const angerSpeedMultiplier = angerLevel === 'RAGE' ? 1.4 : angerLevel === 'ANGRY' ? 1.2 : 1.0
      const spawnInterval = Math.max(380, (920 - Math.min(score, 2500) * 0.22) / angerSpeedMultiplier)

      if (now - lastSpawnTime > spawnInterval) {
        lastSpawnTime = now

        // Pick item with dynamic weights
        const roll = Math.random()
        let type: ItemType
        if (roll < 0.28) type = 'DUST'
        else if (roll < 0.42) type = 'SPIDERWEB'
        else if (roll < 0.58) type = 'DIYA'
        else if (roll < 0.70) type = 'GOLD_COIN'
        else if (roll < 0.80) type = 'KAJU_KATLI'
        else if (roll < 0.90) type = 'CHAPPAL'
        else if (roll < 0.96) type = 'SOAN_PAPDI'
        else type = 'SHARMA_JI'

        const cfg = ITEM_CONFIGS[type]
        const spawnX = Math.random() * 78 + 8 // 8% to 86%
        const newItem: FallingItem = {
          id: itemIdCounter.current++,
          type,
          x: spawnX,
          y: -6,
          speed: (cfg.baseSpeed + Math.random() * 0.25) * angerSpeedMultiplier,
          width: 28,
          height: 28,
          label: cfg.label,
          points: cfg.points,
          isHazard: cfg.isHazard,
          rotation: 0,
          rotationSpeed: type === 'CHAPPAL' ? 0.12 : type === 'GOLD_COIN' ? 0.05 : 0,
          baseX: spawnX,
          timeAlive: 0,
        }

        itemsRef.current.push(newItem)
      }

      // 3. Speed Boost Expiration
      if (isSpeedBoost) {
        const remaining = Math.max(0, (lastBoostEndTime - now) / 1000)
        setSpeedBoostRemaining(remaining)
        if (now > lastBoostEndTime) {
          setIsSpeedBoost(false)
        }
      }

      // 4. Slowdown Expiration
      if (isSlowed && now > lastSlowEndTime) {
        setIsSlowed(false)
      }

      // 5. Update Falling Items & Collision Detection
      const remainingItems: FallingItem[] = []
      const currentItems = itemsRef.current

      for (let i = 0; i < currentItems.length; i++) {
        const item = currentItems[i]
        item.y += item.speed * dt
        item.rotation += item.rotationSpeed * dt
        item.timeAlive = (item.timeAlive || 0) + 0.05

        // Sharma Ji Ka Beta Zigzag oscillation
        if (item.type === 'SHARMA_JI' && item.baseX !== undefined) {
          item.x = Math.max(8, Math.min(86, item.baseX + Math.sin(item.timeAlive * 3.5) * 14))
        }

        // Collision Zone near Player (y ~ 70% to 80%)
        if (item.y >= 70 && item.y <= 81) {
          const distance = Math.abs(item.x - playerX)
          if (distance < 9.0) {
            // COLLISION OCCURRED!
            const screenX = (item.x / 100) * width
            const screenY = (item.y / 100) * height

            if (item.isHazard) {
              // HAZARD IMPACT
              if (item.type === 'CHAPPAL') {
                sound.playChappal()
                setLives((l) => Math.max(0, l - 1))
                setCombo(1)
                setIsHurt(true)
                setScreenShake(true)
                setAnger((a) => Math.min(100, a + 12)) // Chappal hit raises Mummy's anger!
                spawnParticles(screenX, screenY, '#ff3b30', 12, 'star')
                setTimeout(() => {
                  setIsHurt(false)
                  setScreenShake(false)
                }, 350)
                addFloatingText(playerX, 68, "OUCH! Mummy's Chappal! -1 ❤️", '#ff3b30')
              } else if (item.type === 'SOAN_PAPDI') {
                sound.playSoanPapdi()
                setScore((s) => Math.max(0, s - 50))
                setCombo(1)
                setIsSlowed(true)
                lastSlowEndTime = now + 3000
                spawnParticles(screenX, screenY, '#ff9500', 8)
                addFloatingText(playerX, 68, 'Re-Gifted Soan Papdi! -50 (Slowed!)', '#ff9500')
              } else if (item.type === 'SHARMA_JI') {
                sound.playSharmaJi()
                setLives((l) => Math.max(0, l - 1))
                setCombo(1)
                setIsHurt(true)
                setScreenShake(true)
                spawnParticles(screenX, screenY, '#ff2d55', 14, 'star')
                setTimeout(() => {
                  setIsHurt(false)
                  setScreenShake(false)
                }, 380)
                addFloatingText(playerX, 68, 'Sharma Ji: Package Kitna Hai?! -1 ❤️', '#ff2d55')
              }
            } else {
              // BENEFICIAL COLLECTIBLE PICKUP!
              if (item.type === 'DUST' || item.type === 'SPIDERWEB') {
                sound.playBroomSweep()
                statsRef.current.dustCleared += 1
                setAnger((a) => Math.max(0, a - 3.5)) // Cleaning calms Mummy down!
                spawnParticles(screenX, screenY, '#bdc3c7', 6)
                addFloatingText(item.x, item.y, `+${item.points * combo} Swept! 🧹`, '#30d158')
              } else if (item.type === 'GOLD_COIN') {
                sound.playCoin()
                statsRef.current.coinsCollected += 1
                spawnParticles(screenX, screenY, '#ffd700', 10, 'star')
                addFloatingText(item.x, item.y, `+${item.points * combo} Laxmi Coin! 🪙`, '#ffd700')
              } else if (item.type === 'KAJU_KATLI') {
                sound.playKaju()
                statsRef.current.sweetsCollected += 1
                setIsSpeedBoost(true)
                lastBoostEndTime = now + 4000
                spawnParticles(screenX, screenY, '#ffffff', 12, 'star')
                addFloatingText(item.x, item.y, `+${item.points * combo} KAJU SPEED RUSH! 🍬⚡`, '#bf5af2')
              } else if (item.type === 'DIYA') {
                sound.playDiya()
                statsRef.current.diyasCollected += 1
                setDiyasCollected((d) => d + 1)
                setAnger((a) => Math.max(0, a - 5.0))
                spawnParticles(screenX, screenY, '#ff9900', 10, 'star')
                addFloatingText(item.x, item.y, `+${item.points * combo} Diya Lit! 🪔`, '#ffcc00')
              }

              setScore((s) => s + item.points * combo)
              setCombo((c) => Math.min(6, c + 1))
            }
            continue // Item absorbed
          }
        }

        // Passed safely past bottom of room
        if (item.y > 96) {
          if (item.type === 'CHAPPAL' || item.type === 'SHARMA_JI') {
            statsRef.current.chappalsDodged += 1
          } else if (item.type === 'DUST' || item.type === 'SPIDERWEB') {
            // Unswept dirt accumulates and angers Mummy!
            setAnger((a) => Math.min(100, a + 2.5))
          }
          continue // Item removed
        }

        remainingItems.push(item)
      }

      itemsRef.current = remainingItems

      // 6. Update Active Particles
      const activeParticles: Particle[] = []
      for (let p = 0; p < particlesRef.current.length; p++) {
        const pt = particlesRef.current[p]
        pt.x += pt.vx * dt
        pt.y += pt.vy * dt
        pt.alpha -= pt.decay * dt
        if (pt.alpha > 0) {
          activeParticles.push(pt)
        }
      }
      particlesRef.current = activeParticles

      // 7. RENDER FRAME
      if (rendererRef.current) {
        // Clear & Draw Background
        rendererRef.current.renderBackground(stage)

        // Draw Falling Items
        for (let j = 0; j < remainingItems.length; j++) {
          rendererRef.current.renderFallingItem(remainingItems[j])
        }

        // Draw Player with Broom
        const playerScreenX = (playerX / 100) * width
        rendererRef.current.renderPlayer(
          playerScreenX,
          playerFacing,
          isSpeedBoost,
          isSlowed,
          isHurt,
          recipientName
        )

        // Draw Active Particles
        rendererRef.current.renderParticles(activeParticles)
      }

      gameLoopRef.current = requestAnimationFrame(loop)
    }

    gameLoopRef.current = requestAnimationFrame(loop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [playerX, playerFacing, isHurt, isPaused, isSpeedBoost, isSlowed, score, combo, angerLevel, stage, recipientName])

  // Direct Mobile Touch Drag
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isPaused) return
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const percent = (touchX / rect.width) * 100
      setPlayerFacing(percent > playerX ? 'right' : 'left')
      setPlayerX(Math.max(6, Math.min(88, percent)))
    }
  }

  const handleRestart = () => {
    setScore(0)
    setLives(3)
    setCombo(1)
    setTimeLeft(stage.timeLimit)
    setAnger(10)
    itemsRef.current = []
    particlesRef.current = []
    setIsPaused(false)
  }

  return (
    <div
      className={`safai-arcade-stage ${screenShake ? 'screen-shake' : ''}`}
      onTouchMove={handleTouchMove}
    >
      {/* Top Game HUD */}
      <GameHUD
        score={score}
        combo={combo}
        lives={lives}
        timeLeft={timeLeft}
        cleanlinessPercent={cleanlinessPercent}
        anger={anger}
        angerLevel={angerLevel}
        angerWarning={angerWarning}
        diyasCollected={diyasCollected}
        isSpeedBoost={isSpeedBoost}
        speedBoostTimeLeft={speedBoostRemaining}
        isSlowed={isSlowed}
        stage={stage}
        onPause={() => setIsPaused(true)}
      />

      {/* Floating Comic Score Texts */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="floating-comic-text"
          style={{
            left: `${ft.x}%`,
            top: `${ft.y}%`,
            color: ft.color,
          }}
        >
          {ft.text}
        </div>
      ))}

      {/* Main 60 FPS HTML5 Pixel Canvas */}
      <div className="canvas-viewport-wrapper">
        <canvas
          ref={canvasRef}
          width={480}
          height={560}
          className="arcade-game-canvas"
        />
      </div>

      {/* Mobile On-Screen Tactile Controls */}
      <div className="mobile-touch-paddles-row">
        <button
          type="button"
          className="tactile-paddle paddle-left"
          onPointerDown={() => {
            sound.triggerVibration(15)
            keysPressed.current.left = true
            setPlayerFacing('left')
          }}
          onPointerUp={() => {
            keysPressed.current.left = false
          }}
          onPointerLeave={() => {
            keysPressed.current.left = false
          }}
        >
          ◀ SWEEP LEFT
        </button>

        <button
          type="button"
          className="tactile-paddle paddle-right"
          onPointerDown={() => {
            sound.triggerVibration(15)
            keysPressed.current.right = true
            setPlayerFacing('right')
          }}
          onPointerUp={() => {
            keysPressed.current.right = false
          }}
          onPointerLeave={() => {
            keysPressed.current.right = false
          }}
        >
          SWEEP RIGHT ▶
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="arcade-bottom-status-strip">
        <span>💡 Catch Sweets &amp; Diyas, Dodge Mummy's Chappal &amp; Sharma Ji!</span>
      </div>

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onOpenSettings={onOpenSettings}
        onQuitToMenu={onQuitToMenu}
      />
    </div>
  )
}
