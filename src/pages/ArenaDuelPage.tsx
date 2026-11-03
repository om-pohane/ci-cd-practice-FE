import { useEffect, useRef, useState, type FC } from 'react'
import type { ArenaEnvironment, BattleRoundLog, CombatBot, DuelResult } from '../types/bot'
import { api } from '../services/api'
import {
  CpuIcon,
  FlameIcon,
  RefreshIcon,
  ShieldIcon,
  SparklesIcon,
  SwordsIcon,
  TargetIcon,
  TrophyIcon,
  ZapIcon,
} from '../components/Icons'
import { sounds } from '../utils/sound'

interface ArenaDuelPageProps {
  bots: CombatBot[]
  onReloadBots: () => void
  onSeedBots: () => Promise<void>
}

const ARENAS: Array<{ id: ArenaEnvironment; name: string; desc: string; icon: string }> = [
  { id: 'NEON_CAGE', name: 'Neon Cage', desc: 'Standard high-voltage arena grid', icon: '⚡' },
  { id: 'MOLTEN_FOUNDRY', name: 'Molten Foundry', desc: 'Surrounded by vats of 2000°C liquid steel', icon: '🔥' },
  { id: 'ACID_PIT', name: 'Acid Pit', desc: 'Corrosive chemical spray slowly erodes armor', icon: '🧪' },
  { id: 'CYBER_ROOF', name: 'Cyber Rooftop', desc: 'Gale force winds favor agile & fast combatants', icon: '🌪️' },
]

