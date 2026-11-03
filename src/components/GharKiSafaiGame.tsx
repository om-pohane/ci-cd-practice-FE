import { useEffect, useRef, useState, type FC } from 'react'
import type { FallingItem, FloatingText, ItemType } from '../types/diwali'
import { sound } from '../utils/sound'

interface GharKiSafaiGameProps {
  recipientName: string
  onGameOver: (stats: {
    score: number
    kajuKatlis: number
    diyas: number
    chappalsDodged: number
  }) => void
}

const ITEM_DEFS: Record<
  ItemType,
  { emoji: string; label: string; points: number; isHazard: boolean; baseSpeed: number }
> = {
  DUST: { emoji: '🧹', label: 'Dust Bunny', points: 30, isHazard: false, baseSpeed: 0.65 },
  DIYA: { emoji: '🪔', label: 'Golden Diya', points: 60, isHazard: false, baseSpeed: 0.7 },
  KAJU_KATLI: { emoji: '🍬', label: 'Kaju Katli', points: 100, isHazard: false, baseSpeed: 0.8 },
  GOLD_COIN: { emoji: '🪙', label: 'Laxmi Coin', points: 150, isHazard: false, baseSpeed: 0.85 },
  CHAPPAL: { emoji: '👡', label: "Mummy's Chappal", points: 0, isHazard: true, baseSpeed: 0.9 },
  SOAN_PAPDI: { emoji: '📦', label: 'Soan Papdi', points: -50, isHazard: true, baseSpeed: 0.75 },
  SHARMA_JI: { emoji: '👨‍💼', label: 'Sharma Ji', points: 0, isHazard: true, baseSpeed: 0.85 },
}

