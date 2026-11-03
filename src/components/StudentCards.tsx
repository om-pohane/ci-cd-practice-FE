import type { FC } from 'react'
import type { Student } from '../types/student'
import { EditIcon, EyeIcon, MailIcon, RestoreIcon, TrashIcon } from './Icons'

interface StudentCardsProps {
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

export const StudentCards: FC<StudentCardsProps> = ({
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
    <div className="cards-grid">
      {students.map((student) => {
        const initials = getInitials(student.name)
        const bg = getAvatarBg(student.name)

        return (
          <div
            key={student.id}
            className={`student-card ${student.deleted ? 'card-deleted' : ''}`}
          >
            <div className="card-top-row">
              <div className="avatar-circle" style={{ backgroundColor: bg }}>
                {initials}
              </div>
              <div className="card-top-badges">
                <span className="id-badge">#{student.id}</span>
                {student.deleted ? (
                  <span className="status-tag status-tag-deleted">Deleted</span>
                ) : (
                  <span className="status-tag status-tag-active">Active</span>
                )}
              </div>
            </div>

            <div className="card-body">
              <h4 className="card-student-name" title={student.name}>
                {student.name}
              </h4>

              <a
                href={`mailto:${student.email}`}
                className="card-email-link"
                title={student.email}
              >
                <MailIcon size={13} />
                <span>{student.email}</span>
              </a>

              <div className="card-meta-row">
                <span className="course-pill">{student.course || 'Unassigned'}</span>
                <span className="age-pill">{student.age} yrs</span>
              </div>
            </div>

            <div className="card-footer">
              <button
                className="btn-action btn-action-view"
                onClick={() => onView(student)}
                title="View student profile"
              >
                <EyeIcon size={14} />
                <span>View</span>
              </button>

              {!isRecycleBin && (
                <button
                  className="btn-action btn-action-edit"
                  onClick={() => onEdit(student)}
                  title="Edit student"
                >
                  <EditIcon size={14} />
                  <span>Edit</span>
                </button>
              )}

              {!isRecycleBin ? (
                <button
                  className="btn-action btn-action-delete"
                  onClick={() => onDelete(student)}
                  title="Delete student"
                >
                  <TrashIcon size={14} />
                  <span>Delete</span>
                </button>
              ) : (
                onRestore && (
                  <button
                    className="btn-action btn-action-restore"
                    onClick={() => onRestore(student)}
                    title="Restore student"
                  >
                    <RestoreIcon size={14} />
                    <span>Restore</span>
                  </button>
                )
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
