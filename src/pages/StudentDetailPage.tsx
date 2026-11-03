import { useEffect, useState, type FC } from 'react'
import type { Student } from '../types/student'
import { api } from '../services/api'
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CalendarIcon,
  DatabaseIcon,
  EditIcon,
  GraduationCapIcon,
  HashIcon,
  MailIcon,
  PrinterIcon,
  RestoreIcon,
  TrashIcon,
} from '../components/Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'

interface StudentDetailPageProps {
  id: number
  onDeleteStudent: (student: Student) => void
  onRestoreStudent: (student: Student) => void
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const StudentDetailPage: FC<StudentDetailPageProps> = ({
  id,
  onDeleteStudent,
  onRestoreStudent,
}) => {
  const { navigate } = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    api
      .getStudentById(id)
      .then((data) => {
        if (!ignore) {
          setStudent(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          // If not in active, check if it's in deleted students
          api
            .getDeletedStudents()
            .then((deletedList) => {
              const found = deletedList.find((s) => s.id === id)
              if (found && !ignore) {
                setStudent(found)
                setLoading(false)
              } else if (!ignore) {
                setError(err instanceof Error ? err.message : 'Student not found')
                setLoading(false)
              }
            })
            .catch(() => {
              if (!ignore) {
                setError(err instanceof Error ? err.message : 'Student not found')
                setLoading(false)
              }
            })
        }
      })

    return () => {
      ignore = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="page-container loading-page">
        <div className="spinner" />
        <p>Loading student dossier #{id}...</p>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="page-container error-page">
        <div className="empty-state">
          <div className="empty-state-icon">
            <TrashIcon size={36} />
          </div>
          <h2 className="empty-state-title">Student Record Not Found</h2>
          <p className="empty-state-desc">
            {error || `No active student found with record ID #${id}.`}
          </p>
          <div className="empty-actions" style={{ marginTop: '16px' }}>
            <Link to="/students" className="btn btn-secondary">
              ← Return to Directory
            </Link>
            <Link to="/recycle-bin" className="btn btn-ghost">
              Check Recycle Bin
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container student-detail-page">
      {/* Top action row */}
      <div className="detail-top-nav">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/students')}>
          <ArrowLeftIcon size={16} />
          <span>Back to Students</span>
        </button>

        <div className="detail-top-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => window.print()}
            title="Print or Save PDF"
          >
            <PrinterIcon size={15} />
            <span>Print Dossier</span>
          </button>

          {!student.deleted ? (
            <>
              <Link
                to={`/students/${student.id}/edit`}
                className="btn btn-secondary btn-sm"
              >
                <EditIcon size={15} />
                <span>Edit Profile</span>
              </Link>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDeleteStudent(student)}
              >
                <TrashIcon size={15} />
                <span>Soft Delete</span>
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onRestoreStudent(student)}
            >
              <RestoreIcon size={15} />
              <span>Restore Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dossier Grid */}
      <div className="dossier-grid">
        {/* Left: Interactive Digital Student ID Card */}
        <div className="id-card-wrapper">
          <div className="digital-id-card">
            <div className="id-card-header">
              <GraduationCapIcon size={20} />
              <span className="id-card-uni">ACADEMIC PORTAL</span>
              <span className="id-card-tag">STUDENT ID</span>
            </div>

            <div className="id-card-body">
              <div className="id-card-avatar">
                {getInitials(student.name)}
              </div>
              <h2 className="id-card-name">{student.name}</h2>
              <span className="id-card-course">{student.course}</span>

              <div className="id-card-meta-list">
                <div className="id-meta-item">
                  <span className="meta-label">ID NUMBER</span>
                  <span className="meta-val">#{student.id.toString().padStart(6, '0')}</span>
                </div>
                <div className="id-meta-item">
                  <span className="meta-label">AGE</span>
                  <span className="meta-val">{student.age} Years</span>
                </div>
                <div className="id-meta-item">
                  <span className="meta-label">STATUS</span>
                  <span className={`meta-val ${student.deleted ? 'meta-val-danger' : 'meta-val-success'}`}>
                    {student.deleted ? 'ARCHIVED' : 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="id-card-footer">
              <span className="id-barcode">||| | |||| | ||||| ||| || |</span>
              <span className="id-verified-pill">Official Database Record</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Academic Profile Dossier */}
        <div className="dossier-details-card">
          <div className="dossier-header">
            <div>
              <span className="dossier-badge">Student Profile</span>
              <h1 className="dossier-title">{student.name}</h1>
              <p className="dossier-sub">Enrolled in {student.course}</p>
            </div>
            {student.deleted ? (
              <span className="status-tag status-tag-deleted">Soft-Deleted in Recycle Bin</span>
            ) : (
              <span className="status-tag status-tag-active">Active Enrollment</span>
            )}
          </div>

          <div className="dossier-section">
            <h3 className="section-heading">Contact &amp; Identification</h3>
            <div className="dossier-fields-grid">
              <div className="dossier-field">
                <span className="field-label">Student ID</span>
                <span className="field-value">
                  <HashIcon size={14} />
                  <span>#{student.id}</span>
                </span>
              </div>

              <div className="dossier-field">
                <span className="field-label">Email Address</span>
                <a href={`mailto:${student.email}`} className="field-value field-link">
                  <MailIcon size={14} />
                  <span>{student.email}</span>
                </a>
              </div>

              <div className="dossier-field">
                <span className="field-label">Age</span>
                <span className="field-value">
                  <CalendarIcon size={14} />
                  <span>{student.age} years old</span>
                </span>
              </div>

              <div className="dossier-field">
                <span className="field-label">Database Record</span>
                <span className="field-value">
                  <DatabaseIcon size={14} />
                  <span>MySQL Table <code>students</code></span>
                </span>
              </div>
            </div>
          </div>

          <div className="dossier-section">
            <h3 className="section-heading">Academic Program Information</h3>
            <div className="program-highlight-box">
              <div className="program-icon-box">
                <BookOpenIcon size={24} />
              </div>
              <div className="program-info">
                <h4>{student.course}</h4>
                <p>
                  Student is currently assigned to the <strong>{student.course}</strong> syllabus.
                </p>
              </div>
            </div>
          </div>

          {student.deleted && (
            <div className="deleted-warning-box">
              <TrashIcon size={20} />
              <div>
                <strong>This record has been soft-deleted</strong>
                <p>
                  The student is hidden from the active directory but preserved in the database.
                  Click "Restore Student" above to reinstate this record.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
