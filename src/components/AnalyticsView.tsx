import type { FC } from 'react'
import type { Student } from '../types/student'
import { BookOpenIcon, UsersIcon } from './Icons'

interface AnalyticsViewProps {
  activeStudents: Student[]
  deletedStudents: Student[]
  onFilterByCourse: (course: string) => void
}

export const AnalyticsView: FC<AnalyticsViewProps> = ({
  activeStudents,
  deletedStudents,
  onFilterByCourse,
}) => {
  const total = activeStudents.length + deletedStudents.length

  // Course counts
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

  return (
    <div className="analytics-view">
      <div className="analytics-grid">
        {/* Course distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <BookOpenIcon size={20} />
            <h3>Active Course Distribution</h3>
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
                  <div
                    key={courseName}
                    className="bar-item"
                    onClick={() => onFilterByCourse(courseName)}
                    title={`Click to filter active directory by ${courseName}`}
                    style={{ cursor: 'pointer' }}
                  >
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

      {/* Database Overview */}
      <div className="database-overview-card">
        <h3>Database Status Summary</h3>
        <p>
          Currently tracking <strong>{total}</strong> total student records in the MySQL database:
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
            <span className="legend-dot dot-active" /> Active ({activeStudents.length})
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-deleted" /> Soft Deleted ({deletedStudents.length})
          </span>
        </div>
      </div>
    </div>
  )
}
