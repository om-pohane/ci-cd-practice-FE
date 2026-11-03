import { useState, type FC, useMemo } from 'react'
import type { Student } from '../types/student'
import { api } from '../services/api'
import {
  BookOpenIcon,
  ChevronRightIcon,
  EyeIcon,
  SearchIcon,
} from '../components/Icons'
import { Link } from '../router/Router'

interface CoursesPageProps {
  students: Student[]
}

export const CoursesPage: FC<CoursesPageProps> = ({ students }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseStudents, setSelectedCourseStudents] = useState<Student[] | null>(null)
  const [activeCourseTitle, setActiveCourseTitle] = useState<string>('')
  const [isLoadingBackendCourse, setIsLoadingBackendCourse] = useState(false)
  const [backendSearchInput, setBackendSearchInput] = useState('')

  // Aggregate stats per course
  const courseData = useMemo(() => {
    const map = new Map<string, Student[]>()

    students.forEach((s) => {
      const c = s.course || 'Unassigned'
      const existing = map.get(c) || []
      existing.push(s)
      map.set(c, existing)
    })

    const results = Array.from(map.entries()).map(([courseName, studentList]) => {
      const total = studentList.length
      const avgAge = (
        studentList.reduce((acc, s) => acc + (s.age || 0), 0) / total
      ).toFixed(1)
      return {
        courseName,
        students: studentList,
        total,
        avgAge,
      }
    })

    results.sort((a, b) => b.total - a.total)
    return results
  }, [students])

  // Filtered courses
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courseData
    const q = searchQuery.toLowerCase().trim()
    return courseData.filter((c) => c.courseName.toLowerCase().includes(q))
  }, [courseData, searchQuery])

  // Drill down by calling the backend /api/student/search?course=... endpoint
  const handleInspectCourse = async (courseName: string) => {
    setActiveCourseTitle(courseName)
    setIsLoadingBackendCourse(true)
    try {
      const list = await api.getStudentsByCourse(courseName)
      setSelectedCourseStudents(list)
    } catch {
      // Fallback to local slice
      const found = courseData.find((c) => c.courseName === courseName)
      setSelectedCourseStudents(found ? found.students : [])
    } finally {
      setIsLoadingBackendCourse(false)
    }
  }

  const handleBackendSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!backendSearchInput.trim()) return
    await handleInspectCourse(backendSearchInput.trim())
  }

  return (
    <div className="page-container courses-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Courses &amp; Programs</h1>
          <p className="page-subtitle">
            Explore active departments, student distributions, and search courses directly via backend API.
          </p>
        </div>

        {/* Backend direct search form */}
        <form onSubmit={handleBackendSearchSubmit} className="course-search-form">
          <input
            type="text"
            className="form-input"
            placeholder="Search course in backend..."
            value={backendSearchInput}
            onChange={(e) => setBackendSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            <SearchIcon size={14} />
            <span>API Search</span>
          </button>
        </form>
      </div>

      {/* Local search filter */}
      <div className="courses-filter-row">
        <div className="search-input-wrap">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Filter courses by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="course-count-badge">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'Program' : 'Programs'}
        </span>
      </div>

      {/* Courses Cards Grid */}
      <div className="courses-grid">
        {filteredCourses.map((item) => (
          <div
            key={item.courseName}
            className={`course-card ${
              activeCourseTitle === item.courseName ? 'course-card-active' : ''
            }`}
          >
            <div className="course-card-header">
              <div className="course-icon-wrap">
                <BookOpenIcon size={22} />
              </div>
              <span className="course-card-students-badge">
                {item.total} {item.total === 1 ? 'Student' : 'Students'}
              </span>
            </div>

            <h3 className="course-card-title">{item.courseName}</h3>

            <div className="course-card-stats">
              <div className="course-stat-item">
                <span className="stat-dim">Enrollment</span>
                <span className="stat-bold">{item.total} Enrolled</span>
              </div>
              <div className="course-stat-item">
                <span className="stat-dim">Average Age</span>
                <span className="stat-bold">{item.avgAge} Yrs</span>
              </div>
            </div>

            <div className="course-card-preview-students">
              <span className="preview-label">Sample Enrollees:</span>
              <div className="preview-tags">
                {item.students.slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    to={`/students/${s.id}`}
                    className="preview-student-pill"
                    title={`View ${s.name}`}
                  >
                    {s.name}
                  </Link>
                ))}
                {item.students.length > 3 && (
                  <span className="preview-more">+{item.students.length - 3} more</span>
                )}
              </div>
            </div>

            <div className="course-card-footer">
              <button
                className="btn btn-primary btn-sm btn-full"
                onClick={() => handleInspectCourse(item.courseName)}
              >
                <span>Inspect Roster via API</span>
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Course Roster Drawer / Section */}
      {selectedCourseStudents && (
        <div className="course-roster-section">
          <div className="roster-header">
            <div>
              <span className="roster-badge">Active Roster</span>
              <h2 className="roster-title">{activeCourseTitle}</h2>
              <p className="roster-desc">
                Fetched from <code>GET /api/student/search?course={encodeURIComponent(activeCourseTitle)}</code>
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedCourseStudents(null)}
            >
              Close Roster
            </button>
          </div>

          {isLoadingBackendCourse ? (
            <div className="loading-state-mini">
              <div className="spinner" />
              <p>Querying backend for {activeCourseTitle}...</p>
            </div>
          ) : selectedCourseStudents.length === 0 ? (
            <div className="empty-state-mini">
              <p>No active students returned for course "{activeCourseTitle}".</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourseStudents.map((s) => (
                    <tr key={s.id}>
                      <td><span className="id-badge">#{s.id}</span></td>
                      <td>
                        <div className="student-profile-cell">
                          <span className="student-name">{s.name}</span>
                        </div>
                      </td>
                      <td>{s.email}</td>
                      <td><span className="age-pill">{s.age} yrs</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/students/${s.id}`}
                          className="btn-action btn-action-view"
                          title="View Dossier"
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
      )}
    </div>
  )
}
