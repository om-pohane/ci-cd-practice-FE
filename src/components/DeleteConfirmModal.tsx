import type { FC } from 'react'
import type { Student } from '../types/student'
import { AlertTriangleIcon, CloseIcon, TrashIcon } from './Icons'

interface DeleteConfirmModalProps {
  isOpen: boolean
  student: Student | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  isOpen,
  student,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !student) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card modal-confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon modal-header-icon-danger">
            <AlertTriangleIcon size={22} />
          </div>
          <div>
            <h2 className="modal-title">Soft Delete Student?</h2>
            <p className="modal-subtitle">Confirm removal of record #{student.id}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-confirm-body">
          <p>
            Are you sure you want to delete <strong>{student.name}</strong> (
            <code>{student.email}</code>)?
          </p>
          <div className="confirm-notice">
            <p>
              <strong>Note:</strong> This backend uses <em>soft deletion</em>. The record will not
              be permanently removed from the MySQL database; it will be marked as deleted and can
              be restored anytime from the <strong>Recycle Bin</strong>.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger btn-icon"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <TrashIcon size={16} />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Soft Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
