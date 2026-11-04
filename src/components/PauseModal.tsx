import type { FC } from 'react'

interface PauseModalProps {
  isOpen: boolean
  onResume: () => void
  onRestart: () => void
  onOpenSettings: () => void
  onQuitToMenu: () => void
}

export const PauseModal: FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onOpenSettings,
  onQuitToMenu,
}) => {
  if (!isOpen) return null

  return (
    <div className="pause-overlay">
      <div className="pause-modal-card">
        <div className="pause-header">
          <span className="pause-icon">⏸️</span>
          <h2 className="pause-title">GAME PAUSED</h2>
          <p className="pause-subtitle">"Mummy is taking a sip of chai... hurry back!"</p>
        </div>

        <div className="pause-menu-actions">
          <button
            type="button"
            className="btn-pause-action btn-resume"
            onClick={onResume}
          >
            ▶ RESUME SAFAI (SPACE)
          </button>

          <button
            type="button"
            className="btn-pause-action btn-restart"
            onClick={onRestart}
          >
            🔄 RESTART ROOM
          </button>

          <button
            type="button"
            className="btn-pause-action btn-settings"
            onClick={onOpenSettings}
          >
            ⚙️ AUDIO &amp; SETTINGS
          </button>

          <button
            type="button"
            className="btn-pause-action btn-quit"
            onClick={onQuitToMenu}
          >
            🏠 MAIN MENU
          </button>
        </div>

        <div className="pause-controls-hint">
          <span>💡 Press <strong>SPACE</strong> or tap Resume to continue playing.</span>
        </div>
      </div>
    </div>
  )
}
