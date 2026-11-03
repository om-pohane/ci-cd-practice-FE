import type { FC } from 'react'
import type { Student } from '../types/student'
import { CloseIcon, EditIcon, GraduationCapIcon, MailIcon, RestoreIcon, TrashIcon } from './Icons'

interface StudentDetailModalProps {
  isOpen: boolean
  student: Student | null
  onClose: () => void
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
  onRestore: (student: Student) => void
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const StudentDetailModal: FC<StudentDetailModalProps> = ({
  isOpen,
  student,
  onClose,
  onEdit,
  onDelete,
  onRestore,
}) => {
  if (!isOpen || !student) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card modal-detail-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon">
            <GraduationCapIcon size={22} />
          </div>
          <div>
            <h2 className="modal-title">Student Profile</h2>
            <p className="modal-subtitle">Database Record ID #{student.id}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="detail-modal-body">
          <div className="detail-hero">
            <div className="avatar-circle avatar-large">
              {getInitials(student.name)}
            </div>
            <div className="detail-hero-info">
              <h3 className="detail-student-name">{student.name}</h3>
              <div className="detail-badges-row">
                <span className="id-badge">ID #{student.id}</span>
                {student.deleted ? (
                  <span className="status-tag status-tag-deleted">Deleted</span>
                ) : (
                  <span className="status-tag status-tag-active">Active</span>
                )}
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-field-label">Email Address</span>
              <a
                href={`mailto:${student.email}`}
                className="detail-field-value detail-link"
              >
                <MailIcon size={15} />
                <span>{student.email}</span>
              </a>
            </div>

            <div className="detail-field">
              <span className="detail-field-label">Enrolled Course</span>
              <span className="detail-field-value course-pill">
                {student.course || 'Unassigned'}
              </span>
            </div>

            <div className="detail-field">
              <span className="detail-field-label">Age</span>
              <span className="detail-field-value">{student.age} years old</span>
            </div>

            <div className="detail-field">
              <span className="detail-field-label">Status</span>
              <span className="detail-field-value">
                {student.deleted ? 'Soft-deleted in Recycle Bin' : 'Active Student'}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          {!student.deleted ? (
            <>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => {
                  onClose()
                  onEdit(student)
                }}
              >
                <EditIcon size={16} />
                <span>Edit Profile</span>
              </button>
              <button
                className="btn btn-danger btn-icon"
                onClick={() => {
                  onClose()
                  onDelete(student)
                }}
              >
                <TrashIcon size={16} />
                <span>Soft Delete</span>
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-icon"
              onClick={() => {
                onClose()
                onRestore(student)
              }}
            >
              <RestoreIcon size={16} />
              <span>Restore to Active</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
