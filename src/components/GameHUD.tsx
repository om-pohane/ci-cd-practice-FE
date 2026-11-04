import type { FC } from 'react'
import type { AngerLevel, StageConfig } from '../types/diwali'

interface GameHUDProps {
  score: number
  combo: number
  lives: number
  timeLeft: number
  cleanlinessPercent: number
  anger: number // 0 to 100
  angerLevel: AngerLevel
  angerWarning: string
  diyasCollected: number
  isSpeedBoost: boolean
  speedBoostTimeLeft: number
  isSlowed: boolean
  stage: StageConfig
  onPause: () => void
}

export const GameHUD: FC<GameHUDProps> = ({
  score,
  combo,
  lives,
  timeLeft,
  cleanlinessPercent,
  anger,
  angerLevel,
  angerWarning,
  diyasCollected,
  isSpeedBoost,
  speedBoostTimeLeft,
  isSlowed,
  stage,
  onPause,
}) => {
  // Mummy Face Icon based on Anger Level
  let mummyEmoji = '👩'
  let angerColor = '#30d158'
  if (angerLevel === 'SUSPICIOUS') {
    mummyEmoji = '🤨'
    angerColor = '#ffd60a'
  } else if (angerLevel === 'ANGRY') {
    mummyEmoji = '😠'
    angerColor = '#ff9f0a'
  } else if (angerLevel === 'RAGE') {
    mummyEmoji = '😡'
    angerColor = '#ff453a'
  }

  return (
    <div className="game-hud-container">
      {/* Top Arcade Row */}
      <div className="hud-top-bar">
        {/* Lives */}
        <div className="hud-cell hud-cell-lives">
          <span className="hud-cell-title">LIVES</span>
          <div className="pixel-hearts">
            {[1, 2, 3].map((heart) => (
              <span
                key={heart}
                className={`pixel-heart ${heart <= lives ? 'heart-alive' : 'heart-lost'}`}
              >
                {heart <= lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>

        {/* Score & Combo */}
        <div className="hud-cell hud-cell-score">
          <span className="hud-cell-title">SAFAI SCORE</span>
          <div className="score-display">
            <span className="score-number">{score}</span>
            {combo > 1 && <span className="combo-badge">x{combo} COMBO!</span>}
          </div>
        </div>

        {/* Current Room / Stage */}
        <div className="hud-cell hud-cell-stage">
          <span className="hud-cell-title">STAGE</span>
          <span className="stage-name-pill">
            {stage.roomIcon} {stage.name}
          </span>
        </div>

        {/* Puja Timer & Pause */}
        <div className="hud-cell hud-cell-timer">
          <span className="hud-cell-title">PUJA TIME</span>
          <div className="timer-controls">
            <span className={`timer-digits ${timeLeft <= 10 ? 'timer-emergency' : ''}`}>
              {timeLeft}s
            </span>
            <button
              type="button"
              className="btn-hud-pause"
              onClick={onPause}
              title="Pause Game (Spacebar)"
            >
              ⏸️
            </button>
          </div>
        </div>
      </div>

      {/* Cleanliness Progress Meter Bar */}
      <div className="hud-meter-row">
        <div className="cleanliness-meter-bar">
          <div className="meter-header">
            <span className="meter-title">🧹 GHAR KI SAFAI PROGRESS</span>
            <span className="meter-percentage">{Math.min(100, cleanlinessPercent)}%</span>
          </div>
          <div className="meter-track">
            <div
              className="meter-fill-bar"
              style={{
                width: `${Math.min(100, cleanlinessPercent)}%`,
                background: cleanlinessPercent >= 100 ? '#30d158' : 'linear-gradient(90deg, #ff9900, #ffd700)',
              }}
            />
          </div>
        </div>

        {/* Sacred Diyas Collected Meter (0/5) */}
        <div className="diya-collection-meter">
          <span className="diya-meter-title">🪔 DIYAS:</span>
          <div className="mini-diyas-rack">
            {[1, 2, 3, 4, 5].map((d) => (
              <span
                key={d}
                className={`mini-diya-slot ${d <= (diyasCollected % 5 || (diyasCollected > 0 ? 5 : 0)) ? 'diya-active' : 'diya-empty'}`}
              >
                🪔
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Mummy Anger Meter Banner */}
      <div className={`mummy-anger-strip anger-${angerLevel.toLowerCase()}`}>
        <div className="anger-left">
          <span className="mummy-face-icon">{mummyEmoji}</span>
          <div className="anger-info">
            <div className="anger-label-row">
              <strong className="anger-status">MUMMY'S ANGER: {Math.round(anger)}%</strong>
              <span className="anger-speech">"{angerWarning}"</span>
            </div>
            <div className="anger-bar-track">
              <div
                className="anger-bar-fill"
                style={{
                  width: `${Math.min(100, anger)}%`,
                  backgroundColor: angerColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Boost / Penalty Status Ribbons */}
      <div className="active-buffs-strip">
        {isSpeedBoost && (
          <div className="buff-badge buff-kaju">
            <span>🍬 KAJU RUSH (2x SPEED)!</span>
            <div className="buff-timer-bar">
              <div
                className="buff-fill"
                style={{ width: `${(speedBoostTimeLeft / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {isSlowed && (
          <div className="buff-badge buff-soan">
            <span>📦 Re-Gifted Soan Papdi: Sticky Slowdown!</span>
          </div>
        )}
      </div>
    </div>
  )
}
