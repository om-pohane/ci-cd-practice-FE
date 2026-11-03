import type { FC } from 'react'
import { AlertCircleIcon, RefreshIcon } from './Icons'

interface BackendOfflineBannerProps {
  onRetry: () => void
  isRetrying: boolean
}

export const BackendOfflineBanner: FC<BackendOfflineBannerProps> = ({
  onRetry,
  isRetrying,
}) => {
  return (
    <div className="offline-banner" role="alert">
      <div className="offline-banner-icon">
        <AlertCircleIcon size={24} />
      </div>
      <div className="offline-banner-content">
        <h4 className="offline-banner-title">Arena Server Disconnected</h4>
        <p className="offline-banner-text">
          Could not communicate with the BotClash Spring Boot server at{' '}
          <code>http://localhost:8080/api/bots</code>.
        </p>
        <div className="offline-troubleshoot">
          <span>Quick check:</span>
          <ol>
            <li>
              Make sure MySQL is running on <code>localhost:3306</code> with schema{' '}
              <code>student_db</code>.
            </li>
            <li>
              In <code>Practice-2</code>, start the Spring Boot server with{' '}
              <code>./mvnw spring-boot:run</code>.
            </li>
          </ol>
        </div>
      </div>
      <div className="offline-banner-action">
        <button
          className="btn btn-primary btn-sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshIcon size={14} />
          <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  )
}
