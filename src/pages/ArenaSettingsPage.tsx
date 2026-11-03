import { useState, type FC } from 'react'
import { api } from '../services/api'
import { useTheme } from '../context/useTheme'
import {
  CpuIcon,
  MoonIcon,
  PlayIcon,
  RefreshIcon,
  SettingsIcon,
  SunIcon,
  Volume2Icon,
  VolumeXIcon,
} from '../components/Icons'
import { sounds } from '../utils/sound'

interface ArenaSettingsPageProps {
  backendConnected: boolean | null
  checkingConnection: boolean
  onRecheckConnection: () => Promise<void>
}

type BotEndpoint =
  | 'GET_ALL'
  | 'GET_BY_ID'
  | 'FILTER_WEIGHT'
  | 'FILTER_WEAPON'
  | 'CREATE'
  | 'UPDATE'
  | 'SCRAP'
  | 'REPAIR'
  | 'LEADERBOARD'
  | 'SEED'
  | 'DUEL'

export const ArenaSettingsPage: FC<ArenaSettingsPageProps> = ({
  backendConnected,
  checkingConnection,
  onRecheckConnection,
}) => {
  const { theme, setTheme } = useTheme()
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted())

  // API Playground state
  const [endpoint, setEndpoint] = useState<BotEndpoint>('GET_ALL')
  const [paramId, setParamId] = useState('1')
  const [paramQuery, setParamQuery] = useState('TITAN')
  const [payloadJson, setPayloadJson] = useState(
    JSON.stringify(
      {
        name: 'CYBER_VIPER_9',
        weightClass: 'MIDDLEWEIGHT',
        weaponType: 'PLASMA_SAW',
        maxHealth: 160,
        attack: 60,
        defense: 30,
        speed: 45,
        avatarColor: '#2563eb',
      },
      null,
      2,
    ),
  )

  const [apiResponse, setApiResponse] = useState<string>('')
  const [apiStatus, setApiStatus] = useState<number | null>(null)
  const [apiLatency, setApiLatency] = useState<number | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  // Ping state
  const [pingLatency, setPingLatency] = useState<number | null>(null)
  const [isPinging, setIsPinging] = useState(false)

  const handlePingTest = async () => {
    setIsPinging(true)
    const start = performance.now()
    try {
      await onRecheckConnection()
      const end = performance.now()
      setPingLatency(Math.round(end - start))
    } catch {
      setPingLatency(null)
    } finally {
      setIsPinging(false)
    }
  }

  const handleToggleSound = () => {
    const updated = sounds.toggleMute()
    setIsMuted(updated)
    if (!updated) {
      sounds.playAttackSound()
    }
  }

  const handleTestAudio = () => {
    sounds.playCritSound()
  }

  // Execute playground request
  const handleExecute = async () => {
    setIsExecuting(true)
    setApiResponse('')
    setApiStatus(null)

    const start = performance.now()
    try {
      let result: unknown

      if (endpoint === 'GET_ALL') {
        result = await api.getAllBots()
      } else if (endpoint === 'GET_BY_ID') {
        result = await api.getBotById(Number(paramId))
      } else if (endpoint === 'FILTER_WEIGHT') {
        result = await api.getBotsByWeightClass(paramQuery)
      } else if (endpoint === 'FILTER_WEAPON') {
        result = await api.getBotsByWeaponType(paramQuery)
      } else if (endpoint === 'CREATE') {
        result = await api.createBot(JSON.parse(payloadJson))
      } else if (endpoint === 'UPDATE') {
        result = await api.updateBot(Number(paramId), JSON.parse(payloadJson))
      } else if (endpoint === 'SCRAP') {
        result = await api.scrapBot(Number(paramId))
      } else if (endpoint === 'REPAIR') {
        result = await api.repairBot(Number(paramId))
      } else if (endpoint === 'LEADERBOARD') {
        result = await api.getLeaderboard()
      } else if (endpoint === 'SEED') {
        result = await api.seedChampions()
      } else if (endpoint === 'DUEL') {
        result = await api.executeDuel({
          bot1Id: 1,
          bot2Id: 2,
          arenaEnvironment: 'NEON_CAGE',
        })
      }

      const end = performance.now()
      setApiLatency(Math.round(end - start))
      setApiStatus(200)
      setApiResponse(typeof result === 'string' ? result : JSON.stringify(result, null, 2))
    } catch (err: unknown) {
      const end = performance.now()
      setApiLatency(Math.round(end - start))
      setApiStatus(500)
      setApiResponse(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="page-container settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Arena System &amp; API Controls</h1>
          <p className="page-subtitle">
            Diagnostics, audio telemetry, and live REST API explorer for Spring Boot arena controllers.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left Column: Diagnostics & Audio & Theme */}
        <div className="settings-left-col">
          {/* Diagnostics Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="card-header-title">
                <CpuIcon size={20} />
                <h3>Backend Arena Health</h3>
              </div>
            </div>

            <div className="diagnostics-content">
              <div className="diagnostic-row">
                <span className="diag-label">Base URL:</span>
                <code>http://localhost:8080/api/bots</code>
              </div>

              <div className="diagnostic-row">
                <span className="diag-label">Status:</span>
                <span
                  className={`status-pill ${
                    backendConnected === true
                      ? 'pill-online'
                      : backendConnected === false
                      ? 'pill-offline'
                      : 'pill-checking'
                  }`}
                >
                  <span className="status-dot" />
                  <span>
                    {checkingConnection
                      ? 'Connecting...'
                      : backendConnected === true
                      ? 'Online'
                      : 'Offline'}
                  </span>
                </span>
              </div>

              {pingLatency !== null && (
                <div className="diagnostic-row">
                  <span className="diag-label">Round-Trip Ping:</span>
                  <span className="latency-val">{pingLatency} ms</span>
                </div>
              )}

              <button
                className="btn btn-secondary btn-sm diag-ping-btn"
                onClick={handlePingTest}
                disabled={isPinging || checkingConnection}
              >
                <RefreshIcon size={14} />
                <span>{isPinging ? 'Pinging...' : 'Ping Arena Server'}</span>
              </button>
            </div>
          </div>

          {/* Audio Telemetry Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="card-header-title">
                <Volume2Icon size={20} />
                <h3>Synthesized Web Audio</h3>
              </div>
            </div>

            <div className="audio-controls-row">
              <button
                className={`theme-box-btn ${!isMuted ? 'active' : ''}`}
                onClick={handleToggleSound}
              >
                {isMuted ? <VolumeXIcon size={20} /> : <Volume2Icon size={20} />}
                <span>{isMuted ? 'SFX Muted' : 'SFX Enabled'}</span>
              </button>

              <button className="btn btn-secondary btn-sm" onClick={handleTestAudio}>
                <span>Test SFX Laser</span>
              </button>
            </div>
          </div>

          {/* Theme Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="card-header-title">
                <SettingsIcon size={20} />
                <h3>Color Theme</h3>
              </div>
            </div>

            <div className="theme-toggle-row">
              <button
                className={`theme-box-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <MoonIcon size={20} />
                <span>Cyber Dark</span>
              </button>

              <button
                className={`theme-box-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <SunIcon size={20} />
                <span>Clean Light</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: API Playground */}
        <div className="settings-right-col">
          <div className="dashboard-card playground-card">
            <div className="dashboard-card-header">
              <div className="card-header-title">
                <PlayIcon size={20} />
                <h3>Interactive REST API Playground</h3>
              </div>
              <span className="playground-tag">Live Tester</span>
            </div>

            <div className="playground-form">
              <div className="form-group">
                <label className="form-label" htmlFor="endpoint-select">Select Endpoint</label>
                <select
                  id="endpoint-select"
                  className="form-select"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value as BotEndpoint)}
                >
                  <option value="GET_ALL">GET /api/bots (List Hangar)</option>
                  <option value="GET_BY_ID">GET /api/bots/&#123;id&#125; (Get Bot Specs)</option>
                  <option value="FILTER_WEIGHT">GET /api/bots/weight?class=... (Filter Weight)</option>
                  <option value="FILTER_WEAPON">GET /api/bots/weapon?type=... (Filter Weapon)</option>
                  <option value="CREATE">POST /api/bots (Forge Mech)</option>
                  <option value="UPDATE">PUT /api/bots/&#123;id&#125; (Upgrade Mech)</option>
                  <option value="SCRAP">DELETE /api/bots/&#123;id&#125; (Scrap Mech)</option>
                  <option value="REPAIR">PUT /api/bots/&#123;id&#125;/repair (Rebuild Mech)</option>
                  <option value="LEADERBOARD">GET /api/bots/leaderboard (Hall of Fame)</option>
                  <option value="SEED">POST /api/bots/seed (Seed Champions)</option>
                  <option value="DUEL">POST /api/bots/duel (Execute Arena Battle)</option>
                </select>
              </div>

              {(endpoint === 'GET_BY_ID' ||
                endpoint === 'UPDATE' ||
                endpoint === 'SCRAP' ||
                endpoint === 'REPAIR') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="bot-id">Mech ID</label>
                  <input
                    id="bot-id"
                    type="number"
                    className="form-input"
                    value={paramId}
                    onChange={(e) => setParamId(e.target.value)}
                  />
                </div>
              )}

              {(endpoint === 'FILTER_WEIGHT' || endpoint === 'FILTER_WEAPON') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="filter-query">Filter Query</label>
                  <input
                    id="filter-query"
                    type="text"
                    className="form-input"
                    value={paramQuery}
                    onChange={(e) => setParamQuery(e.target.value)}
                  />
                </div>
              )}

              {(endpoint === 'CREATE' || endpoint === 'UPDATE') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="payload-editor">JSON Request Body</label>
                  <textarea
                    id="payload-editor"
                    className="form-input code-textarea"
                    rows={6}
                    value={payloadJson}
                    onChange={(e) => setPayloadJson(e.target.value)}
                  />
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary playground-run-btn"
                onClick={handleExecute}
                disabled={isExecuting}
              >
                <PlayIcon size={14} />
                <span>{isExecuting ? 'Transmitting...' : 'Run Endpoint'}</span>
              </button>
            </div>

            {apiResponse && (
              <div className="playground-response">
                <div className="response-header">
                  <span className="response-title">API Response</span>
                  <div className="response-badges">
                    {apiStatus && (
                      <span
                        className={`badge ${apiStatus === 200 ? 'badge-success' : 'badge-danger'}`}
                      >
                        Status {apiStatus}
                      </span>
                    )}
                    {apiLatency !== null && (
                      <span className="badge badge-info">{apiLatency} ms</span>
                    )}
                  </div>
                </div>
                <pre className="response-json">
                  <code>{apiResponse}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
