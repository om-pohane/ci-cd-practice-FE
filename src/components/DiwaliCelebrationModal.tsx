import { useState, type FC } from 'react'
import { sound } from '../utils/sound'
import { FireworksCanvas } from './FireworksCanvas'

interface DiwaliCelebrationModalProps {
  score: number
  kajuKatlis: number
  diyas: number
  chappalsDodged: number
  recipientName: string
  senderName: string
  customMessage?: string
  onPlayAgain: () => void
  onOpenCreateWish: () => void
  onOpenLeaderboard: () => void
}

export const DiwaliCelebrationModal: FC<DiwaliCelebrationModalProps> = ({
  score,
  kajuKatlis,
  diyas,
  chappalsDodged,
  recipientName,
  senderName,
  customMessage,
  onPlayAgain,
  onOpenCreateWish,
  onOpenLeaderboard,
}) => {
  const [litDiyas, setLitDiyas] = useState<boolean[]>([true, false, false, false, false])
  const [copiedLink, setCopiedLink] = useState(false)

  // Rank Title
  let rankTitle = '📦 Soan Papdi Collector'
  if (score >= 1500) {
    rankTitle = '🏆 Supreme Safai Lord & Mithai King'
  } else if (score >= 1000) {
    rankTitle = "🪔 Mummy Ki Shaan & Chappal Dodger"
  } else if (score >= 500) {
    rankTitle = '🧹 Certified Safai Sevak'
  }

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

  const shareText = `🪔 I scored ${score} pts in Ghar Ki Safai: Survival Mode and survived Mummy's flying chappal! Check ${senderName}'s Diwali surprise for me and try beating my score: ${currentUrl}`

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <div className="celebration-overlay">
      {/* Background Interactive Fireworks */}
      <FireworksCanvas interactive={true} />

      <div className="celebration-card-wrapper">
        <div className="celebration-card">
          {/* Header Marigold Garland */}
          <div className="card-garland">
            <span>🌼</span>
            <span>🌸</span>
            <span>🪔</span>
            <span>SHUBH DEEPAVALI</span>
            <span>🪔</span>
            <span>🌸</span>
            <span>🌼</span>
          </div>

          {/* Achievement Title */}
          <div className="rank-badge-wrap">
            <span className="rank-award-title">{rankTitle}</span>
            <span className="rank-score-highlight">{score} POINTS</span>
          </div>

          {/* Stats Bar */}
          <div className="celebration-stats-grid">
            <div className="mini-stat-box">
              <span className="mini-stat-icon">🍬</span>
              <span className="mini-stat-val">{kajuKatlis}</span>
              <span className="mini-stat-lbl">Kaju Katlis</span>
            </div>
            <div className="mini-stat-box">
              <span className="mini-stat-icon">🪔</span>
              <span className="mini-stat-val">{diyas}</span>
              <span className="mini-stat-lbl">Diyas Lit</span>
            </div>
            <div className="mini-stat-box">
              <span className="mini-stat-icon">👡</span>
              <span className="mini-stat-val">{chappalsDodged}</span>
              <span className="mini-stat-lbl">Chappals Dodged</span>
            </div>
          </div>

          {/* Personalized Diwali Message Letter */}
          <div className="personal-letter-box">
            <h2 className="letter-greeting">
              Happy Diwali, {recipientName || 'My Dear Friend'}! ✨
            </h2>
            <p className="letter-body">
              {customMessage ||
                `May this festival of lights bring you and your family abundant happiness, glowing health, boundless prosperity, and endless Kaju Katli — with ZERO flying chappals! Enjoy the holidays to the fullest!`}
            </p>
            <div className="letter-signature">
              <span>Warmest Wishes,</span>
              <strong>— {senderName || 'Om'}</strong>
            </div>
          </div>

          {/* Interactive Diya Lighting Ceremony */}
          <div className="diya-ceremony-section">
            <h4 className="ceremony-title">🪔 Light 5 Sacred Diyas of Prosperity</h4>
            <div className="diyas-row">
              {litDiyas.map((isLit, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={`diya-btn ${isLit ? 'diya-lit' : 'diya-unlit'}`}
                  onClick={() => handleLightDiya(idx)}
                  title={isLit ? 'Diya is glowing' : 'Tap to light diya'}
                >
                  <span className="diya-flame">{isLit ? '🔥' : '⚪'}</span>
                  <span className="diya-clay">🪔</span>
                </button>
              ))}
            </div>
            <p className="ceremony-hint">
              {litDiyas.every(Boolean)
                ? '✨ All Diyas Lit! Auspicious blessings unlocked! ✨'
                : 'Tap unlit diyas above to ignite the festive flames!'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="celebration-action-buttons">
            <button
              type="button"
              className="action-btn btn-whatsapp"
              onClick={handleWhatsAppShare}
            >
              <span>📲 Share on WhatsApp</span>
            </button>

            <button
              type="button"
              className="action-btn btn-play-again"
              onClick={onPlayAgain}
            >
              <span>🔁 Play Again</span>
            </button>
          </div>

          <div className="secondary-action-row">
            <button
              type="button"
              className="action-btn btn-secondary"
              onClick={onOpenCreateWish}
            >
              <span>✍️ Create Your Own Wish Link</span>
            </button>

            <button
              type="button"
              className="action-btn btn-secondary"
              onClick={onOpenLeaderboard}
            >
              <span>🏆 Hall of Fame</span>
            </button>

            <button
              type="button"
              className="action-btn btn-secondary"
              onClick={handleCopyLink}
            >
              <span>{copiedLink ? '✓ Link Copied!' : '🔗 Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