export const ArenaDuelPage: FC<ArenaDuelPageProps> = ({
  bots,
  onReloadBots,
  onSeedBots,
}) => {
  const [selectedBot1Id, setSelectedBot1Id] = useState<number | null>(null)
  const [selectedBot2Id, setSelectedBot2Id] = useState<number | null>(null)
  const [selectedArena, setSelectedArena] = useState<ArenaEnvironment>('NEON_CAGE')

  // Combat execution state
  const [isBattling, setIsBattling] = useState(false)
  const [duelResult, setDuelResult] = useState<DuelResult | null>(null)
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [bot1DisplayHp, setBot1DisplayHp] = useState<number>(0)
  const [bot2DisplayHp, setBot2DisplayHp] = useState<number>(0)
  const [activeLogStream, setActiveLogStream] = useState<BattleRoundLog[]>([])
  const [activeAttackerId, setActiveAttackerId] = useState<number | null>(null)
  const [damagePopup, setDamagePopup] = useState<{ id: number; text: string; isCrit: boolean } | null>(null)
  const [isBattleFinished, setIsBattleFinished] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Effective fighter IDs: fallback to bots[0] / bots[1]
  const bot1Id = selectedBot1Id ?? (bots[0]?.id ?? null)
  const bot2Id = selectedBot2Id ?? (bots[1]?.id ?? (bots[0]?.id ?? null))

  const bot1 = bots.find((b) => b.id === bot1Id)
  const bot2 = bots.find((b) => b.id === bot2Id)

  const handleSeed = async () => {
    setIsSeeding(true)
    try {
      await onSeedBots()
    } finally {
      setIsSeeding(false)
    }
  }

  // Start Duel
  const handleStartDuel = async () => {
    if (!bot1 || !bot2 || bot1.id === bot2.id) return

    setIsBattling(true)
    setIsBattleFinished(false)
    setDuelResult(null)
    setCurrentRoundIdx(0)
    setBot1DisplayHp(bot1.maxHealth)
    setBot2DisplayHp(bot2.maxHealth)
    setActiveLogStream([])
    setDamagePopup(null)

    try {
      const result = await api.executeDuel({
        bot1Id: bot1.id,
        bot2Id: bot2.id,
        arenaEnvironment: selectedArena,
      })
      setDuelResult(result)
      onReloadBots()
    } catch {
      setIsBattling(false)
    }
  }

  // Step through battle animation
  useEffect(() => {
    if (!isBattling || !duelResult || isBattleFinished) return

    const logs = duelResult.combatLog
    if (currentRoundIdx >= logs.length) return

    const currentStep = logs[currentRoundIdx]

    timerRef.current = setTimeout(() => {
      setActiveAttackerId(currentStep.attackerId)

      // Trigger audio & popup
      if (currentStep.isDodge) {
        setDamagePopup({
          id: currentStep.defenderId,
          text: 'DODGED!',
          isCrit: false,
        })
      } else if (currentStep.isCritical) {
        sounds.playCritSound()
        setDamagePopup({
          id: currentStep.defenderId,
          text: `-${currentStep.damageDealt} CRIT!`,
          isCrit: true,
        })
      } else {
        sounds.playHitSound()
        setDamagePopup({
          id: currentStep.defenderId,
          text: `-${currentStep.damageDealt}`,
          isCrit: false,
        })
      }

      // Update HP
      if (bot1 && currentStep.defenderId === bot1.id) {
        setBot1DisplayHp(currentStep.defenderHpRemaining)
      } else if (bot2 && currentStep.defenderId === bot2.id) {
        setBot2DisplayHp(currentStep.defenderHpRemaining)
      }

      setActiveLogStream((prev) => [currentStep, ...prev])
      const nextIdx = currentRoundIdx + 1
      setCurrentRoundIdx(nextIdx)

      if (nextIdx >= logs.length) {
        setIsBattleFinished(true)
        sounds.playVictorySound()
      }
    }, 700)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isBattling, duelResult, currentRoundIdx, isBattleFinished, bot1, bot2])

  // Reset to fighter selection
  const handleResetDuel = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsBattling(false)
    setIsBattleFinished(false)
    setDuelResult(null)
    setActiveLogStream([])
    setDamagePopup(null)
  }

  return (
    <div className="page-container arena-page">
      {/* Seed prompt if no bots */}
      {bots.length < 2 && (
        <div className="seed-banner">
          <div className="seed-banner-content">
            <SparklesIcon size={24} className="seed-banner-icon" />
            <div>
              <h3>Arena Roster Empty or Incomplete</h3>
              <p>Spawn 6 legendary gladiator combat bots to kickstart the colosseum battles!</p>
            </div>
          </div>
          <button
            className="btn btn-primary seed-btn"
            onClick={handleSeed}
            disabled={isSeeding}
          >
            {isSeeding ? 'Summoning...' : 'Summon 6 Arena Champions'}
          </button>
        </div>
      )}

      {/* Arena Stage */}
      <div className={`colosseum-stage arena-env-${selectedArena.toLowerCase()}`}>
        {/* Stage Header */}
        <div className="stage-top-bar">
          <div className="stage-title-wrap">
            <SwordsIcon size={20} />
            <h1 className="stage-title">UNDERGROUND CYBER COLOSSEUM</h1>
          </div>
          <div className="stage-arena-pill">
            <span>{ARENAS.find((a) => a.id === selectedArena)?.icon}</span>
            <span>{ARENAS.find((a) => a.id === selectedArena)?.name}</span>
          </div>
        </div>

        {/* Combatants Showcase Row */}
        <div className="fighters-clash-row">
          {/* Red Corner Fighter */}
          <div
            className={`fighter-card red-corner ${
              activeAttackerId === bot1?.id ? 'striking-forward' : ''
            }`}
          >
            <div className="corner-tag red-corner-tag">RED CORNER</div>
            {bot1 ? (
              <div className="fighter-content">
                <div
                  className="mech-avatar-box"
                  style={{ backgroundColor: bot1.avatarColor || '#dc2626' }}
                >
                  <CpuIcon size={42} />
                  {damagePopup && damagePopup.id === bot1.id && (
                    <div
                      className={`damage-indicator ${
                        damagePopup.isCrit ? 'crit-damage' : ''
                      }`}
                    >
                      {damagePopup.text}
                    </div>
                  )}
                </div>

                <h3 className="mech-name">{bot1.name}</h3>
                <span className="mech-class-badge">{bot1.weightClass}</span>

                {/* Health Bar */}
                <div className="hp-bar-wrap">
                  <div className="hp-label-row">
                    <span>HEALTH</span>
                    <span>
                      {isBattling ? bot1DisplayHp : bot1.maxHealth} / {bot1.maxHealth} HP
                    </span>
                  </div>
                  <div className="hp-track">
                    <div
                      className="hp-fill hp-red"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((isBattling ? bot1DisplayHp : bot1.maxHealth) /
                              bot1.maxHealth) *
                              100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="fighter-stats-row">
                  <div className="mini-stat">
                    <TargetIcon size={13} />
                    <span>{bot1.attack} ATK</span>
                  </div>
                  <div className="mini-stat">
                    <ShieldIcon size={13} />
                    <span>{bot1.defense} DEF</span>
                  </div>
                  <div className="mini-stat">
                    <ZapIcon size={13} />
                    <span>{bot1.speed} SPD</span>
                  </div>
                </div>

                <div className="weapon-pill-box">
                  <FlameIcon size={14} />
                  <span>{bot1.weaponType.replace('_', ' ')}</span>
                </div>
              </div>
            ) : (
              <div className="fighter-placeholder">Select Red Fighter</div>
            )}
          </div>

          {/* VS Clash Center */}
          <div className="clash-center-zone">
            <div className="vs-emblem">VS</div>
            {isBattling && (
              <div className="combat-round-badge">
                ROUND {Math.min(duelResult?.totalRounds || 1, currentRoundIdx)}
              </div>
            )}
          </div>

          {/* Blue Corner Fighter */}
          <div
            className={`fighter-card blue-corner ${
              activeAttackerId === bot2?.id ? 'striking-forward' : ''
            }`}
          >
            <div className="corner-tag blue-corner-tag">BLUE CORNER</div>
            {bot2 ? (
              <div className="fighter-content">
                <div
                  className="mech-avatar-box"
                  style={{ backgroundColor: bot2.avatarColor || '#2563eb' }}
                >
                  <CpuIcon size={42} />
                  {damagePopup && damagePopup.id === bot2.id && (
                    <div
                      className={`damage-indicator ${
                        damagePopup.isCrit ? 'crit-damage' : ''
                      }`}
                    >
                      {damagePopup.text}
                    </div>
                  )}
                </div>

                <h3 className="mech-name">{bot2.name}</h3>
                <span className="mech-class-badge">{bot2.weightClass}</span>

                {/* Health Bar */}
                <div className="hp-bar-wrap">
                  <div className="hp-label-row">
                    <span>HEALTH</span>
                    <span>
                      {isBattling ? bot2DisplayHp : bot2.maxHealth} / {bot2.maxHealth} HP
                    </span>
                  </div>
                  <div className="hp-track">
                    <div
                      className="hp-fill hp-blue"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((isBattling ? bot2DisplayHp : bot2.maxHealth) /
                              bot2.maxHealth) *
                              100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="fighter-stats-row">
                  <div className="mini-stat">
                    <TargetIcon size={13} />
                    <span>{bot2.attack} ATK</span>
                  </div>
                  <div className="mini-stat">
                    <ShieldIcon size={13} />
                    <span>{bot2.defense} DEF</span>
                  </div>
                  <div className="mini-stat">
                    <ZapIcon size={13} />
                    <span>{bot2.speed} SPD</span>
                  </div>
                </div>

                <div className="weapon-pill-box">
                  <FlameIcon size={14} />
                  <span>{bot2.weaponType.replace('_', ' ')}</span>
                </div>
              </div>
            ) : (
              <div className="fighter-placeholder">Select Blue Fighter</div>
            )}
          </div>
        </div>

        {/* Victory Overlay if Battle Finished */}
        {isBattleFinished && duelResult && (
          <div className="victory-modal-overlay">
            <div className="victory-banner-box">
              <TrophyIcon size={52} className="trophy-gold" />
              <h2 className="victory-headline">
                {duelResult.isDraw ? 'BATTLE DRAW!' : `${duelResult.winner?.name} VICTORIOUS!`}
              </h2>
              <p className="victory-quote">"{duelResult.victoryQuote}"</p>
              <div className="victory-actions">
                <button className="btn btn-primary" onClick={handleStartDuel}>
                  <RefreshIcon size={16} />
                  <span>Rematch Duel</span>
                </button>
                <button className="btn btn-secondary" onClick={handleResetDuel}>
                  <span>Change Fighters</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Deck (When Not Battling) */}
      {!isBattling ? (
        <div className="arena-control-deck">
          <div className="control-selectors-grid">
            {/* Pick Bot 1 */}
            <div className="control-col">
              <label className="deck-label" htmlFor="select-bot1">Select Red Fighter</label>
              <select
                id="select-bot1"
                className="deck-select"
                value={bot1Id ?? ''}
                onChange={(e) => setSelectedBot1Id(Number(e.target.value))}
              >
                {bots.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.id === Number(bot2Id)}>
                    {b.name} ({b.weightClass} • {b.weaponType.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Pick Arena Environment */}
            <div className="control-col">
              <label className="deck-label" htmlFor="select-arena">Battlefield Arena</label>
              <select
                id="select-arena"
                className="deck-select"
                value={selectedArena}
                onChange={(e) => setSelectedArena(e.target.value as ArenaEnvironment)}
              >
                {ARENAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name} — {a.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Pick Bot 2 */}
            <div className="control-col">
              <label className="deck-label" htmlFor="select-bot2">Select Blue Fighter</label>
              <select
                id="select-bot2"
                className="deck-select"
                value={bot2Id ?? ''}
                onChange={(e) => setSelectedBot2Id(Number(e.target.value))}
              >
                {bots.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.id === Number(bot1Id)}>
                    {b.name} ({b.weightClass} • {b.weaponType.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary btn-giant-battle"
            onClick={handleStartDuel}
            disabled={!bot1 || !bot2 || bot1.id === bot2.id}
          >
            <SwordsIcon size={24} />
            <span>COMMENCE BATTLE DUEL</span>
          </button>
        </div>
      ) : (
        /* Battle Control Toolbar */
        <div className="in-battle-controls">
          <button className="btn btn-secondary btn-sm" onClick={handleResetDuel}>
            Abort Combat
          </button>
          <span className="live-battle-tag">● COMBAT SIMULATION IN PROGRESS</span>
        </div>
      )}

      {/* Live Play-by-Play Combat Log Ticker */}
      <div className="combat-log-terminal">
        <div className="terminal-header">
          <div className="terminal-led" />
          <span>ARENA TELEMETRY &amp; COMBAT LOG</span>
        </div>
        <div className="terminal-body">
          {activeLogStream.length === 0 ? (
            <div className="terminal-empty">
              Awaiting combat sequence initiation. Select fighters above to commence.
            </div>
          ) : (
            activeLogStream.map((log, idx) => (
              <div key={idx} className="log-line">
                <span className="log-round">[R{log.round}]</span>
                <span className="log-comment">{log.commentary}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
