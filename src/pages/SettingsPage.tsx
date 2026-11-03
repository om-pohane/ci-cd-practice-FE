import { useState, type FC } from 'react'
import { api } from '../services/api'
import { useTheme } from '../context/useTheme'
import {
  DatabaseIcon,
  MoonIcon,
  PlayIcon,
  RefreshIcon,
  SettingsIcon,
  SunIcon,
} from '../components/Icons'

interface SettingsPageProps {
  backendConnected: boolean | null
  checkingConnection: boolean
  onRecheckConnection: () => Promise<void>
}

type EndpointKey =
  | 'GET_ALL'
  | 'GET_BY_ID'
  | 'SEARCH_COURSE'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'GET_DELETED'
  | 'RESTORE'

export const SettingsPage: FC<SettingsPageProps> = ({
  backendConnected,
  checkingConnection,
  onRecheckConnection,
}) => {
  const { theme, setTheme } = useTheme()

  // API Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointKey>('GET_ALL')
  const [paramId, setParamId] = useState('1')
  const [paramCourse, setParamCourse] = useState('Computer Science')
  const [payloadJson, setPayloadJson] = useState(
    JSON.stringify(
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        age: 22,
        course: 'Computer Science',
      },
      null,
      2,
    ),
  )

  const [apiResponse, setApiResponse] = useState<string>('')
  const [apiStatus, setApiStatus] = useState<number | null>(null)
  const [apiLatency, setApiLatency] = useState<number | null>(null)
  const [isExecutingApi, setIsExecutingApi] = useState(false)

  // Ping test
  const [pingLatency, setPingLatency] = useState<number | null>(null)
  const [isPinging, setIsPinging] = useState(false)

  const handlePingTest = async () => {
    setIsPinging(true)
    const start = performance.now()
    try {
      await onRecheckConnection()
      const end = performance.now()
      setPingLatency(Math.round(end - start))
    } catch {
      setPingLatency(null)
    } finally {
      setIsPinging(false)
    }
  }

  // Execute playground endpoint
  const handleExecuteEndpoint = async () => {
    setIsExecutingApi(true)
    setApiResponse('')
    setApiStatus(null)

    const start = performance.now()
    try {
      let result: unknown

      if (selectedEndpoint === 'GET_ALL') {
        result = await api.getAllStudents()
      } else if (selectedEndpoint === 'GET_BY_ID') {
        result = await api.getStudentById(Number(paramId))
      } else if (selectedEndpoint === 'SEARCH_COURSE') {
        result = await api.getStudentsByCourse(paramCourse)
      } else if (selectedEndpoint === 'CREATE') {
        const body = JSON.parse(payloadJson)
        result = await api.createStudent(body)
      } else if (selectedEndpoint === 'UPDATE') {
        const body = JSON.parse(payloadJson)
        result = await api.updateStudent(Number(paramId), body)
      } else if (selectedEndpoint === 'DELETE') {
        result = await api.deleteStudent(Number(paramId))
      } else if (selectedEndpoint === 'GET_DELETED') {
        result = await api.getDeletedStudents()
      } else if (selectedEndpoint === 'RESTORE') {
        result = await api.restoreStudent(Number(paramId))
      }

      const end = performance.now()
      setApiLatency(Math.round(end - start))
      setApiStatus(200)
      setApiResponse(typeof result === 'string' ? result : JSON.stringify(result, null, 2))
    } catch (err: unknown) {
      const end = performance.now()
      setApiLatency(Math.round(end - start))
      setApiStatus(500)
      setApiResponse(
        err instanceof Error
          ? err.message
          : 'Request failed. Ensure Spring Boot is running at http://localhost:8080.',
      )
    } finally {
      setIsExecutingApi(false)
    }
  }

  return (
    <div className="page-container settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings &amp; API Explorer</h1>
          <p className="page-subtitle">
            Diagnostic tools, live REST API tester for Spring Boot endpoints, and appearance preferences.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left Column: Diagnostics & Theme */}
        <div className="settings-left-col">
          {/* Diagnostics Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="card-header-title">
                <DatabaseIcon size={20} />
                <h3>Backend Health &amp; Diagnostics</h3>
              </div>
            </div>

            <div className="diagnostics-content">
              <div className="diagnostic-row">
                <span className="diag-label">Base URL:</span>
                <code>http://localhost:8080/api/student</code>
              </div>

              <div className="diagnostic-row">
                <span className="diag-label">Connection Status:</span>
                <span
                  className={`status-pill ${
                    backendConnected === true
                      ? 'pill-online'
                      : backendConnected === false
                      ? 'pill-offline'
                      : 'pill-checking'
                  }`}
                >
                  <span className="status-dot" />
                  <span>
                    {checkingConnection
                      ? 'Checking...'
                      : backendConnected === true
                      ? 'Connected'
                      : 'Offline'}
                  </span>
                </span>
              </div>

              {pingLatency !== null && (
                <div className="diagnostic-row">
                  <span className="diag-label">Round-Trip Latency:</span>
                  <span className="latency-val">{pingLatency} ms</span>
                </div>
              )}

              <button
                className="btn btn-secondary btn-sm diag-ping-btn"
                onClick={handlePingTest}
                disabled={isPinging || checkingConnection}
              >
                <RefreshIcon size={14} />
                <span>{isPinging ? 'Pinging...' : 'Ping Backend API'}</span>
              </button>
            </div>
          </div>

          {/* Theme Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="card-header-title">
                <SettingsIcon size={20} />
                <h3>Appearance &amp; Theme</h3>
              </div>
            </div>

            <div className="theme-toggle-row">
              <button
                className={`theme-box-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <SunIcon size={20} />
                <span>Light Mode</span>
              </button>

              <button
                className={`theme-box-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <MoonIcon size={20} />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive API Explorer */}
        <div className="settings-right-col">
          <div className="dashboard-card playground-card">
            <div className="dashboard-card-header">
              <div className="card-header-title">
                <PlayIcon size={20} />
                <h3>Interactive REST API Playground</h3>
              </div>
              <span className="playground-tag">Live Tester</span>
            </div>

            <p className="playground-desc">
              Execute requests directly against the Spring Boot backend controller and inspect responses.
            </p>

            <div className="playground-form">
              <div className="form-group">
                <label className="form-label" htmlFor="endpoint-select">Select Endpoint</label>
                <select
                  id="endpoint-select"
                  className="form-select"
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value as EndpointKey)}
                >
                  <option value="GET_ALL">GET /api/student (List Active)</option>
                  <option value="GET_BY_ID">GET /api/student/&#123;id&#125; (Get by ID)</option>
                  <option value="SEARCH_COURSE">GET /api/student/search?course=... (Search Course)</option>
                  <option value="CREATE">POST /api/student (Create Student)</option>
                  <option value="UPDATE">PUT /api/student/&#123;id&#125; (Update Student)</option>
                  <option value="DELETE">DELETE /api/student/&#123;id&#125; (Soft Delete)</option>
                  <option value="GET_DELETED">GET /api/student/deleted (List Recycle Bin)</option>
                  <option value="RESTORE">PUT /api/student/&#123;id&#125;/restore (Restore Student)</option>
                </select>
              </div>

              {/* Conditional ID parameter input */}
              {(selectedEndpoint === 'GET_BY_ID' ||
                selectedEndpoint === 'UPDATE' ||
                selectedEndpoint === 'DELETE' ||
                selectedEndpoint === 'RESTORE') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="param-id">Student ID</label>
                  <input
                    id="param-id"
                    type="number"
                    className="form-input"
                    value={paramId}
                    onChange={(e) => setParamId(e.target.value)}
                    placeholder="1"
                  />
                </div>
              )}

              {/* Conditional course query parameter */}
              {selectedEndpoint === 'SEARCH_COURSE' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="param-course">Course Name Query</label>
                  <input
                    id="param-course"
                    type="text"
                    className="form-input"
                    value={paramCourse}
                    onChange={(e) => setParamCourse(e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </div>
              )}

              {/* Conditional payload for POST/PUT */}
              {(selectedEndpoint === 'CREATE' || selectedEndpoint === 'UPDATE') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="payload-body">JSON Request Body</label>
                  <textarea
                    id="payload-body"
                    className="form-input code-textarea"
                    rows={6}
                    value={payloadJson}
                    onChange={(e) => setPayloadJson(e.target.value)}
                  />
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary playground-run-btn"
                onClick={handleExecuteEndpoint}
                disabled={isExecutingApi}
              >
                <PlayIcon size={14} />
                <span>{isExecutingApi ? 'Executing...' : 'Run Request'}</span>
              </button>
            </div>

            {/* Response Console */}
            {apiResponse && (
              <div className="playground-response">
                <div className="response-header">
                  <span className="response-title">API Response</span>
                  <div className="response-badges">
                    {apiStatus && (
                      <span
                        className={`badge ${apiStatus === 200 ? 'badge-success' : 'badge-danger'}`}
                      >
                        Status {apiStatus}
                      </span>
                    )}
                    {apiLatency !== null && (
                      <span className="badge badge-info">{apiLatency} ms</span>
                    )}
                  </div>
                </div>
                <pre className="response-json">
                  <code>{apiResponse}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
