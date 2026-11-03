import type { FC } from 'react'
import type { Toast } from '../types/student'
import { AlertCircleIcon, AlertTriangleIcon, CheckIcon, CloseIcon } from './Icons'

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export const ToastContainer: FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        let icon = <CheckIcon size={18} />
        if (toast.type === 'error') icon = <AlertCircleIcon size={18} />
        else if (toast.type === 'warning') icon = <AlertTriangleIcon size={18} />

        return (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <div className="toast-icon">{icon}</div>
            <div className="toast-content">
              <strong className="toast-title">{toast.title}</strong>
              <p className="toast-message">{toast.message}</p>
            </div>
            <button
              className="toast-close-btn"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
