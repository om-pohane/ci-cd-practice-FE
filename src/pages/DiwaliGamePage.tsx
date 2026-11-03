import { useEffect, useState, type FC } from 'react'
import { api } from '../services/api'
import { sound } from '../utils/sound'
import { GharKiSafaiGame } from '../components/GharKiSafaiGame'
import { DiwaliCelebrationModal } from '../components/DiwaliCelebrationModal'
import { CreateWishModal } from '../components/CreateWishModal'
import { LeaderboardModal } from '../components/LeaderboardModal'
import { NamePromptModal } from '../components/NamePromptModal'

export const DiwaliGamePage: FC = () => {
  // Query parameters state & Player Name
  const [recipientName, setRecipientName] = useState(() => {
    if (typeof window === 'undefined') return ''
    const param = new URLSearchParams(window.location.search).get('to')
    if (param && param.trim()) return param.trim()
    const stored = localStorage.getItem('safai-player-name')
    if (stored && stored.trim()) return stored.trim()
    return ''
  })
  const [senderName, setSenderName] = useState(() => {
    if (typeof window === 'undefined') return 'Om'
    return new URLSearchParams(window.location.search).get('from') || 'Om'
  })
  const [customMessage, setCustomMessage] = useState('')
  const [wishCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('code')
  })

  // Ask player for name right at beginning if not set in URL or storage
  const [isNameModalOpen, setIsNameModalOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    const param = new URLSearchParams(window.location.search).get('to')
    if (param && param.trim()) return false
    const stored = localStorage.getItem('safai-player-name')
    if (stored && stored.trim()) return false
    return true // Prompt upfront!
  })

  // Game state
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'CELEBRATION'>(() => {
    if (typeof window === 'undefined') return 'IDLE'
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (preview === 'celebration') return 'CELEBRATION'
    if (preview === 'game') return 'PLAYING'
    return 'IDLE'
  })
  const [lastGameStats, setLastGameStats] = useState(() => {
    if (typeof window === 'undefined') return { score: 0, kajuKatlis: 0, diyas: 0, chappalsDodged: 0 }
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (preview === 'celebration') {
      return { score: 1420, kajuKatlis: 12, diyas: 16, chappalsDodged: 21 }
    }
    return { score: 0, kajuKatlis: 0, diyas: 0, chappalsDodged: 0 }
  })

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(sound.isMuted())

  // Fetch wish details if code present
  useEffect(() => {
    if (!wishCode) return
    let ignore = false

    api.diwali
      .getWish(wishCode)
      .then((wish) => {
        if (!ignore && wish) {
          setRecipientName(wish.toName)
          setSenderName(wish.fromName)
          setCustomMessage(wish.customMessage)
        }
      })
      .catch(() => {
        // Fallback to query params
      })

    return () => {
      ignore = true
    }
  }, [wishCode])

  const handleSaveName = (name: string) => {
    setRecipientName(name)
    if (typeof window !== 'undefined') {
      localStorage.setItem('safai-player-name', name)
    }
    setIsNameModalOpen(false)
  }

  const handleStartGame = () => {
    if (!recipientName.trim()) {
      setIsNameModalOpen(true)
      return
    }
    sound.playDiya()
    setGameState('PLAYING')
  }

  const handleGameOver = async (stats: {
    score: number
    kajuKatlis: number
    diyas: number
    chappalsDodged: number
  }) => {
    setLastGameStats(stats)
    setGameState('CELEBRATION')

    // Submit score to backend
    try {
      await api.diwali.submitScore({
        playerName: recipientName || 'Anonymous Sweeper',
        wishCode: wishCode || undefined,
        score: stats.score,
        kajuKatlis: stats.kajuKatlis,
        diyas: stats.diyas,
        chappalsDodged: stats.chappalsDodged,
      })
    } catch {
      // Backend optional
    }
  }

  const handleToggleSound = () => {
    const next = sound.toggleMute()
    setIsMuted(next)
  }

  return (
    <div className="diwali-app-container">
      {/* Background Ambience: Hanging Torans & Lanterns */}
      <div className="ambient-header-toran">
        <div className="toran-row">
          <span>🌸</span>
          <span>🏮</span>
          <span>🌼</span>
          <span>🪔</span>
          <span>🌸</span>
          <span>🏮</span>
          <span>🌼</span>
        </div>
      </div>

      {/* Main Responsive Game Viewport */}
      <div className="game-viewport-card">
        {/* Top Controls Toolbar */}
        <div className="viewport-top-bar">
          <div className="logo-badge">
            <span className="logo-diya">🪔</span>
            <span className="logo-text">SHUBH DEEPAVALI</span>
          </div>

          <div className="top-bar-actions">
            <button
              type="button"
              className="icon-btn-sound"
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <button
              type="button"
              className="btn-create-wish-header"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Send Wish
            </button>
          </div>
        </div>

        {/* 1. START / BRIEFING SCREEN */}
        {gameState === 'IDLE' && (
          <div className="game-start-screen">
            {/* Player Identity Bar */}
            <div className="player-identity-bar">
              <div className="identity-left">
                <span className="identity-avatar">👤</span>
                <div className="identity-text">
                  <span className="identity-tag">Player Name:</span>
                  <strong className="identity-name">{recipientName || 'Name Not Set'}</strong>
                </div>
              </div>
              <button
                type="button"
                className="btn-edit-identity"
                onClick={() => setIsNameModalOpen(true)}
              >
                ✏️ Change
              </button>
            </div>

            {/* Mummy's Order Callout */}
            <div className="mummy-order-banner">
              <span className="mummy-icon">👩‍👧‍👦</span>
              <div className="mummy-text-content">
                <h4 className="mummy-headline">
                  MUMMY'S ORDER FOR {recipientName ? recipientName.toUpperCase() : 'YOU'}!
                </h4>
                <p className="mummy-sub">
                  "Pehle ghar ki safai poori karo, warna Diwali puja me no Kaju Katli!"
                </p>
                <div className="sent-by-tag">— Sent with love by {senderName}</div>
              </div>
            </div>

            {/* Game Title */}
            <div className="game-hero-title">
              <h1 className="hero-text">GHAR KI SAFAI</h1>
              <span className="hero-badge">SURVIVAL MODE 🧹✨</span>
            </div>

            {/* Mission Rules Grid */}
            <div className="rules-legend-grid">
              <div className="rule-item rule-collect">
                <span className="rule-emoji">🧹</span>
                <div className="rule-info">
                  <strong>Dust Bunny</strong>
                  <span>+30 pts</span>
                </div>
              </div>

              <div className="rule-item rule-collect">
                <span className="rule-emoji">🪔</span>
                <div className="rule-info">
                  <strong>Golden Diya</strong>
                  <span>+60 pts</span>
                </div>
              </div>

              <div className="rule-item rule-collect">
                <span className="rule-emoji">🍬</span>
                <div className="rule-info">
                  <strong>Kaju Katli</strong>
                  <span>+100 pts + SPEED</span>
                </div>
              </div>

              <div className="rule-item rule-hazard">
                <span className="rule-emoji">👡</span>
                <div className="rule-info">
                  <strong>Mummy's Chappal</strong>
                  <span>-1 ❤️ OUCH!</span>
                </div>
              </div>

              <div className="rule-item rule-hazard">
                <span className="rule-emoji">📦</span>
                <div className="rule-info">
                  <strong>Soan Papdi</strong>
                  <span>-50 pts (Re-gifted!)</span>
                </div>
              </div>

              <div className="rule-item rule-hazard">
                <span className="rule-emoji">👨‍💼</span>
                <div className="rule-info">
                  <strong>Sharma Ji</strong>
                  <span>-1 ❤️ (Package Kitna?)</span>
                </div>
              </div>
            </div>

            {/* Controls Explanation */}
            <div className="controls-hint-card">
              <span className="controls-icon">🎮</span>
              <span>
                <strong>Mobile:</strong> Tap left/right buttons or drag finger. <br />
                <strong>Desktop:</strong> Use Arrow Keys (← / →) or A / D.
              </span>
            </div>

            {/* Giant Start Button */}
            <button
              type="button"
              className="btn-start-safai"
              onClick={handleStartGame}
            >
              <span className="btn-icon">🧹</span>
              <span className="btn-label">START SAFAI MISSION</span>
            </button>

            {/* Footer Buttons */}
            <div className="start-screen-footer">
              <button
                type="button"
                className="btn-footer-link"
                onClick={() => setIsLeaderboardOpen(true)}
              >
                🏆 View Hall of Fame
              </button>
              <button
                type="button"
                className="btn-footer-link"
                onClick={() => setIsCreateModalOpen(true)}
              >
                ✍️ Make Wish for Someone Else
              </button>
            </div>
          </div>
        )}

        {/* 2. ACTIVE GAME SCREEN */}
        {gameState === 'PLAYING' && (
          <GharKiSafaiGame
            recipientName={recipientName}
            onGameOver={handleGameOver}
          />
        )}

        {/* 3. POST-GAME CELEBRATION MODAL */}
        {gameState === 'CELEBRATION' && (
          <DiwaliCelebrationModal
            score={lastGameStats.score}
            kajuKatlis={lastGameStats.kajuKatlis}
            diyas={lastGameStats.diyas}
            chappalsDodged={lastGameStats.chappalsDodged}
            recipientName={recipientName}
            senderName={senderName}
            customMessage={customMessage}
            onPlayAgain={() => setGameState('PLAYING')}
            onOpenCreateWish={() => setIsCreateModalOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}
      </div>

      {/* Floating Modals */}
      <NamePromptModal
        key={recipientName || 'new-player'}
        isOpen={isNameModalOpen}
        currentName={recipientName}
        onSaveName={handleSaveName}
        onClose={recipientName ? () => setIsNameModalOpen(false) : undefined}
      />

      <CreateWishModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(_code, from, to) => {
          setSenderName(from)
          setRecipientName(to)
        }}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  )
}
