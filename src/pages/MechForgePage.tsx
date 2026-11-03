import { useEffect, useState, type FC, type FormEvent } from 'react'
import type { CombatBot, CombatBotInput, WeaponType, WeightClass } from '../types/bot'
import { api } from '../services/api'
import {
  ArrowLeftIcon,
  CpuIcon,
  FlameIcon,
  HeartIcon,
  ShieldIcon,
  SparklesIcon,
  TargetIcon,
  WrenchIcon,
  ZapIcon,
} from '../components/Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'

interface MechForgePageProps {
  onSaveBot: (data: CombatBotInput, id?: number) => Promise<CombatBot>
}

const WEAPONS: Array<{ type: WeaponType; name: string; perk: string; icon: string }> = [
  { type: 'PLASMA_SAW', name: 'Plasma Saw', perk: '+15% Armor Shred', icon: '⚡' },
  { type: 'TESLA_COIL', name: 'Tesla Coil', perk: 'High Shock Criticals', icon: '🔋' },
  { type: 'HYDRAULIC_CRUSHER', name: 'Hydraulic Crusher', perk: 'Crushing Heavy Blows', icon: '🔨' },
  { type: 'FLAMETHROWER', name: 'Flamethrower', perk: 'Continuous Burn Damage', icon: '🔥' },
  { type: 'RAILGUN', name: 'Railgun', perk: 'Hypersonic Armor Piercing', icon: '🎯' },
  { type: 'SPINNING_BLADE', name: 'Spinning Blade', perk: 'Rapid Multi-Hits', icon: '🌀' },
]

const WEIGHT_CLASSES: Array<{ type: WeightClass; name: string; description: string }> = [
  { type: 'LIGHTWEIGHT', name: 'Lightweight', description: 'Maximum agility & evasion' },
  { type: 'MIDDLEWEIGHT', name: 'Middleweight', description: 'Balanced speed & firepower' },
  { type: 'HEAVYWEIGHT', name: 'Heavyweight', description: 'Thick plating & heavy arms' },
  { type: 'TITAN', name: 'Titan', description: 'Colossal armor & destructive brute force' },
]

const COLORS = ['#dc2626', '#2563eb', '#0891b2', '#059669', '#d97706', '#7c3aed']