export const GharKiSafaiGame: FC<GharKiSafaiGameProps> = ({
  recipientName,
  onGameOver,
}) => {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(1)
  const [timeLeft, setTimeLeft] = useState(45)
  const [isSpeedBoost, setIsSpeedBoost] = useState(false)
  const [screenShake, setScreenShake] = useState(false)
  const [playerX, setPlayerX] = useState(45) // percentage 5 to 85
  const [playerFacing, setPlayerFacing] = useState<'left' | 'right'>('right')
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])

  // Stats tracking
  const statsRef = useRef({
    kajuKatlis: 0,
    diyas: 0,
    chappalsDodged: 0,
  })

  const itemsRef = useRef<FallingItem[]>([])
  const [items, setItems] = useState<FallingItem[]>([])

  const keysPressed = useRef<{ left: boolean; right: boolean }>({ left: false, right: false })
  const gameLoopRef = useRef<number | null>(null)
  const itemIdCounter = useRef(1)

  // Floating text trigger
  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    const id = Date.now() + Math.random()
    setFloatingTexts((prev) => [...prev, { id, x, y, text, color }])
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id))
    }, 900)
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [])

  // 1-second countdown clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Check Game Over
  useEffect(() => {
    if (lives <= 0 || timeLeft <= 0) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
      sound.playVictoryFanfare()
      onGameOver({
        score,
        kajuKatlis: statsRef.current.kajuKatlis,
        diyas: statsRef.current.diyas,
        chappalsDodged: statsRef.current.chappalsDodged,
      })
    }
  }, [lives, timeLeft, score, onGameOver])

  // Main 60 FPS Game Loop
  useEffect(() => {
    let lastSpawnTime = Date.now()
    let lastBoostEndTime = 0

    const loop = () => {
      const now = Date.now()

      // Player Movement from Keyboard
      const moveSpeed = isSpeedBoost ? 1.6 : 1.1
      setPlayerX((prev) => {
        let next = prev
        if (keysPressed.current.left) {
          next = Math.max(4, prev - moveSpeed)
        }
        if (keysPressed.current.right) {
          next = Math.min(86, prev + moveSpeed)
        }
        return next
      })

      // Spawn falling items
      const spawnInterval = Math.max(480, 950 - Math.min(score, 1500) * 0.3)
      if (now - lastSpawnTime > spawnInterval) {
        lastSpawnTime = now

        // Pick item with weights
        const roll = Math.random()
        let type: ItemType
        if (roll < 0.28) type = 'DUST'
        else if (roll < 0.48) type = 'DIYA'
        else if (roll < 0.62) type = 'KAJU_KATLI'
        else if (roll < 0.72) type = 'GOLD_COIN'
        else if (roll < 0.86) type = 'CHAPPAL'
        else if (roll < 0.94) type = 'SOAN_PAPDI'
        else type = 'SHARMA_JI'

        const def = ITEM_DEFS[type]
        const newItem: FallingItem = {
          id: itemIdCounter.current++,
          type,
          x: Math.random() * 78 + 6, // 6% to 84%
          y: -4,
          speed: def.baseSpeed + Math.random() * 0.25 + Math.min(score, 1200) * 0.0003,
          emoji: def.emoji,
          label: def.label,
          points: def.points,
          isHazard: def.isHazard,
        }

        itemsRef.current.push(newItem)
      }

      // Check speed boost expiration
      if (isSpeedBoost && now > lastBoostEndTime) {
        setIsSpeedBoost(false)
      }

      // Move & Collide Items
      const remainingItems: FallingItem[] = []
      const currentItems = itemsRef.current

      for (let i = 0; i < currentItems.length; i++) {
        const item = currentItems[i]
        item.y += item.speed

        // Hit detection zone near player (y ~ 74% to 86%)
        if (item.y >= 74 && item.y <= 86) {
          const distance = Math.abs(item.x - playerX)
          if (distance < 9.5) {
            // Collision!
            if (item.isHazard) {
              // HAZARD HIT!
              if (item.type === 'CHAPPAL') {
                sound.playChappal()
                setLives((l) => Math.max(0, l - 1))
                setCombo(1)
                setScreenShake(true)
                setTimeout(() => setScreenShake(false), 300)
                addFloatingText(playerX, 70, "OUCH! Mummy's Chappal! -1 ❤️", '#ff3b30')
              } else if (item.type === 'SOAN_PAPDI') {
                sound.playSoanPapdi()
                setScore((s) => Math.max(0, s - 50))
                setCombo(1)
                addFloatingText(playerX, 70, 'Re-Gifted Soan Papdi! -50', '#ff9500')
              } else if (item.type === 'SHARMA_JI') {
                sound.playSharmaJi()
                setLives((l) => Math.max(0, l - 1))
                setCombo(1)
                setScreenShake(true)
                setTimeout(() => setScreenShake(false), 400)
                addFloatingText(playerX, 70, 'Package Kitna Hai?! -1 ❤️', '#ff2d55')
              }
            } else {
              // BENEFICIAL ITEM COLLECTED!
              if (item.type === 'DUST') {
                sound.playCatch()
                addFloatingText(item.x, item.y, `+${item.points * combo}`, '#30d158')
              } else if (item.type === 'DIYA') {
                sound.playDiya()
                statsRef.current.diyas += 1
                addFloatingText(item.x, item.y, `+${item.points * combo} Diya Lit! 🪔`, '#ffd60a')
              } else if (item.type === 'KAJU_KATLI') {
                sound.playKaju()
                statsRef.current.kajuKatlis += 1
                setIsSpeedBoost(true)
                lastBoostEndTime = now + 4000
                addFloatingText(item.x, item.y, `+${item.points * combo} KAJU RUSH! 🍬⚡`, '#bf5af2')
              } else if (item.type === 'GOLD_COIN') {
                sound.playDiya()
                addFloatingText(item.x, item.y, `+${item.points * combo} Laxmi Coin! 🪙`, '#ffcc00')
              }

              setScore((s) => s + item.points * combo)
              setCombo((c) => Math.min(5, c + 1))
            }
            continue // Item absorbed
          }
        }

        // Passed safely past bottom
        if (item.y > 96) {
          if (item.type === 'CHAPPAL' || item.type === 'SHARMA_JI') {
            statsRef.current.chappalsDodged += 1
          }
          continue // Item removed off-screen
        }

        remainingItems.push(item)
      }

      itemsRef.current = remainingItems
      setItems([...remainingItems])

      gameLoopRef.current = requestAnimationFrame(loop)
    }

    gameLoopRef.current = requestAnimationFrame(loop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [playerX, isSpeedBoost, score, combo])

  // Direct Touch Drag on Mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0]
      const rect = e.currentTarget.getBoundingClientRect()
      const touchX = touch.clientX - rect.left
      const percent = (touchX / rect.width) * 100
      setPlayerFacing(percent > playerX ? 'right' : 'left')
      setPlayerX(Math.max(4, Math.min(86, percent)))
    }
  }

  return (
    <div
      className={`safai-game-stage ${screenShake ? 'screen-shake' : ''}`}
      onTouchMove={handleTouchMove}
    >
      {/* Decorative Toran & Marigold Garlands */}
      <div className="game-garland-row">
        <span className="garland-flower">🌼</span>
        <span className="garland-kandil">🏮</span>
        <span className="garland-flower">🌸</span>
        <span className="garland-kandil">🪔</span>
        <span className="garland-flower">🌼</span>
        <span className="garland-kandil">🏮</span>
        <span className="garland-flower">🌸</span>
      </div>

      {/* Top Arcade HUD */}
      <div className="game-hud-bar">
        {/* Lives */}
        <div className="hud-metric hud-lives">
          <span className="hud-label">LIVES</span>
          <div className="hearts-wrap">
            {[1, 2, 3].map((heart) => (
              <span
                key={heart}
                className={`heart-icon ${heart <= lives ? 'heart-full' : 'heart-empty'}`}
              >
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Score & Combo */}
        <div className="hud-metric hud-score">
          <span className="hud-label">SAFAI SCORE</span>
          <span className="score-val">{score}</span>
          {combo > 1 && <span className="combo-pill">x{combo} COMBO!</span>}
        </div>

        {/* Time Left */}
        <div className="hud-metric hud-timer">
          <span className="hud-label">PUJA TIME</span>
          <span className={`timer-val ${timeLeft <= 10 ? 'timer-urgent' : ''}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Cleanliness Progress Meter */}
      <div className="safai-meter-wrap">
        <div className="meter-label-row">
          <span>🧹 GHAR KI SAFAI PROGRESS</span>
          <span>{Math.min(100, Math.floor((score / 1500) * 100))}%</span>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${Math.min(100, (score / 1500) * 100)}%` }}
          />
        </div>
      </div>

      {/* Floating Score/Comic Texts */}
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

      {/* Falling Items Canvas Area */}
      <div className="falling-items-layer">
        {items.map((item) => (
          <div
            key={item.id}
            className={`falling-item ${item.isHazard ? 'item-hazard' : 'item-good'}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            <span className="item-emoji">{item.emoji}</span>
            <span className="item-label-chip">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Floor with Indian Rangoli Texture */}
      <div className="room-floor-base">
        <div className="floor-rangoli-center">💮</div>
      </div>

      {/* Player Character */}
      <div
        className={`player-character ${isSpeedBoost ? 'player-boosted' : ''}`}
        style={{
          left: `${playerX}%`,
          transform: playerFacing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        {isSpeedBoost && <div className="kaju-boost-sparkles">✨⚡✨</div>}
        <div className="kid-sprite">
          <span className="kid-avatar">🏃</span>
          <span className="kid-broom">🧹</span>
        </div>
        <div className="kid-name-tag">{recipientName || 'You'}</div>
      </div>

      {/* Mobile On-Screen Tactile Touch Controls */}
      <div className="mobile-touch-controls">
        <button
          type="button"
          className="touch-btn touch-btn-left"
          onPointerDown={() => {
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
          className="touch-btn touch-btn-right"
          onPointerDown={() => {
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

      {/* Bottom Sub-notice */}
      <div className="game-bottom-hint">
        <span>💡 Catch Sweets &amp; Diyas, Dodge Mummy's Chappal &amp; Sharma Ji!</span>
      </div>
    </div>
  )
}
