import { useEffect, useState, type FC } from 'react'
import type { StageConfig } from '../types/diwali'
import { sound } from '../utils/sound'

interface MummyBriefingModalProps {
  isOpen: boolean
  stage: StageConfig
  playerName: string
  senderName: string
  onStart: () => void
}

export const MummyBriefingModal: FC<MummyBriefingModalProps> = ({
  isOpen,
  stage,
  playerName,
  senderName,
  onStart,
}) => {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  if (!isOpen) return null

  const handleStartNow = () => {
    sound.playDiya()
    onStart()
  }

  return (
    <div className="briefing-overlay">
      <div className="briefing-card">
        {/* Top Header Tag */}
        <div className="briefing-badge">
          <span>🚨 URGENT MUMMY ORDER • {stage.hindiName}</span>
        </div>

        {/* Mummy Animated Avatar & Speech */}
        <div className="mummy-speech-container">
          <div className="mummy-avatar-large">
            <span className="mummy-emoji-head">👩‍👧‍👦</span>
            <span className="mummy-warning-sparkle">💢</span>
          </div>

          <div className="mummy-speech-bubble">
            <h3 className="mummy-greeting">
              "Sunno, {playerName ? playerName.toUpperCase() : 'BETA'}!"
            </h3>
            <p className="mummy-dialogue-text">"{stage.mummyBriefing}"</p>
            <div className="briefing-sender-credit">
              — Sent with Diwali love by <strong>{senderName || 'Your Friend'}</strong>
            </div>
          </div>
        </div>

        {/* Mission Objectives & Targets */}
        <div className="mission-target-banner">
          <div className="target-col">
            <span className="target-label">ROOM TARGET</span>
            <strong className="target-value">{stage.targetScore} PTS</strong>
          </div>
          <div className="target-col">
            <span className="target-label">TIME LIMIT</span>
            <strong className="target-value">{stage.timeLimit} SECONDS</strong>
          </div>
          <div className="target-col">
            <span className="target-label">LIVES</span>
            <strong className="target-value">3 ❤️</strong>
          </div>
        </div>

        {/* Quick Rules Legend */}
        <div className="briefing-rules-grid">
          <div className="briefing-rule-pill pill-sweep">
            <span className="rule-icon">🧹</span>
            <span>Sweep Dust &amp; Webs</span>
          </div>
          <div className="briefing-rule-pill pill-kaju">
            <span className="rule-icon">🍬</span>
            <span>Eat Kaju Katli for Speed</span>
          </div>
          <div className="briefing-rule-pill pill-diya">
            <span className="rule-icon">🪔</span>
            <span>Light Sacred Diyas</span>
          </div>
          <div className="briefing-rule-pill pill-chappal">
            <span className="rule-icon">👡</span>
            <span>DODGE MUMMY'S CHAPPAL!</span>
          </div>
          <div className="briefing-rule-pill pill-sharma">
            <span className="rule-icon">👨‍💼</span>
            <span>EVADE SHARMA JI KA BETA!</span>
          </div>
          <div className="briefing-rule-pill pill-soan">
            <span className="rule-icon">📦</span>
            <span>Avoid Re-Gifted Soan Papdi</span>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="briefing-actions">
          <button
            type="button"
            className="btn-start-briefing-now"
            onClick={handleStartNow}
          >
            <span className="btn-icon">🧹</span>
            <span>PICK UP JHADU &amp; START! {countdown > 0 ? `(${countdown}s)` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
