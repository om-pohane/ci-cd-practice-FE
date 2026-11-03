import type { FC } from 'react'
import {
  ChevronRightIcon,
  MenuIcon,
  MoonIcon,
  RefreshIcon,
  SunIcon,
  SwordsIcon,
  WrenchIcon,
} from './Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'
import { useTheme } from '../context/useTheme'

interface HeaderProps {
  backendConnected: boolean | null
  checkingConnection: boolean
  onRefresh: () => void
  onToggleMobileSidebar: () => void
}

export const Header: FC<HeaderProps> = ({
  backendConnected,
  checkingConnection,
  onRefresh,
  onToggleMobileSidebar,
}) => {
  const { path } = useRouter()
  const { theme, toggleTheme } = useTheme()

  const getBreadcrumbs = () => {
    if (path === '/' || path === '' || path === '/arena') {
      return [{ label: 'Arena Colosseum', path: '/' }]
    }
    const segments = path.split('/').filter(Boolean)
    const crumbs = [{ label: 'Arena', path: '/' }]

    let current = ''
    segments.forEach((seg, idx) => {
      current += `/${seg}`
      let label = seg.toUpperCase()
      if (seg === 'hangar') label = 'Mech Hangar'
      else if (seg === 'forge') label = 'Mech Forge'
      else if (seg === 'leaderboard') label = 'Hall of Fame'
      else if (seg === 'scrapyard') label = 'Scrapyard'
      else if (seg === 'settings') label = 'System Controls'
      else if (!isNaN(Number(seg))) label = `Mech #${seg}`

      crumbs.push({ label, path: idx === segments.length - 1 ? path : current })
    })

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-sidebar-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle menu"
        >
          <MenuIcon size={20} />
        </button>

        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb.path} className="breadcrumb-item">
              {idx > 0 && <ChevronRightIcon size={12} className="breadcrumb-sep" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-current">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="header-right">
        {/* Live Backend Connection Indicator */}
        <div
          className={`connection-pill ${
            backendConnected === true
              ? 'pill-online'
              : backendConnected === false
              ? 'pill-offline'
              : 'pill-checking'
          }`}
          onClick={onRefresh}
          role="button"
          tabIndex={0}
          title="Click to re-verify backend connectivity"
        >
          <span className="pill-dot" />
          <span className="pill-text">
            {checkingConnection
              ? 'Scanning...'
              : backendConnected === true
              ? 'Arena Server Online'
              : 'Server Offline'}
          </span>
          <RefreshIcon size={12} className="pill-refresh-icon" />
        </div>

        {/* Theme Toggle Button */}
        <button
          className="header-action-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Cyber Dark' : 'Light'} Mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'light' ? <MoonIcon size={17} /> : <SunIcon size={17} />}
        </button>

        <Link to="/forge" className="btn btn-secondary btn-sm">
          <WrenchIcon size={14} />
          <span>Forge Mech</span>
        </Link>

        <Link to="/" className="btn btn-primary btn-sm neon-pulse">
          <SwordsIcon size={14} />
          <span>Enter Arena</span>
        </Link>
      </div>
    </header>
  )
}
