import type { FC } from 'react'
import type { StageId } from '../types/diwali'
import { STAGES, STAGE_ORDER } from '../game/stages'

interface WelcomeScreenProps {
  playerName: string
  senderName: string
  selectedStage: StageId
  onSelectStage: (stage: StageId) => void
  onOpenNamePrompt: () => void
  onStartGame: () => void
  onOpenLeaderboard: () => void
  onOpenCreateWish: () => void
  onOpenSettings: () => void
}

export const WelcomeScreen: FC<WelcomeScreenProps> = ({
  playerName,
  senderName,
  selectedStage,
  onSelectStage,
  onOpenNamePrompt,
  onStartGame,
  onOpenLeaderboard,
  onOpenCreateWish,
  onOpenSettings,
}) => {
  const currentStageConfig = STAGES[selectedStage]

  return (
    <div className="welcome-screen-container">
      {/* Player Identity Pill */}
      <div className="welcome-identity-bar">
        <div className="identity-badge-left">
          <span className="identity-icon">👤</span>
          <div className="identity-meta">
            <span className="identity-title">PLAYER:</span>
            <strong className="identity-val">{playerName || 'Tap to set name'}</strong>
          </div>
        </div>
        <button
          type="button"
          className="btn-change-identity"
          onClick={onOpenNamePrompt}
        >
          ✏️ Change Name
        </button>
      </div>

      {/* Mummy's Direct Order Callout */}
      <div className="welcome-mummy-alert">
        <span className="mummy-bell-icon">🚨</span>
        <div className="mummy-alert-content">
          <h4 className="mummy-alert-heading">
            MUMMY'S ORDER FOR {playerName ? playerName.toUpperCase() : 'YOU'}!
          </h4>
          <p className="mummy-alert-sub">
            "Pehle ghar ki safai poori karo, warna Diwali puja me no Kaju Katli!"
          </p>
          <span className="mummy-sender-tag">— Sent with love by {senderName}</span>
        </div>
      </div>

      {/* Hero Game Logo & Subtitle */}
      <div className="welcome-hero-header">
        <div className="hero-floating-diyas">
          <span className="hero-diya-flame">🪔</span>
          <span className="hero-sparkle-star">✨</span>
          <span className="hero-kandil">🏮</span>
        </div>
        <h1 className="hero-arcade-title">GHAR KI SAFAI</h1>
        <h2 className="hero-arcade-subtitle">SURVIVAL MODE</h2>
        <p className="hero-tagline">The Ultimate Diwali Cleaning Challenge 🧹✨</p>
      </div>

      {/* Room Selection Carousel / Grid */}
      <div className="stage-selection-box">
        <span className="stage-section-title">SELECT CLEANING ROOM:</span>
        <div className="stage-cards-row">
          {STAGE_ORDER.map((stageId) => {
            const st = STAGES[stageId]
            const isSelected = selectedStage === stageId
            return (
              <button
                type="button"
                key={stageId}
                className={`stage-select-card ${isSelected ? 'stage-card-active' : ''}`}
                onClick={() => onSelectStage(stageId)}
              >
                <span className="stage-card-icon">{st.roomIcon}</span>
                <span className="stage-card-name">{st.name}</span>
                <span className="stage-card-target">Target: {st.targetScore} pts</span>
              </button>
            )
          })}
        </div>
        <div className="stage-desc-preview">
          <span>{currentStageConfig.description}</span>
        </div>
      </div>

      {/* Rules & Items Quick Legend Grid */}
      <div className="welcome-rules-grid">
        <div className="rule-item rule-collect">
          <span className="rule-emoji">🧹</span>
          <div className="rule-info">
            <strong>Dust &amp; Webs</strong>
            <span>+30 pts</span>
          </div>
        </div>

        <div className="rule-item rule-collect">
          <span className="rule-emoji">🪙</span>
          <div className="rule-info">
            <strong>Laxmi Coin</strong>
            <span>+150 pts</span>
          </div>
        </div>

        <div className="rule-item rule-collect">
          <span className="rule-emoji">🍬</span>
          <div className="rule-info">
            <strong>Kaju Katli</strong>
            <span>+100 pts + SPEED</span>
          </div>
        </div>

        <div className="rule-item rule-collect">
          <span className="rule-emoji">🪔</span>
          <div className="rule-info">
            <strong>Sacred Diya</strong>
            <span>+60 pts (Lights Diya)</span>
          </div>
        </div>

        <div className="rule-item rule-hazard">
          <span className="rule-emoji">👡</span>
          <div className="rule-info">
            <strong>Mummy's Chappal</strong>
            <span>-1 ❤️ (DODGE!)</span>
          </div>
        </div>

        <div className="rule-item rule-hazard">
          <span className="rule-emoji">📦</span>
          <div className="rule-info">
            <strong>Soan Papdi</strong>
            <span>Sticky Slowdown!</span>
          </div>
        </div>

        <div className="rule-item rule-hazard">
          <span className="rule-emoji">👨‍💼</span>
          <div className="rule-info">
            <strong>Sharma Ji Ka Beta</strong>
            <span>-1 ❤️ (99% CBSE Flex)</span>
          </div>
        </div>
      </div>

      {/* Controls Quick Hint */}
      <div className="welcome-controls-hint">
        <span className="controls-icon">🎮</span>
        <span>
          <strong>Mobile:</strong> Swipe/drag finger on floor or tap on-screen paddles. <br />
          <strong>Desktop:</strong> Arrow keys (← / →) or A / D. Press <strong>Space</strong> to pause.
        </span>
      </div>

      {/* Giant Start Button */}
      <button
        type="button"
        className="btn-start-arcade"
        onClick={onStartGame}
      >
        <span className="btn-icon">🧹</span>
        <span className="btn-text">START SAFAI MISSION</span>
      </button>

      {/* Footer Navigation Buttons */}
      <div className="welcome-footer-nav">
        <button
          type="button"
          className="btn-welcome-secondary"
          onClick={onOpenLeaderboard}
        >
          🏆 Hall of Fame
        </button>

        <button
          type="button"
          className="btn-welcome-secondary"
          onClick={onOpenCreateWish}
        >
          ✍️ Challenge a Friend
        </button>

        <button
          type="button"
          className="btn-welcome-secondary"
          onClick={onOpenSettings}
        >
          ⚙️ Settings &amp; Audio
        </button>
      </div>
    </div>
  )
}
