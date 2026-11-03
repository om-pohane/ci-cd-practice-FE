import type { FC } from 'react'
import type { Student } from '../types/student'
import { EditIcon, EyeIcon, MailIcon, RestoreIcon, TrashIcon } from './Icons'

interface StudentTableProps {
  students: Student[]
  isRecycleBin?: boolean
  onView: (student: Student) => void
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
  onRestore?: (student: Student) => void
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  '#4f46e5', '#2563eb', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#7c3aed', '#db2777',
]

function getAvatarBg(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export const StudentTable: FC<StudentTableProps> = ({
  students,
  isRecycleBin = false,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          {isRecycleBin ? <TrashIcon size={36} /> : <EyeIcon size={36} />}
        </div>
        <h3 className="empty-state-title">
          {isRecycleBin ? 'Recycle Bin is Empty' : 'No Students Found'}
        </h3>
        <p className="empty-state-desc">
          {isRecycleBin
            ? 'Deleted students will appear here. You can restore them anytime.'
            : 'Try adjusting your search filters or click "Add Student" above.'}
        </p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>ID</th>
            <th>Student</th>
            <th>Email</th>
            <th style={{ width: '90px' }}>Age</th>
            <th>Course</th>
            <th style={{ width: '110px' }}>Status</th>
            <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const initials = getInitials(student.name)
            const bg = getAvatarBg(student.name)

            return (
              <tr key={student.id} className={student.deleted ? 'row-deleted' : ''}>
                <td>
                  <span className="id-badge">#{student.id}</span>
                </td>
                <td>
                  <div className="student-profile-cell">
                    <div
                      className="avatar-circle"
                      style={{ backgroundColor: bg }}
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                    <div className="student-name-group">
                      <span className="student-name">{student.name}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <a
                    href={`mailto:${student.email}`}
                    className="student-email-link"
                    title={`Send email to ${student.email}`}
                  >
                    <MailIcon size={14} />
                    <span>{student.email}</span>
                  </a>
                </td>
                <td>
                  <span className="age-pill">{student.age} yrs</span>
                </td>
                <td>
                  <span className="course-pill">{student.course || 'Unassigned'}</span>
                </td>
                <td>
                  {student.deleted ? (
                    <span className="status-tag status-tag-deleted">Deleted</span>
                  ) : (
                    <span className="status-tag status-tag-active">Active</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-action btn-action-view"
                      onClick={() => onView(student)}
                      title="View student profile"
                      aria-label="View details"
                    >
                      <EyeIcon size={15} />
                    </button>

                    {!isRecycleBin && (
                      <button
                        className="btn-action btn-action-edit"
                        onClick={() => onEdit(student)}
                        title="Edit student"
                        aria-label="Edit student"
                      >
                        <EditIcon size={15} />
                      </button>
                    )}

                    {!isRecycleBin ? (
                      <button
                        className="btn-action btn-action-delete"
                        onClick={() => onDelete(student)}
                        title="Soft delete student"
                        aria-label="Delete student"
                      >
                        <TrashIcon size={15} />
                      </button>
                    ) : (
                      onRestore && (
                        <button
                          className="btn-action btn-action-restore"
                          onClick={() => onRestore(student)}
                          title="Restore student"
                          aria-label="Restore student"
                        >
                          <RestoreIcon size={15} />
                          <span style={{ fontSize: '12px', marginLeft: '4px' }}>Restore</span>
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
