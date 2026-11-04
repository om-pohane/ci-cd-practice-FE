import type { FC } from 'react'
import type { GameStats } from '../types/diwali'
import { sound } from '../utils/sound'

interface GameOverModalProps {
  isOpen: boolean
  stats: GameStats
  playerName: string
  reason: 'LIVES_LOST' | 'TIME_OUT'
  onRetry: () => void
  onMainMenu: () => void
}

export const GameOverModal: FC<GameOverModalProps> = ({
  isOpen,
  stats,
  playerName,
  reason,
  onRetry,
  onMainMenu,
}) => {
  if (!isOpen) return null

  const handleRetry = () => {
    sound.playDiya()
    onRetry()
  }

  return (
    <div className="gameover-overlay">
      <div className="gameover-modal-card">
        {/* Header alert */}
        <div className="gameover-header-badge">
          <span>{reason === 'LIVES_LOST' ? '💥 CHAPPAL STRIKE!' : '⏰ PUJA MUHURAT MISSED!'}</span>
        </div>

        {/* Mummy Reaction */}
        <div className="gameover-mummy-box">
          <span className="gameover-mummy-emoji">👩‍🦳💢</span>
          <div className="gameover-mummy-dialogue">
            <h3 className="gameover-mummy-title">
              "Kya {playerName || 'Beta'}! Ek kaam dhang se nahi hua!"
            </h3>
            <p className="gameover-mummy-quote">
              {reason === 'LIVES_LOST'
                ? '"Mummy ki flying chappal se bach nahi paye! Sharma ji ke bete ko dekho, 100% safai kar li usne!"'
                : '"Pandit ji puja ke liye aa gaye aur drawing room me abhi bhi dhool hai! Chalo, utho aur phirse jhadu lagao!"'}
            </p>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="gameover-stats-grid">
          <div className="go-stat-pill">
            <span className="go-stat-lbl">FINAL SCORE</span>
            <strong className="go-stat-val">{stats.score}</strong>
          </div>
          <div className="go-stat-pill">
            <span className="go-stat-lbl">CLEANLINESS</span>
            <strong className="go-stat-val">{stats.cleanlinessPercent}%</strong>
          </div>
          <div className="go-stat-pill">
            <span className="go-stat-lbl">DUST SWEPT</span>
            <strong className="go-stat-val">{stats.dustCleared}</strong>
          </div>
          <div className="go-stat-pill">
            <span className="go-stat-lbl">CHAPPALS DODGED</span>
            <strong className="go-stat-val">{stats.chappalsDodged}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="gameover-actions">
          <button
            type="button"
            className="btn-go-retry"
            onClick={handleRetry}
          >
            <span className="btn-icon">🧹</span>
            <span>RETRY ROOM (MAKE MUMMY PROUD!)</span>
          </button>

          <button
            type="button"
            className="btn-go-menu"
            onClick={onMainMenu}
          >
            🏠 BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  )
}
