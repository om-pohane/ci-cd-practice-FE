import { useState, type FC } from 'react'
import { api } from '../services/api'
import { sound } from '../utils/sound'

interface CreateWishModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (wishCode: string, from: string, to: string) => void
}

const PRESET_MESSAGES = [
  'May this Diwali bring infinite happiness, health, and prosperity to you and your family! ✨',
  'May your annual package be 10x higher than Sharma Ji ke bete ka, and your Diwali 100% free of Soan Papdi! 📦🚫',
  'Eat all the Kaju Katli you want today without anyone judging! Shubh Deepavali mere bhai! 🍬🪔',
  'Wishing you explosive joy, glittering success, and zero flying chappals in the new year ahead! 👡🚀',
]

export const CreateWishModal: FC<CreateWishModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [fromName, setFromName] = useState('')
  const [toName, setToName] = useState('')
  const [customMessage, setCustomMessage] = useState(PRESET_MESSAGES[0])
  const [targetScore, setTargetScore] = useState(1200)
  const [generatedLink, setGeneratedLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!toName.trim()) return

    setIsLoading(true)
    try {
      const wish = await api.diwali.createWish({
        fromName: fromName.trim() || 'Om',
        toName: toName.trim(),
        customMessage: customMessage.trim(),
        targetScore,
      })

      const origin = window.location.origin
      const link = `${origin}/?code=${wish.wishCode}&to=${encodeURIComponent(
        wish.toName,
      )}&from=${encodeURIComponent(wish.fromName)}`
      setGeneratedLink(link)
      sound.playDiya()
      onCreated(wish.wishCode, wish.fromName, wish.toName)
    } catch {
      // Local fallback link if backend offline
      const origin = window.location.origin
      const link = `${origin}/?to=${encodeURIComponent(
        toName.trim(),
      )}&from=${encodeURIComponent(fromName.trim() || 'Om')}`
      setGeneratedLink(link)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (navigator.clipboard && generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleWhatsApp = () => {
    if (!generatedLink) return
    const text = `🪔 Hey ${toName || 'Dost'}! Mummy told you to do Ghar Ki Safai before Diwali puja! I made an interactive Diwali game & surprise wish for you. Tap to play: ${generatedLink}`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog festive-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-festive-icon">🪔</span>
            <h3>Send a Diwali Wish to a Friend</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {!generatedLink ? (
          <form onSubmit={handleGenerate} className="wish-form">
            <div className="form-group">
              <label className="form-label" htmlFor="from-name">
                Your Name (Sender)
              </label>
              <input
                id="from-name"
                type="text"
                className="form-input"
                placeholder="e.g. Om"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="to-name">
                Friend's Name (Recipient) *
              </label>
              <input
                id="to-name"
                type="text"
                className="form-input"
                placeholder="e.g. Rahul, Sneha, Ayush"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                required
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="custom-msg">
                Festive Wish / Funny Roast
              </label>
              <textarea
                id="custom-msg"
                className="form-textarea"
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                maxLength={300}
              />
              {/* Presets */}
              <div className="preset-chips-row">
                <span className="chips-label">Presets:</span>
                {PRESET_MESSAGES.map((msg, i) => (
                  <button
                    type="button"
                    key={i}
                    className="preset-chip"
                    onClick={() => setCustomMessage(msg)}
                  >
                    #{i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="target-score">
                Target Score Challenge (pts)
              </label>
              <input
                id="target-score"
                type="number"
                className="form-input"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                min={500}
                max={5000}
                step={100}
              />
            </div>

            <button
              type="submit"
              className="btn-festive-submit"
              disabled={isLoading || !toName.trim()}
            >
              {isLoading ? 'Creating Festive Surprise...' : '✨ Generate Diwali Link ✨'}
            </button>
          </form>
        ) : (
          <div className="link-ready-box">
            <div className="ready-icon">🎉</div>
            <h4>Your Diwali Wish Link is Ready!</h4>
            <p className="ready-desc">
              Send this link to <strong>{toName}</strong>. When they open it, they will play
              Ghar Ki Safai and unlock your customized Diwali card!
            </p>

            <div className="link-copy-field">
              <input type="text" readOnly value={generatedLink} className="link-input" />
              <button type="button" className="btn-copy" onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <div className="link-action-buttons">
              <button
                type="button"
                className="btn-whatsapp-large"
                onClick={handleWhatsApp}
              >
                <span>📲 Send Directly via WhatsApp</span>
              </button>

              <button
                type="button"
                className="btn-create-another"
                onClick={() => {
                  setGeneratedLink('')
                  setToName('')
                }}
              >
                <span>+ Make Another Wish</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
