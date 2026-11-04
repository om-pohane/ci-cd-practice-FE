import { useState, type FC } from 'react'
import type { GameStats, StageId } from '../types/diwali'
import { sound } from '../utils/sound'
import { FireworksCanvas } from './FireworksCanvas'
import { STAGE_ORDER, STAGES } from '../game/stages'

interface DiwaliCelebrationModalProps {
  stats: GameStats
  recipientName: string
  senderName: string
  customMessage?: string
  currentStageId: StageId
  onPlayAgain: () => void
  onNextStage?: (nextStage: StageId) => void
  onOpenCreateWish: () => void
  onOpenLeaderboard: () => void
}

export const DiwaliCelebrationModal: FC<DiwaliCelebrationModalProps> = ({
  stats,
  recipientName,
  senderName,
  customMessage,
  currentStageId,
  onPlayAgain,
  onNextStage,
  onOpenCreateWish,
  onOpenLeaderboard,
}) => {
  const [litDiyas, setLitDiyas] = useState<boolean[]>([true, false, false, false, false])
  const [copiedLink, setCopiedLink] = useState(false)

  // Calculate dynamic personalized achievement title
  let achievementTitle = '👑 Safai Samrat'
  if (stats.cleanlinessPercent >= 100 && stats.livesRemaining === 3) {
    achievementTitle = '✨ Ghar Ka Superstar & Zero Dust Champion'
  } else if (stats.chappalsDodged >= 8) {
    achievementTitle = "👡 Supreme Chappal Dodger & Mummy's Pride"
  } else if (stats.score >= 2000) {
    achievementTitle = '🏆 Safai Samrat & Mithai King'
  } else if (stats.score >= 1200) {
    achievementTitle = '🪔 Mummy Approved Safai Specialist'
  }

  // Next stage check
  const currentIdx = STAGE_ORDER.indexOf(currentStageId)
  const hasNextStage = currentIdx >= 0 && currentIdx < STAGE_ORDER.length - 1
  const nextStageId = hasNextStage ? STAGE_ORDER[currentIdx + 1] : null
  const nextStageConfig = nextStageId ? STAGES[nextStageId] : null

  const handleLightDiya = (index: number) => {
    if (!litDiyas[index]) {
      sound.playDiya()
      const next = [...litDiyas]
      next[index] = true
      setLitDiyas(next)
      if (next.every(Boolean)) {
        sound.playVictoryFanfare()
      }
    }
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `🪔 I scored ${stats.score} pts in "Ghar Ki Safai: Survival Mode", cleared ${stats.dustCleared} dust bunnies, and dodged Mummy's flying chappal! Can you beat my score before Diwali Puja? Check it out here: ${currentUrl}`

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2200)
    }
  }

  return (
    <div className="celebration-overlay">
      {/* Background Interactive Fireworks Canvas */}
      <FireworksCanvas interactive={true} />

      <div className="celebration-card-wrapper">
        <div className="celebration-card">
          {/* Header Marigold Garland */}
          <div className="card-garland">
            <span>🌼</span>
            <span>🌸</span>
            <span>🏮</span>
            <span className="garland-diya-center">🪔 SHUBH DEEPAVALI 🪔</span>
            <span>🏮</span>
            <span>🌸</span>
            <span>🌼</span>
          </div>

          {/* Achievement Award Title */}
          <div className="rank-badge-wrap">
            <span className="rank-award-title">{achievementTitle}</span>
            <div className="score-and-cleanliness-row">
              <span className="rank-score-highlight">{stats.score} POINTS</span>
              <span className="cleanliness-pill-badge">{stats.cleanlinessPercent}% CLEAN</span>
            </div>
          </div>

          {/* Complete Detailed Scorecard Grid */}
          <div className="scorecard-master-grid">
            <div className="scorecard-metric-card">
              <span className="metric-icon">🧹</span>
              <strong className="metric-num">{stats.dustCleared}</strong>
              <span className="metric-text">Dust Swept</span>
            </div>

            <div className="scorecard-metric-card">
              <span className="metric-icon">🪙</span>
              <strong className="metric-num">{stats.coinsCollected}</strong>
              <span className="metric-text">Laxmi Coins</span>
            </div>

            <div className="scorecard-metric-card">
              <span className="metric-icon">🍬</span>
              <strong className="metric-num">{stats.sweetsCollected}</strong>
              <span className="metric-text">Kaju Katlis</span>
            </div>

            <div className="scorecard-metric-card">
              <span className="metric-icon">🪔</span>
              <strong className="metric-num">{stats.diyasCollected}</strong>
              <span className="metric-text">Diyas Lit</span>
            </div>

            <div className="scorecard-metric-card">
              <span className="metric-icon">👡</span>
              <strong className="metric-num">{stats.chappalsDodged}</strong>
              <span className="metric-text">Chappals Dodged</span>
            </div>

            <div className="scorecard-metric-card">
              <span className="metric-icon">❤️</span>
              <strong className="metric-num">{stats.livesRemaining}/3</strong>
              <span className="metric-text">Lives Left</span>
            </div>
          </div>

          {/* Personalized Diwali Blessing Letter */}
          <div className="personal-letter-box">
            <div className="letter-header-row">
              <span className="letter-lamps">🪔✨</span>
              <h2 className="letter-greeting">
                Shubh Deepavali, {recipientName || 'Dear Friend'}!
              </h2>
              <span className="letter-lamps">✨🪔</span>
            </div>
            <p className="letter-body">
              {customMessage ||
                `May the sacred light of this Diwali fill your days with peace, vibrant good health, golden wealth, and endless boxes of Kaju Katli — without a single flying chappal from Mummy! Wishing you and your whole family an unforgettable celebration!`}
            </p>
            <div className="letter-signature">
              <span>Warmest Festive Wishes,</span>
              <strong>— {senderName || 'Your Friend'}</strong>
            </div>
          </div>

          {/* Interactive Five-Diya Ceremony */}
          <div className="diya-ceremony-section">
            <h4 className="ceremony-title">🪔 Sacred Five-Diya Puja Ceremony</h4>
            <p className="ceremony-subtitle">
              Tap each diya below to ignite the 5 divine flames of Health, Wealth, Joy, Wisdom &amp; Love!
            </p>
            <div className="diyas-row">
              {litDiyas.map((isLit, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`diya-btn ${isLit ? 'diya-lit' : 'diya-unlit'}`}
                  onClick={() => handleLightDiya(idx)}
                  title={isLit ? 'Diya is radiant' : 'Tap to light diya'}
                >
                  <span className="diya-flame">{isLit ? '🔥' : '⚪'}</span>
                  <span className="diya-clay">🪔</span>
                  <span className="diya-number-tag">#{idx + 1}</span>
                </button>
              ))}
            </div>

            <div className="ceremony-status-msg">
              {litDiyas.every(Boolean) ? (
                <span className="blessing-unlocked">
                  ✨ All 5 Sacred Diyas Are Burning Bright! Happy Diwali! ✨
                </span>
              ) : (
                <span className="blessing-pending">
                  👆 Tap the unlit diyas above to complete the puja ritual!
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: Next Stage / Play Again */}
          <div className="celebration-actions-row">
            {hasNextStage && nextStageConfig && onNextStage ? (
              <button
                type="button"
                className="btn-next-stage"
                onClick={() => onNextStage(nextStageConfig.id)}
              >
                <span>CLEAN NEXT ROOM: {nextStageConfig.hindiName} ▶</span>
              </button>
            ) : null}

            <button
              type="button"
              className="btn-play-again"
              onClick={onPlayAgain}
            >
              <span>🔄 PLAY THIS ROOM AGAIN</span>
            </button>
          </div>

          {/* Sharing Buttons: WhatsApp & Copy Link */}
          <div className="share-actions-group">
            <button
              type="button"
              className="btn-whatsapp-share"
              onClick={handleWhatsAppShare}
            >
              <span>💬 SHARE SCORE ON WHATSAPP</span>
            </button>

            <button
              type="button"
              className="btn-copy-challenge-link"
              onClick={handleCopyLink}
            >
              <span>{copiedLink ? '✓ LINK COPIED TO CLIPBOARD!' : '🔗 COPY CHALLENGE LINK'}</span>
            </button>
          </div>

          {/* Footer Navigation */}
          <div className="celebration-footer-row">
            <button
              type="button"
              className="btn-footer-secondary"
              onClick={onOpenLeaderboard}
            >
              🏆 View Hall of Fame
            </button>

            <button
              type="button"
              className="btn-footer-secondary"
              onClick={onOpenCreateWish}
            >
              ✍️ Create Custom Wish for a Friend
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
