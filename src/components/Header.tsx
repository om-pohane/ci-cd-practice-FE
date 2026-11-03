import type { FC } from 'react'
import {
  ChevronRightIcon,
  MenuIcon,
  MoonIcon,
  RefreshIcon,
  SearchIcon,
  SunIcon,
  UserPlusIcon,
} from './Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'
import { useTheme } from '../context/useTheme'

interface HeaderProps {
  backendConnected: boolean | null
  checkingConnection: boolean
  onRefresh: () => void
  onOpenGlobalSearch: () => void
  onToggleMobileSidebar: () => void
}

export const Header: FC<HeaderProps> = ({
  backendConnected,
  checkingConnection,
  onRefresh,
  onOpenGlobalSearch,
  onToggleMobileSidebar,
}) => {
  const { path } = useRouter()
  const { theme, toggleTheme } = useTheme()

  // Generate breadcrumbs from path
  const getBreadcrumbs = () => {
    if (path === '/' || path === '') {
      return [{ label: 'Dashboard', path: '/' }]
    }

    const segments = path.split('/').filter(Boolean)
    const crumbs = [{ label: 'Home', path: '/' }]

    let current = ''
    segments.forEach((seg, idx) => {
      current += `/${seg}`
      let label = seg.charAt(0).toUpperCase() + seg.slice(1)
      if (seg === 'students') label = 'Students'
      else if (seg === 'new') label = 'Registration'
      else if (seg === 'edit') label = 'Edit'
      else if (seg === 'courses') label = 'Courses'
      else if (seg === 'recycle-bin') label = 'Recycle Bin'
      else if (seg === 'analytics') label = 'Analytics'
      else if (seg === 'settings') label = 'Settings'
      else if (!isNaN(Number(seg))) label = `#${seg}`

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
        {/* Global Search Shortcut Button */}
        <button
          className="global-search-trigger"
          onClick={onOpenGlobalSearch}
          title="Search students or pages (Cmd+K)"
        >
          <SearchIcon size={15} />
          <span className="search-trigger-text">Quick Search...</span>
          <kbd className="search-shortcut">⌘K</kbd>
        </button>

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
              ? 'Checking...'
              : backendConnected === true
              ? 'API Online'
              : 'API Offline'}
          </span>
          <RefreshIcon size={12} className="pill-refresh-icon" />
        </div>

        {/* Theme Toggle Button */}
        <button
          className="header-action-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle color theme"
        >
          {theme === 'light' ? <MoonIcon size={17} /> : <SunIcon size={17} />}
        </button>

        {/* Quick Add Student Button */}
        <Link to="/students/new" className="btn btn-primary btn-sm header-add-btn">
          <UserPlusIcon size={15} />
          <span>Register</span>
        </Link>
      </div>
    </header>
  )
}
