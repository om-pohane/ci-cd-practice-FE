import { useCallback, useEffect, useState } from 'react'
import { api } from './services/api'
import { ThemeProvider } from './context/ThemeContext'
import { RouterProvider } from './router/Router'
import { useRouter } from './router/RouterContext'
import type { CombatBot, CombatBotInput, Toast } from './types/bot'

// Layout Components
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { ToastContainer } from './components/ToastContainer'
import { BackendOfflineBanner } from './components/BackendOfflineBanner'

// Pages
import { ArenaDuelPage } from './pages/ArenaDuelPage'
import { MechHangarPage } from './pages/MechHangarPage'
import { MechForgePage } from './pages/MechForgePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { ScrapyardPage } from './pages/ScrapyardPage'
import { ArenaSettingsPage } from './pages/ArenaSettingsPage'

import './App.css'

function AppContent() {
  const { path, navigate } = useRouter()

  const [activeBots, setActiveBots] = useState<CombatBot[]>([])
  const [scrappedBots, setScrappedBots] = useState<CombatBot[]>([])
  const [loading, setLoading] = useState(true)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [checkingConnection, setCheckingConnection] = useState(false)

  // Layout UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (type: Toast['type'], title: string, message: string) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6)
      setToasts((prev) => [...prev, { id, type, title, message }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    },
    [],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Load all bots from backend
  const loadBots = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true)
      setCheckingConnection(true)

      try {
        const [activeList, scrappedList] = await Promise.all([
          api.getAllBots(),
          api.getScrappedBots(),
        ])
        setActiveBots(Array.isArray(activeList) ? activeList : [])
        setScrappedBots(Array.isArray(scrappedList) ? scrappedList : [])
        setBackendConnected(true)
      } catch (err: unknown) {
        setBackendConnected(false)
        const msg = err instanceof Error ? err.message : 'Failed to connect to backend'
        if (!isSilent) {
          addToast('error', 'Arena Server Disconnected', msg)
        }
      } finally {
        setLoading(false)
        setCheckingConnection(false)
      }
    },
    [addToast],
  )

  // Initial fetch on mount
  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        const [activeList, scrappedList] = await Promise.all([
          api.getAllBots(),
          api.getScrappedBots(),
        ])
        if (!ignore) {
          setActiveBots(Array.isArray(activeList) ? activeList : [])
          setScrappedBots(Array.isArray(scrappedList) ? scrappedList : [])
          setBackendConnected(true)
        }
      } catch {
        if (!ignore) {
          setBackendConnected(false)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  // Save Mech (Forge or Upgrade)
  const handleSaveBot = async (data: CombatBotInput, id?: number): Promise<CombatBot> => {
    if (id) {
      const updated = await api.updateBot(id, data)
      setActiveBots((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      addToast('success', 'Mech Upgraded', `${updated.name} calibrated for combat!`)
      return updated
    } else {
      const created = await api.createBot(data)
      setActiveBots((prev) => [created, ...prev])
      addToast('success', 'Mech Forged', `${created.name} deployed to Hangar!`)
      return created
    }
  }

  // Decommission bot into Scrapyard
  const handleScrapBot = async (bot: CombatBot) => {
    try {
      await api.scrapBot(bot.id)
      const scrapped = { ...bot, scrapped: true, status: 'SCRAPPED' as const }
      setActiveBots((prev) => prev.filter((b) => b.id !== bot.id))
      setScrappedBots((prev) => [scrapped, ...prev])
      addToast('info', 'Mech Scrapped', `${bot.name} decommissioned into the Scrapyard.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to scrap mech'
      addToast('error', 'Scrap Failed', msg)
    }
  }

  // Nano-repair bot from Scrapyard
  const handleRepairBot = async (bot: CombatBot) => {
    try {
      const repaired = await api.repairBot(bot.id)
      setScrappedBots((prev) => prev.filter((b) => b.id !== bot.id))
      setActiveBots((prev) => [repaired, ...prev])
      addToast('success', 'Mech Rebuilt', `${repaired.name} restored to full combat health!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to repair mech'
      addToast('error', 'Repair Failed', msg)
    }
  }

  // Seed preset champions
  const handleSeedBots = async () => {
    try {
      const seeded = await api.seedChampions()
      setActiveBots(seeded)
      addToast('success', 'Champions Summoned', '6 legendary combat mechs spawned in the arena!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to seed champions'
      addToast('error', 'Summon Failed', msg)
    }
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {loading && <div className="global-top-progress" />}

      {/* Sidebar Navigation */}
      <Sidebar
        activeCount={activeBots.length}
        scrappedCount={scrappedBots.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Viewport */}
      <div className="app-main-viewport">
        <Header
          backendConnected={backendConnected}
          checkingConnection={checkingConnection}
          onRefresh={() => loadBots(false)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="app-content-body">
          {backendConnected === false && (
            <div style={{ maxWidth: '1240px', margin: '0 auto 20px' }}>
              <BackendOfflineBanner
                onRetry={() => loadBots(false)}
                isRetrying={checkingConnection}
              />
            </div>
          )}

          {/* Route Views */}
          {path === '/' || path === '' || path === '/arena' ? (
            <ArenaDuelPage
              bots={activeBots}
              onReloadBots={() => loadBots(true)}
              onSeedBots={handleSeedBots}
            />
          ) : path === '/hangar' ? (
            <MechHangarPage
              bots={activeBots}
              onScrapBot={handleScrapBot}
              onSeedBots={handleSeedBots}
            />
          ) : path === '/forge' ? (
            <MechForgePage onSaveBot={handleSaveBot} />
          ) : path === '/leaderboard' ? (
            <LeaderboardPage />
          ) : path === '/scrapyard' ? (
            <ScrapyardPage
              scrappedBots={scrappedBots}
              onRepairBot={handleRepairBot}
              onRefresh={() => loadBots(false)}
            />
          ) : path === '/settings' ? (
            <ArenaSettingsPage
              backendConnected={backendConnected}
              checkingConnection={checkingConnection}
              onRecheckConnection={() => loadBots(true)}
            />
          ) : (
            <div className="page-container error-page">
              <div className="empty-state">
                <h2>Sector Not Found</h2>
                <p>Coordinates <code>{path}</code> are outside the arena perimeter.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '14px' }}
                  onClick={() => navigate('/')}
                >
                  Return to Colosseum
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </ThemeProvider>
  )
}

export default App
