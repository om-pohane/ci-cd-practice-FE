import { useEffect, useState, type FC } from 'react'
import type { CombatBot } from '../types/bot'
import { api } from '../services/api'
import {
  CpuIcon,
  FlameIcon,
  RefreshIcon,
  SwordsIcon,
  TrophyIcon,
} from '../components/Icons'
import { Link } from '../router/Router'

export const LeaderboardPage: FC = () => {
  const [leaders, setLeaders] = useState<CombatBot[]>([])
  const [loading, setLoading] = useState(true)

  const loadLeaderboard = () => {
    setLoading(true)
    api
      .getLeaderboard()
      .then((data) => {
        setLeaders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    let ignore = false
    api
      .getLeaderboard()
      .then((data) => {
        if (!ignore) {
          setLeaders(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoading(false)
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  const top1 = leaders[0]
  const top2 = leaders[1]
  const top3 = leaders[2]

  return (
    <div className="page-container leaderboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Arena Hall of Fame</h1>
          <p className="page-subtitle">
            The undisputed combat mech champions ranked by arena victories and combat dominance.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadLeaderboard}>
          <RefreshIcon size={14} />
          <span>Refresh Rankings</span>
        </button>
      </div>

      {loading ? (
        <div className="page-container loading-page">
          <div className="spinner" />
          <p>Calculating gladiator rankings...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <TrophyIcon size={36} />
          </div>
          <h3 className="empty-state-title">No Battles Logged Yet</h3>
          <p className="empty-state-desc">
            Deploy fighters into the arena to begin logging championship victories!
          </p>
          <div className="empty-actions" style={{ marginTop: '16px' }}>
            <Link to="/" className="btn btn-primary btn-sm">
              Enter Arena
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Champions Podium */}
          <div className="podium-showcase">
            {/* Rank 2 - Silver */}
            {top2 && (
              <div className="podium-card rank-2">
                <div className="podium-crown silver-crown">🥈 2ND PLACE</div>
                <div
                  className="podium-avatar"
                  style={{ backgroundColor: top2.avatarColor || '#2563eb' }}
                >
                  <CpuIcon size={32} />
                </div>
                <h3 className="podium-name">{top2.name}</h3>
                <span className="podium-stat">{top2.wins} Victories</span>
                <span className="mech-cr-badge">CR {top2.powerRating}</span>
              </div>
            )}

            {/* Rank 1 - Gold */}
            {top1 && (
              <div className="podium-card rank-1">
                <div className="podium-crown gold-crown">👑 CHAMPION</div>
                <div
                  className="podium-avatar avatar-gold"
                  style={{ backgroundColor: top1.avatarColor || '#dc2626' }}
                >
                  <CpuIcon size={42} />
                </div>
                <h2 className="podium-name gold-name">{top1.name}</h2>
                <span className="podium-stat gold-stat">{top1.wins} Victories</span>
                <span className="mech-cr-badge cr-gold">CR {top1.powerRating}</span>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3 && (
              <div className="podium-card rank-3">
                <div className="podium-crown bronze-crown">🥉 3RD PLACE</div>
                <div
                  className="podium-avatar"
                  style={{ backgroundColor: top3.avatarColor || '#d97706' }}
                >
                  <CpuIcon size={28} />
                </div>
                <h3 className="podium-name">{top3.name}</h3>
                <span className="podium-stat">{top3.wins} Victories</span>
                <span className="mech-cr-badge">CR {top3.powerRating}</span>
              </div>
            )}
          </div>

          {/* Leaderboard Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Gladiator Mech</th>
                  <th>Class</th>
                  <th>Weapon System</th>
                  <th>Win Rate</th>
                  <th>Victories</th>
                  <th>Combat Rating</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((bot, idx) => {
                  const total = bot.wins + bot.losses + bot.draws
                  const winRate = total > 0 ? Math.round((bot.wins / total) * 100) : 0

                  return (
                    <tr key={bot.id}>
                      <td>
                        <span className={`rank-number-tag ${idx < 3 ? `rank-${idx + 1}-tag` : ''}`}>
                          #{idx + 1}
                        </span>
                      </td>
                      <td>
                        <div className="student-profile-cell">
                          <div
                            className="avatar-circle"
                            style={{ backgroundColor: bot.avatarColor || '#4f46e5' }}
                          >
                            <CpuIcon size={16} />
                          </div>
                          <span className="student-name">{bot.name}</span>
                        </div>
                      </td>
                      <td><span className="weight-pill">{bot.weightClass}</span></td>
                      <td>
                        <span className="weapon-pill">
                          <FlameIcon size={12} />
                          <span>{bot.weaponType.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td>
                        <span className="winrate-bar-label">{winRate}%</span>
                      </td>
                      <td>
                        <span className="record-badge record-win">{bot.wins} Wins</span>
                      </td>
                      <td>
                        <span className="mech-cr-badge">CR {bot.powerRating}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to="/" className="btn btn-primary btn-sm">
                          <SwordsIcon size={13} />
                          <span>Challenge</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
