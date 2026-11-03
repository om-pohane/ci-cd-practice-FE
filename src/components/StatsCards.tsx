import type { FC } from 'react'
import type { Student } from '../types/student'
import { BookOpenIcon, DatabaseIcon, TrashIcon, UsersIcon } from './Icons'

interface StatsCardsProps {
  activeStudents: Student[]
  deletedStudents: Student[]
  onSelectTab: (tab: 'active' | 'deleted' | 'analytics') => void
  currentTab: string
}

export const StatsCards: FC<StatsCardsProps> = ({
  activeStudents,
  deletedStudents,
  onSelectTab,
  currentTab,
}) => {
  const activeCount = activeStudents.length
  const deletedCount = deletedStudents.length

  const uniqueCourses = new Set(
    activeStudents.map((s) => s.course).filter(Boolean),
  ).size

  const avgAge =
    activeCount > 0
      ? (activeStudents.reduce((acc, s) => acc + (s.age || 0), 0) / activeCount).toFixed(1)
      : '0'

  return (
    <div className="stats-grid">
      <div
        className={`stat-card stat-clickable ${currentTab === 'active' ? 'stat-active' : ''}`}
        onClick={() => onSelectTab('active')}
        role="button"
        tabIndex={0}
      >
        <div className="stat-icon-wrap stat-icon-primary">
          <UsersIcon size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Active Students</span>
          <div className="stat-value-row">
            <span className="stat-number">{activeCount}</span>
            <span className="stat-badge">Enrolled</span>
          </div>
        </div>
      </div>

      <div
        className={`stat-card stat-clickable ${currentTab === 'deleted' ? 'stat-active' : ''}`}
        onClick={() => onSelectTab('deleted')}
        role="button"
        tabIndex={0}
      >
        <div className="stat-icon-wrap stat-icon-danger">
          <TrashIcon size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Recycle Bin</span>
          <div className="stat-value-row">
            <span className="stat-number">{deletedCount}</span>
            <span className="stat-badge stat-badge-soft">Soft-Deleted</span>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-info">
          <BookOpenIcon size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Active Courses</span>
          <div className="stat-value-row">
            <span className="stat-number">{uniqueCourses}</span>
            <span className="stat-badge stat-badge-info">Programs</span>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrap stat-icon-warning">
          <DatabaseIcon size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Average Age</span>
          <div className="stat-value-row">
            <span className="stat-number">{avgAge}</span>
            <span className="stat-badge stat-badge-warning">Years</span>
          </div>
        </div>
      </div>
    </div>
  )
}
