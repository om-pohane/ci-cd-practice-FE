import { useState, type FC } from 'react'
import { sound } from '../utils/sound'

interface NamePromptModalProps {
  isOpen: boolean
  currentName: string
  onSaveName: (name: string) => void
  onClose?: () => void
}

const FUN_NICKNAMES = ['Chintu', 'Sonu', 'Guddu', 'Sweety', 'Bunty', 'Rani', 'Bittu']

export const NamePromptModal: FC<NamePromptModalProps> = ({
  isOpen,
  currentName,
  onSaveName,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(currentName)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    sound.playDiya()
    onSaveName(trimmed)
  }

  const handlePickRandom = (nick: string) => {
    setNameInput(nick)
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog festive-modal name-modal-box">
        <div className="name-modal-header">
          <span className="name-modal-icon">🪔</span>
          <h3 className="name-modal-title">Namaste! What's Your Name?</h3>
          <p className="name-modal-desc">
            Mummy needs your name so she can track your <strong>Ghar Ki Safai</strong> score
            and keep your Diwali Kaju Katlis safe!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="name-modal-form">
          <div className="name-input-wrap">
            <span className="input-prefix-icon">👤</span>
            <input
              type="text"
              className="name-field-input"
              placeholder="Enter your name (e.g. Sneha, Ayush, Rohan)..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              required
              maxLength={30}
            />
          </div>

          {/* Quick Nicknames */}
          <div className="quick-nicks-row">
            <span className="quick-label">Or pick a desi nickname:</span>
            <div className="quick-nicks-chips">
              {FUN_NICKNAMES.map((nick) => (
                <button
                  type="button"
                  key={nick}
                  className="nick-chip"
                  onClick={() => handlePickRandom(nick)}
                >
                  {nick}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-start-with-name"
            disabled={!nameInput.trim()}
          >
            <span>✨ Start Safai Mission! 🧹</span>
          </button>

          {onClose && (
            <button type="button" className="btn-cancel-name" onClick={onClose}>
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
