import { useState, type FC, useMemo } from 'react'
import type { Student } from '../types/student'
import {
  CloseIcon,
  EyeIcon,
  RefreshIcon,
  RestoreIcon,
  SearchIcon,
  TrashIcon,
} from '../components/Icons'
import { Link } from '../router/Router'

interface RecycleBinPageProps {
  deletedStudents: Student[]
  onRestoreStudent: (student: Student) => Promise<void>
  onRefresh: () => void
}

export const RecycleBinPage: FC<RecycleBinPageProps> = ({
  deletedStudents,
  onRestoreStudent,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [isRestoringAll, setIsRestoringAll] = useState(false)

  const filteredDeleted = useMemo(() => {
    if (!searchQuery.trim()) return deletedStudents
    const q = searchQuery.toLowerCase().trim()
    return deletedStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.id.toString() === q,
    )
  }, [deletedStudents, searchQuery])

  const handleRestore = async (student: Student) => {
    setRestoringId(student.id)
    try {
      await onRestoreStudent(student)
    } finally {
      setRestoringId(null)
    }
  }

  const handleRestoreAll = async () => {
    if (deletedStudents.length === 0) return
    setIsRestoringAll(true)
    try {
      for (const s of deletedStudents) {
        await onRestoreStudent(s)
      }
    } finally {
      setIsRestoringAll(false)
    }
  }

  return (
    <div className="page-container recycle-bin-page">
      <div className="page-header">
        <div>
          <div className="header-badge-row">
            <h1 className="page-title">Recycle Bin &amp; Archive</h1>
            <span className="badge badge-danger">
              {deletedStudents.length} Archived
            </span>
          </div>
          <p className="page-subtitle">
            Records are soft-deleted from the database (<code>deleted = true</code>). You can restore
            them back to the active directory at any time.
          </p>
        </div>

        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
            <RefreshIcon size={14} />
            <span>Refresh</span>
          </button>
          {deletedStudents.length > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleRestoreAll}
              disabled={isRestoringAll}
            >
              <RestoreIcon size={14} />
              <span>{isRestoringAll ? 'Restoring All...' : 'Restore All Records'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="filter-row">
          <div className="search-input-wrap">
            <SearchIcon size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search deleted records by name, email, course, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Deleted Table */}
      {filteredDeleted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <TrashIcon size={36} />
          </div>
          <h3 className="empty-state-title">Recycle Bin is Empty</h3>
          <p className="empty-state-desc">
            All students are currently active. When you delete a student, they will safely appear here
            where you can restore them.
          </p>
          <div className="empty-actions" style={{ marginTop: '16px' }}>
            <Link to="/students" className="btn btn-primary btn-sm">
              View Active Students
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Student</th>
                <th>Email</th>
                <th>Age</th>
                <th>Course</th>
                <th>Status</th>
                <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeleted.map((student) => (
                <tr key={student.id} className="row-deleted">
                  <td><span className="id-badge">#{student.id}</span></td>
                  <td>
                    <span className="student-name">{student.name}</span>
                  </td>
                  <td>{student.email}</td>
                  <td><span className="age-pill">{student.age} yrs</span></td>
                  <td><span className="course-pill">{student.course}</span></td>
                  <td>
                    <span className="status-tag status-tag-deleted">Soft-Deleted</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions">
                      <Link
                        to={`/students/${student.id}`}
                        className="btn-action btn-action-view"
                        title="View Dossier"
                      >
                        <EyeIcon size={14} />
                      </Link>

                      <button
                        className="btn-action btn-action-restore"
                        onClick={() => handleRestore(student)}
                        disabled={restoringId === student.id || isRestoringAll}
                        title="Restore student to active directory"
                      >
                        <RestoreIcon size={14} />
                        <span>
                          {restoringId === student.id ? 'Restoring...' : 'Restore'}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
