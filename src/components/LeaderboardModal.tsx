import { useEffect, useState, type FC } from 'react'
import type { SafaiScore } from '../types/diwali'
import { api } from '../services/api'

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LeaderboardModal: FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState<SafaiScore[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    let ignore = false

    api.diwali
      .getLeaderboard()
      .then((data) => {
        if (!ignore) {
          setScores(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          // Mock preset champions if backend empty
          setScores([
            {
              id: 1,
              playerName: 'Mummy Ki Favorite',
              score: 2450,
              kajuKatlis: 18,
              diyas: 22,
              chappalsDodged: 31,
              rankTitle: '🏆 Supreme Safai Lord & Mithai King',
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              playerName: 'Sharma Ji Ka Beta',
              score: 1890,
              kajuKatlis: 14,
              diyas: 16,
              chappalsDodged: 24,
              rankTitle: "🪔 Mummy Ki Shaan & Chappal Dodger",
              createdAt: new Date().toISOString(),
            },
            {
              id: 3,
              playerName: 'Chappal Dodger 3000',
              score: 1320,
              kajuKatlis: 9,
              diyas: 12,
              chappalsDodged: 19,
              rankTitle: '🧹 Certified Safai Sevak',
              createdAt: new Date().toISOString(),
            },
          ])
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog festive-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-festive-icon">🏆</span>
            <h3>Hall of Safai Champions</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="leaderboard-subtitle">
          The fastest broom-wielders who swept the floor and dodged Mummy's flying chappals!
        </p>

        {isLoading ? (
          <div className="leaderboard-loading">Summoning Champions...</div>
        ) : (
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Sweeper</th>
                  <th>Score</th>
                  <th>🍬 Kaju</th>
                  <th>👡 Dodged</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, index) => {
                  let medal = `#${index + 1}`
                  if (index === 0) medal = '🥇'
                  if (index === 1) medal = '🥈'
                  if (index === 2) medal = '🥉'

                  return (
                    <tr key={s.id || index} className={index < 3 ? 'top-three-row' : ''}>
                      <td className="rank-col">{medal}</td>
                      <td className="player-col">
                        <div className="player-name-text">{s.playerName}</div>
                        <div className="player-title-text">{s.rankTitle}</div>
                      </td>
                      <td className="score-col">{s.score}</td>
                      <td className="stat-col">{s.kajuKatlis}</td>
                      <td className="stat-col">{s.chappalsDodged}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer-close">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Back to Game
          </button>
        </div>
      </div>
    </div>
  )
}