export const MechForgePage: FC<MechForgePageProps> = ({ onSaveBot }) => {
  const { navigate, query } = useRouter()
  const editId = query.get('id') ? Number(query.get('id')) : undefined
  const isEditing = Boolean(editId)

  const [name, setName] = useState('CYBER_VIPER_X')
  const [weightClass, setWeightClass] = useState<WeightClass>('MIDDLEWEIGHT')
  const [weaponType, setWeaponType] = useState<WeaponType>('PLASMA_SAW')
  const [maxHealth, setMaxHealth] = useState<number>(160)
  const [attack, setAttack] = useState<number>(55)
  const [defense, setDefense] = useState<number>(30)
  const [speed, setSpeed] = useState<number>(45)
  const [avatarColor, setAvatarColor] = useState<string>('#2563eb')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(isEditing)
  const [errorMsg, setErrorMsg] = useState('')

  // Load existing mech if editing
  useEffect(() => {
    let ignore = false
    if (isEditing && editId) {
      api
        .getBotById(editId)
        .then((bot) => {
          if (!ignore) {
            setName(bot.name)
            setWeightClass(bot.weightClass)
            setWeaponType(bot.weaponType)
            setMaxHealth(bot.maxHealth)
            setAttack(bot.attack)
            setDefense(bot.defense)
            setSpeed(bot.speed)
            setAvatarColor(bot.avatarColor || '#2563eb')
            setLoadingInitial(false)
          }
        })
        .catch(() => {
          if (!ignore) setLoadingInitial(false)
        })
    }
    return () => {
      ignore = true
    }
  }, [editId, isEditing])

  const calculatedCR = Math.round(maxHealth / 2 + attack * 2 + defense + speed)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!name.trim()) {
      setErrorMsg('Mech codename is required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSaveBot(
        {
          name: name.trim().toUpperCase(),
          weightClass,
          weaponType,
          maxHealth,
          attack,
          defense,
          speed,
          avatarColor,
        },
        editId,
      )
      navigate('/hangar')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save mech')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingInitial) {
    return (
      <div className="page-container loading-page">
        <div className="spinner" />
        <p>Calibrating mech specifications...</p>
      </div>
    )
  }

  return (
    <div className="page-container forge-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEditing ? 'Mech Modification Lab' : 'Mech Forge & Builder'}</h1>
          <p className="page-subtitle">
            {isEditing
              ? `Upgrading battle chassis for Mech #${editId}`
              : 'Construct a combat robot from chassis to weapon systems'}
          </p>
        </div>

        <Link to="/hangar" className="btn btn-ghost btn-sm">
          <ArrowLeftIcon size={16} />
          <span>Back to Hangar</span>
        </Link>
      </div>

      <div className="forge-split-layout">
        {/* Left: Customizer Form */}
        <div className="forge-form-card">
          <form onSubmit={handleSubmit} className="forge-form">
            {errorMsg && <div className="quick-error-alert">{errorMsg}</div>}

            {/* Codename */}
            <div className="form-group">
              <label className="form-label" htmlFor="mech-name">Mech Codename</label>
              <input
                id="mech-name"
                type="text"
                className="form-input cyber-input"
                placeholder="e.g. OMEGA_TITAN_V"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>

            {/* Weight Class */}
            <div className="form-group">
              <label className="form-label">Weight Classification</label>
              <div className="weight-selection-grid">
                {WEIGHT_CLASSES.map((wc) => (
                  <div
                    key={wc.type}
                    className={`weight-choice-card ${weightClass === wc.type ? 'active' : ''}`}
                    onClick={() => setWeightClass(wc.type)}
                  >
                    <strong>{wc.name}</strong>
                    <span>{wc.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weapon Selector */}
            <div className="form-group">
              <label className="form-label">Primary Weapon System</label>
              <div className="weapons-selection-grid">
                {WEAPONS.map((w) => (
                  <div
                    key={w.type}
                    className={`weapon-choice-card ${weaponType === w.type ? 'active' : ''}`}
                    onClick={() => setWeaponType(w.type)}
                  >
                    <span className="weapon-icon-large">{w.icon}</span>
                    <span className="weapon-title">{w.name}</span>
                    <span className="weapon-perk">{w.perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat Allocation Sliders */}
            <div className="form-group">
              <label className="form-label">Chassis &amp; Combat Stat Calibration</label>

              <div className="stat-slider-row">
                <div className="slider-label-wrap">
                  <span className="slider-name">
                    <HeartIcon size={14} /> Health Points (HP)
                  </span>
                  <span className="slider-val">{maxHealth} HP</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="250"
                  step="5"
                  value={maxHealth}
                  onChange={(e) => setMaxHealth(Number(e.target.value))}
                  className="slider-range slider-hp"
                />
              </div>

              <div className="stat-slider-row">
                <div className="slider-label-wrap">
                  <span className="slider-name">
                    <TargetIcon size={14} /> Attack Damage (ATK)
                  </span>
                  <span className="slider-val">{attack} DMG</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="1"
                  value={attack}
                  onChange={(e) => setAttack(Number(e.target.value))}
                  className="slider-range slider-atk"
                />
              </div>

              <div className="stat-slider-row">
                <div className="slider-label-wrap">
                  <span className="slider-name">
                    <ShieldIcon size={14} /> Armor Defense (DEF)
                  </span>
                  <span className="slider-val">{defense} DEF</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="1"
                  value={defense}
                  onChange={(e) => setDefense(Number(e.target.value))}
                  className="slider-range slider-def"
                />
              </div>

              <div className="stat-slider-row">
                <div className="slider-label-wrap">
                  <span className="slider-name">
                    <ZapIcon size={14} /> Speed &amp; Mobility (SPD)
                  </span>
                  <span className="slider-val">{speed} SPD</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="80"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="slider-range slider-spd"
                />
              </div>
            </div>

            {/* Avatar Color */}
            <div className="form-group">
              <label className="form-label">Neon Chassis Paint</label>
              <div className="color-palette-row">
                {COLORS.map((c) => (
                  <div
                    key={c}
                    className={`color-swatch ${avatarColor === c ? 'swatch-active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setAvatarColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="forge-submit-bar">
              <Link to="/hangar" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-submit-forge"
                disabled={isSubmitting}
              >
                <WrenchIcon size={16} />
                <span>{isSubmitting ? 'Calibrating...' : isEditing ? 'Save Upgrades' : 'Forge & Deploy'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Hologram Preview */}
        <div className="forge-preview-col">
          <div className="preview-label-tag">
            <SparklesIcon size={16} />
            <span>Live Holographic Blueprint</span>
          </div>

          <div className="hologram-mech-card" style={{ borderColor: avatarColor }}>
            <div className="hologram-header">
              <div className="hologram-avatar" style={{ backgroundColor: avatarColor }}>
                <CpuIcon size={38} />
              </div>
              <div className="hologram-cr-box">
                <span className="cr-label">COMBAT RATING</span>
                <span className="cr-score">CR {calculatedCR}</span>
              </div>
            </div>

            <h2 className="hologram-title">{name || 'UNNAMED_MECH'}</h2>
            <div className="hologram-badges">
              <span className="weight-pill">{weightClass}</span>
              <span className="weapon-pill">
                <FlameIcon size={12} />
                <span>{weaponType.replace('_', ' ')}</span>
              </span>
            </div>

            <div className="hologram-stats-table">
              <div className="holo-stat-cell">
                <span className="holo-dim">HEALTH</span>
                <span className="holo-val">{maxHealth} HP</span>
              </div>
              <div className="holo-stat-cell">
                <span className="holo-dim">ATTACK</span>
                <span className="holo-val">{attack} DMG</span>
              </div>
              <div className="holo-stat-cell">
                <span className="holo-dim">DEFENSE</span>
                <span className="holo-val">{defense} DEF</span>
              </div>
              <div className="holo-stat-cell">
                <span className="holo-dim">SPEED</span>
                <span className="holo-val">{speed} SPD</span>
              </div>
            </div>

            <div className="hologram-footer">
              <span className="hologram-status-light" />
              <span>READY FOR COMBAT DEPLOYMENT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
