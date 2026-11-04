import { useEffect, useState, type FC } from 'react'
import type { GameStats, StageId } from '../types/diwali'
import { api } from '../services/api'
import { sound } from '../utils/sound'
import { STAGES } from '../game/stages'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { NamePromptModal } from '../components/NamePromptModal'
import { MummyBriefingModal } from '../components/MummyBriefingModal'
import { GharKiSafaiGame } from '../components/GharKiSafaiGame'
import { DiwaliCelebrationModal } from '../components/DiwaliCelebrationModal'
import { GameOverModal } from '../components/GameOverModal'
import { CreateWishModal } from '../components/CreateWishModal'
import { LeaderboardModal } from '../components/LeaderboardModal'
import { SettingsModal } from '../components/SettingsModal'

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

  // Selected Stage / Room
  const [selectedStage, setSelectedStage] = useState<StageId>(() => {
    if (typeof window === 'undefined') return 'LIVING_ROOM'
    const roomParam = new URLSearchParams(window.location.search).get('room') as StageId
    if (roomParam && STAGES[roomParam]) return roomParam
    return 'LIVING_ROOM'
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

  // Game state flow: WELCOME -> BRIEFING -> PLAYING -> CELEBRATION / GAMEOVER
  const [gameState, setGameState] = useState<
    'WELCOME' | 'BRIEFING' | 'PLAYING' | 'CELEBRATION' | 'GAMEOVER'
  >(() => {
    if (typeof window === 'undefined') return 'WELCOME'
    const preview = new URLSearchParams(window.location.search).get('preview')
    if (preview === 'celebration') return 'CELEBRATION'
    if (preview === 'game') return 'PLAYING'
    if (preview === 'gameover') return 'GAMEOVER'
    if (preview === 'briefing') return 'BRIEFING'
    return 'WELCOME'
  })

  // Last game statistics
  const [lastGameStats, setLastGameStats] = useState<GameStats>(() => ({
    score: 1420,
    cleanlinessPercent: 100,
    dustCleared: 22,
    coinsCollected: 6,
    sweetsCollected: 5,
    diyasCollected: 8,
    chappalsDodged: 14,
    timeTaken: 38,
    livesRemaining: 2,
    stageId: 'LIVING_ROOM',
    rankTitle: 'Safai Samrat',
  }))

  const [gameOverReason, setGameOverReason] = useState<'LIVES_LOST' | 'TIME_OUT'>('LIVES_LOST')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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
        // Fallback gracefully to query params
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

  const handleStartMission = () => {
    if (!recipientName.trim()) {
      setIsNameModalOpen(true)
      return
    }
    sound.playDiya()
    setGameState('BRIEFING')
  }

  const handleStartGameplayFromBriefing = () => {
    setGameState('PLAYING')
    sound.startBgm()
  }

  const handleVictory = async (stats: GameStats) => {
    sound.stopBgm()
    setLastGameStats(stats)
    setGameState('CELEBRATION')

    // Submit score to backend
    try {
      await api.diwali.submitScore({
        playerName: recipientName || 'Anonymous Sweeper',
        wishCode: wishCode || undefined,
        score: stats.score,
        kajuKatlis: stats.sweetsCollected,
        diyas: stats.diyasCollected,
        chappalsDodged: stats.chappalsDodged,
      })
    } catch {
      // Backend optional
    }
  }

  const handleGameOver = (stats: GameStats, reason: 'LIVES_LOST' | 'TIME_OUT') => {
    sound.stopBgm()
    setLastGameStats(stats)
    setGameOverReason(reason)
    setGameState('GAMEOVER')
  }

  const handleNextStage = (nextStage: StageId) => {
    setSelectedStage(nextStage)
    setGameState('BRIEFING')
  }

  const currentStageConfig = STAGES[selectedStage]

  return (
    <div className="diwali-app-container">
      {/* Decorative Hanging Torans Header */}
      <div className="ambient-header-toran">
        <div className="toran-row">
          <span>🌸</span>
          <span>🏮</span>
          <span>🌼</span>
          <span className="toran-diya-glow">🪔</span>
          <span>🌸</span>
          <span>🏮</span>
          <span>🌼</span>
        </div>
      </div>

      {/* Main Responsive Game Viewport Card */}
      <div className="game-viewport-card">
        {/* Top Header Branding Toolbar */}
        <div className="viewport-top-bar">
          <div className="logo-badge">
            <span className="logo-diya">🪔</span>
            <span className="logo-text">SHUBH DEEPAVALI</span>
          </div>

          <div className="top-bar-actions">
            <button
              type="button"
              className="icon-btn-settings-top"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings & Audio"
            >
              ⚙️
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

        {/* 1. WELCOME / START SCREEN */}
        {gameState === 'WELCOME' && (
          <WelcomeScreen
            playerName={recipientName}
            senderName={senderName}
            selectedStage={selectedStage}
            onSelectStage={setSelectedStage}
            onOpenNamePrompt={() => setIsNameModalOpen(true)}
            onStartGame={handleStartMission}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenCreateWish={() => setIsCreateModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* 2. MUMMY'S MISSION BRIEFING */}
        {gameState === 'BRIEFING' && (
          <MummyBriefingModal
            isOpen={true}
            stage={currentStageConfig}
            playerName={recipientName}
            senderName={senderName}
            onStart={handleStartGameplayFromBriefing}
          />
        )}

        {/* 3. ACTIVE ARCADE CANVAS GAMEPLAY */}
        {gameState === 'PLAYING' && (
          <GharKiSafaiGame
            stage={currentStageConfig}
            recipientName={recipientName}
            onVictory={handleVictory}
            onGameOver={handleGameOver}
            onQuitToMenu={() => {
              sound.stopBgm()
              setGameState('WELCOME')
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* 4. POST-GAME VICTORY & DIWALI CELEBRATION */}
        {gameState === 'CELEBRATION' && (
          <DiwaliCelebrationModal
            stats={lastGameStats}
            recipientName={recipientName}
            senderName={senderName}
            customMessage={customMessage}
            currentStageId={selectedStage}
            onPlayAgain={() => {
              sound.playDiya()
              setGameState('PLAYING')
              sound.startBgm()
            }}
            onNextStage={handleNextStage}
            onOpenCreateWish={() => setIsCreateModalOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {/* 5. GAME OVER / MUMMY'S SCOLDING SCREEN */}
        {gameState === 'GAMEOVER' && (
          <GameOverModal
            isOpen={true}
            stats={lastGameStats}
            playerName={recipientName}
            reason={gameOverReason}
            onRetry={() => {
              sound.playDiya()
              setGameState('PLAYING')
              sound.startBgm()
            }}
            onMainMenu={() => setGameState('WELCOME')}
          />
        )}
      </div>

      {/* Modals */}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
