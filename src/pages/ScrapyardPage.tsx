import { useState, type FC, useMemo } from 'react'
import type { CombatBot } from '../types/bot'
import {
  CpuIcon,
  RefreshIcon,
  SearchIcon,
  SkullIcon,
  WrenchIcon,
} from '../components/Icons'
import { Link } from '../router/Router'

interface ScrapyardPageProps {
  scrappedBots: CombatBot[]
  onRepairBot: (bot: CombatBot) => Promise<void>
  onRefresh: () => void
}

export const ScrapyardPage: FC<ScrapyardPageProps> = ({
  scrappedBots,
  onRepairBot,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [repairingId, setRepairingId] = useState<number | null>(null)
  const [isRepairingAll, setIsRepairingAll] = useState(false)

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return scrappedBots
    const q = searchQuery.toLowerCase().trim()
    return scrappedBots.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.weaponType.toLowerCase().includes(q) ||
        b.id.toString() === q,
    )
  }, [scrappedBots, searchQuery])

  const handleRepair = async (bot: CombatBot) => {
    setRepairingId(bot.id)
    try {
      await onRepairBot(bot)
    } finally {
      setRepairingId(null)
    }
  }

  const handleRepairAll = async () => {
    if (scrappedBots.length === 0) return
    setIsRepairingAll(true)
    try {
      for (const b of scrappedBots) {
        await onRepairBot(b)
      }
    } finally {
      setIsRepairingAll(false)
    }
  }

  return (
    <div className="page-container scrapyard-page">
      <div className="page-header">
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">The Scrapyard &amp; Graveyard</h1>
            <span className="badge badge-danger">{scrappedBots.length} Destroyed</span>
          </div>
          <p className="page-subtitle">
            Mechs decommissioned or blown to pieces in the arena. Initiate nano-repairs to resurrect them into the active hangar!
          </p>
        </div>

        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
            <RefreshIcon size={14} />
            <span>Refresh Yard</span>
          </button>
          {scrappedBots.length > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleRepairAll}
              disabled={isRepairingAll}
            >
              <WrenchIcon size={14} />
              <span>{isRepairingAll ? 'Repairing All...' : 'Rebuild All Mechs'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="filter-row">
          <div className="search-input-wrap">
            <SearchIcon size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search scrap heap by codename or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <SkullIcon size={36} />
          </div>
          <h3 className="empty-state-title">The Scrapyard is Clean</h3>
          <p className="empty-state-desc">
            No dismantled mechs found. When mechs are scrapped, their remains are stored here for nano-reconstruction.
          </p>
          <div className="empty-actions" style={{ marginTop: '16px' }}>
            <Link to="/hangar" className="btn btn-primary btn-sm">
              View Active Hangar
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Scrapped Mech</th>
                <th>Class</th>
                <th>Weapon System</th>
                <th>Record</th>
                <th>Status</th>
                <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bot) => (
                <tr key={bot.id} className="row-scrapped">
                  <td><span className="id-badge">#{bot.id}</span></td>
                  <td>
                    <div className="student-profile-cell">
                      <div
                        className="avatar-circle"
                        style={{ backgroundColor: bot.avatarColor || '#64748b' }}
                      >
                        <CpuIcon size={16} />
                      </div>
                      <span className="student-name">{bot.name}</span>
                    </div>
                  </td>
                  <td><span className="weight-pill">{bot.weightClass}</span></td>
                  <td><span className="weapon-pill">{bot.weaponType.replace('_', ' ')}</span></td>
                  <td>
                    <span className="record-badge record-loss">
                      {bot.wins}W - {bot.losses}L
                    </span>
                  </td>
                  <td>
                    <span className="status-tag status-tag-deleted">SCRAPPED</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary btn-sm btn-repair"
                      onClick={() => handleRepair(bot)}
                      disabled={repairingId === bot.id || isRepairingAll}
                      title="Rebuild & restore to active hangar"
                    >
                      <WrenchIcon size={14} />
                      <span>{repairingId === bot.id ? 'Rebuilding...' : 'Rebuild Mech'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
