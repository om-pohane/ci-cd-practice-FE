import { useState, type FC, useMemo } from 'react'
import type { CombatBot } from '../types/bot'
import {
  CpuIcon,
  FlameIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  SkullIcon,
  SparklesIcon,
  SwordsIcon,
  TargetIcon,
  WrenchIcon,
  ZapIcon,
} from '../components/Icons'
import { Link } from '../router/Router'

interface MechHangarPageProps {
  bots: CombatBot[]
  onScrapBot: (bot: CombatBot) => Promise<void>
  onSeedBots: () => Promise<void>
}

export const MechHangarPage: FC<MechHangarPageProps> = ({
  bots,
  onScrapBot,
  onSeedBots,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWeight, setSelectedWeight] = useState<string>('ALL')
  const [selectedWeapon, setSelectedWeapon] = useState<string>('ALL')
  const [isSeeding, setIsSeeding] = useState(false)

  const filteredBots = useMemo(() => {
    return bots.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        b.id.toString() === searchQuery.trim()

      const matchWeight = selectedWeight === 'ALL' || b.weightClass === selectedWeight
      const matchWeapon = selectedWeapon === 'ALL' || b.weaponType === selectedWeapon

      return matchSearch && matchWeight && matchWeapon
    })
  }, [bots, searchQuery, selectedWeight, selectedWeapon])

  const handleSeed = async () => {
    setIsSeeding(true)
    try {
      await onSeedBots()
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="page-container hangar-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mech Hangar &amp; Roster</h1>
          <p className="page-subtitle">
            Manage your battle mechs, inspect combat ratings, and deploy gladiators to the arena.
          </p>
        </div>

        <div className="hangar-header-actions">
          {bots.length === 0 && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSeed}
              disabled={isSeeding}
            >
              <SparklesIcon size={14} />
              <span>{isSeeding ? 'Summoning...' : 'Summon Champions'}</span>
            </button>
          )}

          <Link to="/forge" className="btn btn-primary btn-sm">
            <PlusIcon size={15} />
            <span>Forge New Mech</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="filter-row">
          <div className="search-input-wrap">
            <SearchIcon size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search mechs by codename or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={selectedWeight}
              onChange={(e) => setSelectedWeight(e.target.value)}
            >
              <option value="ALL">All Weight Classes</option>
              <option value="LIGHTWEIGHT">Lightweight</option>
              <option value="MIDDLEWEIGHT">Middleweight</option>
              <option value="HEAVYWEIGHT">Heavyweight</option>
              <option value="TITAN">Titan</option>
            </select>
          </div>

          <div className="filter-select-wrap">
            <select
              className="filter-select"
              value={selectedWeapon}
              onChange={(e) => setSelectedWeapon(e.target.value)}
            >
              <option value="ALL">All Weapon Systems</option>
              <option value="PLASMA_SAW">Plasma Saw</option>
              <option value="TESLA_COIL">Tesla Coil</option>
              <option value="HYDRAULIC_CRUSHER">Hydraulic Crusher</option>
              <option value="FLAMETHROWER">Flamethrower</option>
              <option value="RAILGUN">Railgun</option>
              <option value="SPINNING_BLADE">Spinning Blade</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      {filteredBots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CpuIcon size={36} />
          </div>
          <h3 className="empty-state-title">No Combat Mechs in Hangar</h3>
          <p className="empty-state-desc">
            Your hangar is currently vacant. Forge your first combat mech or summon preset champions!
          </p>
          <div className="empty-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleSeed} disabled={isSeeding}>
              <SparklesIcon size={14} />
              <span>Summon 6 Champions</span>
            </button>
            <Link to="/forge" className="btn btn-secondary btn-sm">
              <PlusIcon size={14} />
              <span>Forge From Scratch</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="hangar-grid">
          {filteredBots.map((bot) => (
            <div key={bot.id} className="mech-hangar-card">
              <div className="mech-card-header">
                <div
                  className="mech-card-avatar"
                  style={{ backgroundColor: bot.avatarColor || '#4f46e5' }}
                >
                  <CpuIcon size={24} />
                </div>
                <div className="mech-card-titles">
                  <span className="mech-id-tag">MECH #{bot.id}</span>
                  <h3 className="mech-codename">{bot.name}</h3>
                </div>
                <span className="mech-cr-badge" title="Combat Power Rating">
                  CR {bot.powerRating}
                </span>
              </div>

              <div className="mech-tags-row">
                <span className="weight-pill">{bot.weightClass}</span>
                <span className="weapon-pill">
                  <FlameIcon size={12} />
                  <span>{bot.weaponType.replace('_', ' ')}</span>
                </span>
              </div>

              {/* Combat Stats Bars */}
              <div className="mech-stat-bars">
                <div className="stat-line">
                  <div className="stat-line-label">
                    <HeartIcon size={12} />
                    <span>HP {bot.maxHealth}</span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill fill-hp"
                      style={{ width: `${Math.min(100, (bot.maxHealth / 250) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="stat-line">
                  <div className="stat-line-label">
                    <TargetIcon size={12} />
                    <span>ATK {bot.attack}</span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill fill-atk"
                      style={{ width: `${Math.min(100, (bot.attack / 90) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="stat-line">
                  <div className="stat-line-label">
                    <ShieldIcon size={12} />
                    <span>DEF {bot.defense}</span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill fill-def"
                      style={{ width: `${Math.min(100, (bot.defense / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="stat-line">
                  <div className="stat-line-label">
                    <ZapIcon size={12} />
                    <span>SPD {bot.speed}</span>
                  </div>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill fill-spd"
                      style={{ width: `${Math.min(100, (bot.speed / 80) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fight Record */}
              <div className="mech-record-row">
                <span className="record-label">Combat Record:</span>
                <div className="record-badges">
                  <span className="record-badge record-win">{bot.wins}W</span>
                  <span className="record-badge record-loss">{bot.losses}L</span>
                  {bot.draws > 0 && <span className="record-badge record-draw">{bot.draws}D</span>}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mech-card-footer">
                <Link to="/" className="btn btn-primary btn-sm btn-duel" title="Deploy into Arena">
                  <SwordsIcon size={14} />
                  <span>Duel</span>
                </Link>

                <Link
                  to={`/forge?id=${bot.id}`}
                  className="btn btn-secondary btn-sm"
                  title="Modify Mech Specifications"
                >
                  <WrenchIcon size={14} />
                  <span>Upgrade</span>
                </Link>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onScrapBot(bot)}
                  title="Decommission into Scrapyard"
                >
                  <SkullIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
