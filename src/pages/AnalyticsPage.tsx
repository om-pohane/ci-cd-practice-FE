import { type FC } from 'react'
import type { Student } from '../types/student'
import {
  BookOpenIcon,
  DatabaseIcon,
  DownloadIcon,
  PrinterIcon,
  UsersIcon,
} from '../components/Icons'

interface AnalyticsPageProps {
  activeStudents: Student[]
  deletedStudents: Student[]
}

export const AnalyticsPage: FC<AnalyticsPageProps> = ({
  activeStudents,
  deletedStudents,
}) => {
  const total = activeStudents.length + deletedStudents.length

  // Course distribution
  const courseCounts: Record<string, number> = {}
  activeStudents.forEach((s) => {
    const c = s.course || 'Unassigned'
    courseCounts[c] = (courseCounts[c] || 0) + 1
  })
  const sortedCourses = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])

  // Age brackets
  const ageBrackets = {
    'Under 20': 0,
    '20 - 22': 0,
    '23 - 25': 0,
    '26+': 0,
  }

  activeStudents.forEach((s) => {
    if (s.age < 20) ageBrackets['Under 20']++
    else if (s.age <= 22) ageBrackets['20 - 22']++
    else if (s.age <= 25) ageBrackets['23 - 25']++
    else ageBrackets['26+']++
  })

  // Export handlers
  const exportActiveCSV = () => {
    if (activeStudents.length === 0) return
    const headers = ['ID', 'Name', 'Email', 'Age', 'Course', 'Status']
    const rows = activeStudents.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      s.age,
      `"${s.course.replace(/"/g, '""')}"`,
      'Active',
    ])
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    downloadFile(csv, `active_students_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportActiveJSON = () => {
    const json = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeStudents, null, 2))
    downloadFile(json, `active_students_${new Date().toISOString().split('T')[0]}.json`)
  }

  const exportDeletedCSV = () => {
    if (deletedStudents.length === 0) return
    const headers = ['ID', 'Name', 'Email', 'Age', 'Course', 'Status']
    const rows = deletedStudents.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      s.age,
      `"${s.course.replace(/"/g, '""')}"`,
      'Soft-Deleted',
    ])
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    downloadFile(csv, `deleted_students_archive_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const downloadFile = (uri: string, filename: string) => {
    const link = document.createElement('a')
    link.setAttribute('href', uri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="page-container analytics-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports &amp; Analytics Studio</h1>
          <p className="page-subtitle">
            Demographic insights, program participation rates, and data export tools.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          <PrinterIcon size={15} />
          <span>Print Summary</span>
        </button>
      </div>

      {/* Main Analytics Grid */}
      <div className="analytics-grid">
        {/* Course distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <BookOpenIcon size={20} />
            <h3>Active Program Distribution</h3>
          </div>
          {sortedCourses.length === 0 ? (
            <p className="analytics-empty">No active student data available</p>
          ) : (
            <div className="bar-list">
              {sortedCourses.map(([courseName, count]) => {
                const percentage =
                  activeStudents.length > 0
                    ? Math.round((count / activeStudents.length) * 100)
                    : 0

                return (
                  <div key={courseName} className="bar-item">
                    <div className="bar-label-row">
                      <span className="bar-label-name">{courseName}</span>
                      <span className="bar-label-val">
                        {count} {count === 1 ? 'student' : 'students'} ({percentage}%)
                      </span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Age Demographics */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <UsersIcon size={20} />
            <h3>Age Demographics</h3>
          </div>
          {activeStudents.length === 0 ? (
            <p className="analytics-empty">No active student data available</p>
          ) : (
            <div className="bar-list">
              {Object.entries(ageBrackets).map(([bracket, count]) => {
                const percentage =
                  activeStudents.length > 0
                    ? Math.round((count / activeStudents.length) * 100)
                    : 0

                return (
                  <div key={bracket} className="bar-item">
                    <div className="bar-label-row">
                      <span className="bar-label-name">{bracket}</span>
                      <span className="bar-label-val">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill bar-fill-secondary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Database Ratio */}
      <div className="database-overview-card">
        <div className="analytics-card-header">
          <DatabaseIcon size={20} />
          <h3>Database Lifecycle Health</h3>
        </div>
        <p>
          Tracking <strong>{total}</strong> student records in MySQL:
        </p>
        <div className="status-ratio-bar">
          <div
            className="ratio-fill ratio-active"
            style={{
              width: total > 0 ? `${(activeStudents.length / total) * 100}%` : '0%',
            }}
            title={`Active: ${activeStudents.length}`}
          />
          <div
            className="ratio-fill ratio-deleted"
            style={{
              width: total > 0 ? `${(deletedStudents.length / total) * 100}%` : '0%',
            }}
            title={`Deleted: ${deletedStudents.length}`}
          />
        </div>
        <div className="ratio-legend">
          <span className="legend-item">
            <span className="legend-dot dot-active" /> Active Directory ({activeStudents.length})
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-deleted" /> Soft-Deleted Archive ({deletedStudents.length})
          </span>
        </div>
      </div>

      {/* Data Export Center */}
      <div className="export-center-card">
        <div className="analytics-card-header">
          <DownloadIcon size={20} />
          <h3>Data Export &amp; Backup Studio</h3>
        </div>
        <p className="export-center-desc">
          Generate structured exports of your active students or archive records for reporting or backups.
        </p>

        <div className="export-buttons-grid">
          <div className="export-option-box">
            <h4>Active Students CSV</h4>
            <p>Comma-separated spreadsheet of all active records.</p>
            <button className="btn btn-primary btn-sm" onClick={exportActiveCSV}>
              <DownloadIcon size={14} />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="export-option-box">
            <h4>Active Students JSON</h4>
            <p>Complete JSON payload structured for API and programmatic usage.</p>
            <button className="btn btn-secondary btn-sm" onClick={exportActiveJSON}>
              <DownloadIcon size={14} />
              <span>Download JSON</span>
            </button>
          </div>

          <div className="export-option-box">
            <h4>Archive / Recycle Bin CSV</h4>
            <p>Export all soft-deleted records for auditing.</p>
            <button className="btn btn-ghost btn-sm" onClick={exportDeletedCSV}>
              <DownloadIcon size={14} />
              <span>Export Archive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
