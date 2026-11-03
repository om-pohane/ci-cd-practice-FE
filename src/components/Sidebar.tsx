import { useState, type FC, type ReactNode } from 'react'
import {
  CpuIcon,
  FlameIcon,
  SettingsIcon,
  SkullIcon,
  SwordsIcon,
  TrophyIcon,
  Volume2Icon,
  VolumeXIcon,
  WrenchIcon,
} from './Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'
import { sounds } from '../utils/sound'

interface SidebarProps {
  activeCount: number
  scrappedCount: number
  collapsed: boolean
  onToggleCollapse: () => void
}

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  badge?: number
  badgeType?: 'primary' | 'danger' | 'warning'
}

export const Sidebar: FC<SidebarProps> = ({
  activeCount,
  scrappedCount,
  collapsed,
  onToggleCollapse,
}) => {
  const { path } = useRouter()
  const [isMuted, setIsMuted] = useState(() => sounds.isMuted())

  const handleToggleSound = () => {
    const updated = sounds.toggleMute()
    setIsMuted(updated)
    if (!updated) {
      sounds.playAttackSound()
    }
  }

  const navItems: NavItem[] = [
    {
      label: 'Arena Colosseum',
      path: '/',
      icon: <SwordsIcon size={18} />,
    },
    {
      label: 'Mech Hangar',
      path: '/hangar',
      icon: <CpuIcon size={18} />,
      badge: activeCount,
      badgeType: 'primary',
    },
    {
      label: 'Mech Forge',
      path: '/forge',
      icon: <WrenchIcon size={18} />,
    },
    {
      label: 'Hall of Fame',
      path: '/leaderboard',
      icon: <TrophyIcon size={18} />,
    },
    {
      label: 'Scrapyard',
      path: '/scrapyard',
      icon: <SkullIcon size={18} />,
      badge: scrappedCount,
      badgeType: 'danger',
    },
    {
      label: 'Arena System',
      path: '/settings',
      icon: <SettingsIcon size={18} />,
    },
  ]

  const isActive = (itemPath: string) => {
    if (itemPath === '/') return path === '/' || path === '' || path === '/arena'
    return path.startsWith(itemPath)
  }

  return (
    <aside className={`app-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <div className="sidebar-logo cyber-glow">
            <FlameIcon size={22} />
          </div>
          {!collapsed && (
            <div className="sidebar-title-wrap">
              <span className="sidebar-title">BOTCLASH</span>
              <span className="sidebar-subtitle">CYBER-ARENA OS</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <li key={item.path} className="sidebar-menu-item">
                <Link
                  to={item.path}
                  className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {!collapsed && <span className="sidebar-link-text">{item.label}</span>}
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`sidebar-badge sidebar-badge-${item.badgeType || 'primary'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          className="sound-toggle-btn"
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
        >
          {isMuted ? <VolumeXIcon size={16} /> : <Volume2Icon size={16} />}
          {!collapsed && <span>{isMuted ? 'SFX Muted' : 'SFX Active'}</span>}
        </button>

        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          <span className="collapse-arrow">{collapsed ? '→' : '←'}</span>
          {!collapsed && <span className="collapse-text">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  )
}
