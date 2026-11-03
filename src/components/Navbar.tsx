import type { FC } from 'react'
import { GraduationCapIcon, RefreshIcon, UserPlusIcon } from './Icons'

interface NavbarProps {
  backendConnected: boolean | null
  checkingConnection: boolean
  onRefresh: () => void
  onOpenCreateModal: () => void
}

export const Navbar: FC<NavbarProps> = ({
  backendConnected,
  checkingConnection,
  onRefresh,
  onOpenCreateModal,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <GraduationCapIcon size={26} />
          </div>
          <div className="navbar-title-wrap">
            <h1 className="navbar-title">Student Portal</h1>
            <span className="navbar-subtitle">Spring Boot &amp; React CRUD</span>
          </div>
        </div>

        <div className="navbar-actions">
          <div
            className={`connection-status ${
              backendConnected === true
                ? 'status-online'
                : backendConnected === false
                ? 'status-offline'
                : 'status-checking'
            }`}
            title={
              backendConnected === true
                ? 'Backend API connected (http://localhost:8080)'
                : 'Backend API unavailable. Check if Spring Boot is running.'
            }
          >
            <span className="status-dot" />
            <span className="status-text">
              {checkingConnection
                ? 'Checking...'
                : backendConnected === true
                ? 'API Online'
                : 'API Offline'}
            </span>
          </div>

          <button
            className="btn btn-secondary btn-icon"
            onClick={onRefresh}
            title="Refresh student list"
            aria-label="Refresh data"
          >
            <RefreshIcon size={16} />
            <span className="btn-text">Refresh</span>
          </button>

          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <UserPlusIcon size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>
    </header>
  )
}
