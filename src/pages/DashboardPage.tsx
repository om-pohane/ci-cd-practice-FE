import { useState, type FC, type FormEvent } from 'react'
import type { Student, StudentInput } from '../types/student'
import {
  BookOpenIcon,
  DatabaseIcon,
  DownloadIcon,
  EyeIcon,
  GraduationCapIcon,
  TrashIcon,
  UserPlusIcon,
  UsersIcon,
} from '../components/Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'

interface DashboardPageProps {
  activeStudents: Student[]
  deletedStudents: Student[]
  availableCourses: string[]
  onCreateStudent: (data: StudentInput) => Promise<void>
}

export const DashboardPage: FC<DashboardPageProps> = ({
  activeStudents,
  deletedStudents,
  availableCourses,
  onCreateStudent,
}) => {
  const { navigate } = useRouter()
  const [quickName, setQuickName] = useState('')
  const [quickEmail, setQuickEmail] = useState('')
  const [quickAge, setQuickAge] = useState<string | number>('')
  const [quickCourse, setQuickCourse] = useState(availableCourses[0] || 'Computer Science')
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false)
  const [quickError, setQuickError] = useState('')

  const activeCount = activeStudents.length
  const deletedCount = deletedStudents.length
  const courseCount = availableCourses.length
  const avgAge =
    activeCount > 0
      ? (activeStudents.reduce((acc, s) => acc + (s.age || 0), 0) / activeCount).toFixed(1)
      : '0'

  // Latest 5 students
  const recentStudents = [...activeStudents].sort((a, b) => b.id - a.id).slice(0, 5)

  // Top courses
  const courseCounts: Record<string, number> = {}
  activeStudents.forEach((s) => {
    const c = s.course || 'Unassigned'
    courseCounts[c] = (courseCounts[c] || 0) + 1
  })
  const sortedCourses = Object.entries(courseCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const handleQuickSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setQuickError('')

    if (!quickName.trim() || !quickEmail.trim() || !quickAge) {
      setQuickError('All fields are required')
      return
    }

    const ageNum = Number(quickAge)
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      setQuickError('Age must be between 10 and 120')
      return
    }

    setIsQuickSubmitting(true)
    try {
      await onCreateStudent({
        name: quickName.trim(),
        email: quickEmail.trim(),
        age: ageNum,
        course: quickCourse.trim(),
      })
      setQuickName('')
      setQuickEmail('')
      setQuickAge('')
    } catch (err: unknown) {
      setQuickError(err instanceof Error ? err.message : 'Failed to register student')
    } finally {
      setIsQuickSubmitting(false)
    }
  }

  // Quick export CSV
  const handleExportCSV = () => {
    if (activeStudents.length === 0) return
    const headers = ['ID', 'Name', 'Email', 'Age', 'Course', 'Status']
    const rows = activeStudents.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      s.age,
      `"${s.course.replace(/"/g, '""')}"`,
      'Active',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="page-container dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h1 className="welcome-title">Academic Administration Dashboard</h1>
          <p className="welcome-desc">
            Overview of student enrollments, departments, and real-time database metrics.
          </p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-secondary btn-icon" onClick={handleExportCSV}>
            <DownloadIcon size={16} />
            <span>Export CSV</span>
          </button>
          <Link to="/students/new" className="btn btn-primary">
            <UserPlusIcon size={16} />
            <span>Register Student</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-clickable" onClick={() => navigate('/students')}>
          <div className="stat-icon-wrap stat-icon-primary">
            <UsersIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Enrollments</span>
            <div className="stat-value-row">
              <span className="stat-number">{activeCount}</span>
              <span className="stat-badge">Students</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-clickable" onClick={() => navigate('/courses')}>
          <div className="stat-icon-wrap stat-icon-info">
            <BookOpenIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Programs / Courses</span>
            <div className="stat-value-row">
              <span className="stat-number">{courseCount}</span>
              <span className="stat-badge stat-badge-info">Active</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-clickable" onClick={() => navigate('/recycle-bin')}>
          <div className="stat-icon-wrap stat-icon-danger">
            <TrashIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Recycle Bin</span>
            <div className="stat-value-row">
              <span className="stat-number">{deletedCount}</span>
              <span className="stat-badge stat-badge-soft">Archived</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-clickable" onClick={() => navigate('/analytics')}>
          <div className="stat-icon-wrap stat-icon-warning">
            <DatabaseIcon size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Age</span>
            <div className="stat-value-row">
              <span className="stat-number">{avgAge}</span>
              <span className="stat-badge stat-badge-warning">Years</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Main Grid: Recent Activity + Quick Add */}
      <div className="dashboard-grid">
        {/* Left Col: Recent Students Table */}
        <div className="dashboard-card recent-students-card">
          <div className="dashboard-card-header">
            <div className="card-header-title">
              <GraduationCapIcon size={20} />
              <h3>Recently Enrolled Students</h3>
            </div>
            <Link to="/students" className="card-header-link">
              View All Directory →
            </Link>
          </div>

          {recentStudents.length === 0 ? (
            <div className="empty-state-mini">
              <p>No students enrolled yet. Use the quick registration form!</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Age</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((s) => (
                    <tr key={s.id}>
                      <td><span className="id-badge">#{s.id}</span></td>
                      <td>
                        <span className="student-name">{s.name}</span>
                      </td>
                      <td><span className="course-pill">{s.course}</span></td>
                      <td><span className="age-pill">{s.age} yrs</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/students/${s.id}`}
                          className="btn-action btn-action-view"
                          title="View Profile"
                        >
                          <EyeIcon size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Quick Register Widget */}
        <div className="dashboard-card quick-register-card">
          <div className="dashboard-card-header">
            <div className="card-header-title">
              <UserPlusIcon size={20} />
              <h3>Quick Registration</h3>
            </div>
            <Link to="/students/new" className="card-header-link">
              Full Form →
            </Link>
          </div>

          <form onSubmit={handleQuickSubmit} className="quick-register-form">
            {quickError && <div className="quick-error-alert">{quickError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="quick-name">Student Full Name</label>
              <input
                id="quick-name"
                type="text"
                className="form-input"
                placeholder="e.g. Alex Morgan"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="quick-email">Email Address</label>
              <input
                id="quick-email"
                type="email"
                className="form-input"
                placeholder="e.g. alex@example.com"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label className="form-label" htmlFor="quick-age">Age</label>
                <input
                  id="quick-age"
                  type="number"
                  min="10"
                  max="120"
                  className="form-input"
                  placeholder="21"
                  value={quickAge}
                  onChange={(e) => setQuickAge(e.target.value)}
                />
              </div>

              <div className="form-group form-col">
                <label className="form-label" htmlFor="quick-course">Program</label>
                <select
                  id="quick-course"
                  className="form-select"
                  value={quickCourse}
                  onChange={(e) => setQuickCourse(e.target.value)}
                >
                  {availableCourses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  {!availableCourses.includes('Computer Science') && (
                    <option value="Computer Science">Computer Science</option>
                  )}
                  {!availableCourses.includes('Data Science') && (
                    <option value="Data Science">Data Science</option>
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary quick-submit-btn"
              disabled={isQuickSubmitting}
            >
              {isQuickSubmitting ? 'Registering...' : 'Register Student Instantly'}
            </button>
          </form>
        </div>
      </div>

      {/* Course Highlights Bar */}
      {sortedCourses.length > 0 && (
        <div className="dashboard-card course-highlight-card">
          <div className="dashboard-card-header">
            <div className="card-header-title">
              <BookOpenIcon size={20} />
              <h3>Course Enrollment Breakdown</h3>
            </div>
            <Link to="/courses" className="card-header-link">
              Explore All Courses →
            </Link>
          </div>

          <div className="course-bars-grid">
            {sortedCourses.map(([courseName, count]) => {
              const pct = activeCount > 0 ? Math.round((count / activeCount) * 100) : 0
              return (
                <div key={courseName} className="course-bar-box">
                  <div className="course-bar-info">
                    <span className="course-bar-title">{courseName}</span>
                    <span className="course-bar-count">{count} enrolled ({pct}%)</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
