import { useState, type FC } from 'react'
import { sound } from '../utils/sound'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [sfx, setSfx] = useState(sound.isSfxEnabled())
  const [music, setMusic] = useState(sound.isMusicEnabled())
  const [vibration, setVibration] = useState(sound.isVibrationEnabled())

  if (!isOpen) return null

  const handleToggleSfx = () => {
    const next = !sfx
    sound.setSfxEnabled(next)
    setSfx(next)
    if (next) sound.playCoin()
  }

  const handleToggleMusic = () => {
    const next = !music
    sound.setMusicEnabled(next)
    setMusic(next)
  }

  const handleToggleVibration = () => {
    const next = !vibration
    sound.setVibrationEnabled(next)
    setVibration(next)
    if (next) sound.triggerVibration(50)
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal-card">
        <div className="settings-header">
          <div className="settings-title-row">
            <span className="settings-gear">⚙️</span>
            <h2 className="settings-title">ARCADE SETTINGS</h2>
          </div>
          <button
            type="button"
            className="btn-close-settings"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Toggles List */}
        <div className="settings-toggles-list">
          {/* Sound Effects */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">🔊 Sound Effects (SFX)</span>
              <span className="setting-desc">Sweeping, coin chimes, chappal bonks</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${sfx ? 'switch-on' : 'switch-off'}`}
              onClick={handleToggleSfx}
            >
              {sfx ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 8-Bit Diwali BGM */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">🎵 8-Bit Festive Music</span>
              <span className="setting-desc">Original synthesized Diwali retro melody</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${music ? 'switch-on' : 'switch-off'}`}
              onClick={handleToggleMusic}
            >
              {music ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Haptic Vibration */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">📳 Mobile Vibration</span>
              <span className="setting-desc">Tactile buzz on chappal hit &amp; buttons</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${vibration ? 'switch-on' : 'switch-off'}`}
              onClick={handleToggleVibration}
            >
              {vibration ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* How to Play Summary */}
        <div className="settings-how-to-play">
          <h4 className="how-title">🎮 CONTROLS &amp; TIPS</h4>
          <ul className="tips-list">
            <li><strong>Desktop:</strong> Use Arrow Keys (← / →) or A / D to sweep. Press <strong>Space</strong> to pause.</li>
            <li><strong>Mobile:</strong> Drag your finger directly across the floor or tap the ◀ / ▶ buttons.</li>
            <li><strong>Kaju Katli:</strong> Gives you 4 seconds of super-speed!</li>
            <li><strong>Mummy's Anger:</strong> Clear dust quickly to keep Mummy happy; if anger hits 100%, chappals fall twice as fast!</li>
          </ul>
        </div>

        <button
          type="button"
          className="btn-done-settings"
          onClick={onClose}
        >
          ✓ SAVE &amp; CLOSE
        </button>
      </div>
    </div>
  )
}
