import type { FC, ReactNode } from 'react'
import {
  BarChartIcon,
  BookOpenIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  TrashIcon,
  UserPlusIcon,
  UsersIcon,
} from './Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'

interface SidebarProps {
  activeCount: number
  deletedCount: number
  courseCount: number
  collapsed: boolean
  onToggleCollapse: () => void
}

interface NavItem {
  label: string
  path: string
  icon: ReactNode
  badge?: number
  badgeType?: 'primary' | 'danger' | 'info'
}

export const Sidebar: FC<SidebarProps> = ({
  activeCount,
  deletedCount,
  courseCount,
  collapsed,
  onToggleCollapse,
}) => {
  const { path } = useRouter()

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <LayoutDashboardIcon size={18} />,
    },
    {
      label: 'Students',
      path: '/students',
      icon: <UsersIcon size={18} />,
      badge: activeCount,
      badgeType: 'primary',
    },
    {
      label: 'Register New',
      path: '/students/new',
      icon: <UserPlusIcon size={18} />,
    },
    {
      label: 'Courses',
      path: '/courses',
      icon: <BookOpenIcon size={18} />,
      badge: courseCount,
      badgeType: 'info',
    },
    {
      label: 'Recycle Bin',
      path: '/recycle-bin',
      icon: <TrashIcon size={18} />,
      badge: deletedCount,
      badgeType: 'danger',
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: <BarChartIcon size={18} />,
    },
    {
      label: 'Settings & API',
      path: '/settings',
      icon: <SettingsIcon size={18} />,
    },
  ]

  const isActive = (itemPath: string) => {
    if (itemPath === '/') return path === '/' || path === ''
    return path.startsWith(itemPath)
  }

  return (
    <aside className={`app-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <div className="sidebar-logo">
            <GraduationCapIcon size={22} />
          </div>
          {!collapsed && (
            <div className="sidebar-title-wrap">
              <span className="sidebar-title">EduPortal</span>
              <span className="sidebar-subtitle">Spring + React CRUD</span>
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
                    <span
                      className={`sidebar-badge sidebar-badge-${item.badgeType || 'primary'}`}
                    >
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
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          <span className="collapse-arrow">{collapsed ? '→' : '←'}</span>
          {!collapsed && <span className="collapse-text">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  )
}
