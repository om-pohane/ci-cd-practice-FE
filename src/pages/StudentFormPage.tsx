import { useEffect, useState, type FC, type FormEvent } from 'react'
import type { Student, StudentInput } from '../types/student'
import { api } from '../services/api'
import {
  ArrowLeftIcon,
  EditIcon,
  GraduationCapIcon,
  SparklesIcon,
  UserPlusIcon,
} from '../components/Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'

interface StudentFormPageProps {
  id?: number // If provided, we are editing
  availableCourses: string[]
  onSaveStudent: (data: StudentInput, id?: number) => Promise<Student>
}

const DEFAULT_COURSES = [
  'Computer Science',
  'Data Science',
  'Information Technology',
  'Software Engineering',
  'Mathematics',
  'Physics',
  'Business Administration',
  'Cybersecurity',
]

function getInitials(name: string): string {
  if (!name.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface FormContentProps {
  id?: number
  initialStudent?: Student | null
  allCourses: string[]
  onSaveStudent: (data: StudentInput, id?: number) => Promise<Student>
}

const StudentFormContent: FC<FormContentProps> = ({
  id,
  initialStudent,
  allCourses,
  onSaveStudent,
}) => {
  const { navigate } = useRouter()
  const isEditing = Boolean(id)
  const draftKey = `student-form-draft-${id || 'new'}`

  // Check initial state
  const isPresetCourse = initialStudent?.course ? allCourses.includes(initialStudent.course) : true
  const initialCourse = initialStudent?.course
    ? isPresetCourse
      ? initialStudent.course
      : '__custom__'
    : allCourses[0] || 'Computer Science'

  const [name, setName] = useState(() => {
    if (initialStudent?.name) return initialStudent.name
    if (!isEditing) {
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        try { return JSON.parse(draft).name || '' } catch { /* ignore */ }
      }
    }
    return ''
  })

  const [email, setEmail] = useState(() => {
    if (initialStudent?.email) return initialStudent.email
    if (!isEditing) {
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        try { return JSON.parse(draft).email || '' } catch { /* ignore */ }
      }
    }
    return ''
  })

  const [age, setAge] = useState<string | number>(() => {
    if (initialStudent?.age) return initialStudent.age
    if (!isEditing) {
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        try { return JSON.parse(draft).age || '' } catch { /* ignore */ }
      }
    }
    return ''
  })

  const [course, setCourse] = useState(initialCourse)
  const [customCourse, setCustomCourse] = useState(
    !isPresetCourse && initialStudent?.course ? initialStudent.course : '',
  )
  const [isCustomCourse, setIsCustomCourse] = useState(!isPresetCourse)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEditing) {
      const activeCourse = isCustomCourse ? customCourse : course
      localStorage.setItem(draftKey, JSON.stringify({ name: val, email, age, course: activeCourse }))
    }
  }

  const handleEmailChange = (val: string) => {
    setEmail(val)
    if (!isEditing) {
      const activeCourse = isCustomCourse ? customCourse : course
      localStorage.setItem(draftKey, JSON.stringify({ name, email: val, age, course: activeCourse }))
    }
  }

  const handleAgeChange = (val: string) => {
    setAge(val)
    if (!isEditing) {
      const activeCourse = isCustomCourse ? customCourse : course
      localStorage.setItem(draftKey, JSON.stringify({ name, email, age: val, course: activeCourse }))
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!name.trim()) {
      errs.name = 'Full name is required'
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid email address'
    }

    const ageNum = Number(age)
    if (!age || isNaN(ageNum)) {
      errs.age = 'Age is required'
    } else if (ageNum < 10 || ageNum > 120) {
      errs.age = 'Age must be between 10 and 120'
    }

    const finalCourse = isCustomCourse ? customCourse.trim() : course.trim()
    if (!finalCourse) {
      errs.course = 'Please select or enter a course'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const finalCourse = isCustomCourse ? customCourse.trim() : course.trim()

    setIsSubmitting(true)
    try {
      const saved = await onSaveStudent(
        {
          name: name.trim(),
          email: email.trim(),
          age: Number(age),
          course: finalCourse,
        },
        id,
      )
      localStorage.removeItem(draftKey)
      navigate(`/students/${saved.id}`)
    } catch {
      // Error handled by parent toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentCourseDisplay = isCustomCourse
    ? customCourse || 'Course Name'
    : course || 'Program'

  return (
    <div className="page-container student-form-page">
      <div className="form-page-top">
        <Link to="/students" className="btn btn-ghost btn-sm">
          <ArrowLeftIcon size={16} />
          <span>Back to Students</span>
        </Link>
      </div>

      <div className="form-split-layout">
        {/* Left Side: Form */}
        <div className="form-card-container">
          <div className="form-card-header">
            <div className="header-icon-box">
              {isEditing ? <EditIcon size={22} /> : <UserPlusIcon size={22} />}
            </div>
            <div>
              <h1 className="form-page-title">
                {isEditing ? 'Update Student Profile' : 'Student Registration'}
              </h1>
              <p className="form-page-subtitle">
                {isEditing
                  ? `Editing database entry #${id}`
                  : 'Enroll a new student into the university database'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="student-edit-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="full-name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="full-name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Maya Lin"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
              {errors.name && <span className="error-hint">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email-addr">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="email-addr"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="e.g. maya.lin@university.edu"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {errors.email && <span className="error-hint">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group form-col">
                <label className="form-label" htmlFor="student-age">
                  Age <span className="req">*</span>
                </label>
                <input
                  id="student-age"
                  type="number"
                  min="10"
                  max="120"
                  className={`form-input ${errors.age ? 'input-error' : ''}`}
                  placeholder="20"
                  value={age}
                  onChange={(e) => handleAgeChange(e.target.value)}
                />
                {errors.age && <span className="error-hint">{errors.age}</span>}
              </div>

              <div className="form-group form-col">
                <label className="form-label" htmlFor="course-select">
                  Academic Program <span className="req">*</span>
                </label>
                <select
                  id="course-select"
                  className={`form-select ${errors.course ? 'input-error' : ''}`}
                  value={isCustomCourse ? '__custom__' : course}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomCourse(true)
                    } else {
                      setIsCustomCourse(false)
                      setCourse(e.target.value)
                    }
                  }}
                >
                  {allCourses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">+ Enter custom course...</option>
                </select>
              </div>
            </div>

            {isCustomCourse && (
              <div className="form-group">
                <label className="form-label" htmlFor="custom-course-input">
                  Custom Course Name <span className="req">*</span>
                </label>
                <input
                  id="custom-course-input"
                  type="text"
                  className={`form-input ${errors.course ? 'input-error' : ''}`}
                  placeholder="e.g. Robotics &amp; AI"
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                />
                {errors.course && <span className="error-hint">{errors.course}</span>}
              </div>
            )}

            <div className="form-actions-bar">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/students')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Live Interactive Student ID Card Preview */}
        <div className="live-preview-container">
          <div className="preview-label">
            <SparklesIcon size={16} />
            <span>Live Student ID Preview</span>
          </div>

          <div className="digital-id-card live-id-card">
            <div className="id-card-header">
              <GraduationCapIcon size={20} />
              <span className="id-card-uni">ACADEMIC PORTAL</span>
              <span className="id-card-tag">OFFICIAL ID</span>
            </div>

            <div className="id-card-body">
              <div className="id-card-avatar">
                {getInitials(name || 'Jane Doe')}
              </div>
              <h3 className="id-card-name">{name || 'Student Full Name'}</h3>
              <span className="id-card-course">{currentCourseDisplay}</span>

              <div className="id-card-meta-list">
                <div className="id-meta-item">
                  <span className="meta-label">RECORD ID</span>
                  <span className="meta-val">{id ? `#${id}` : 'PENDING'}</span>
                </div>
                <div className="id-meta-item">
                  <span className="meta-label">AGE</span>
                  <span className="meta-val">{age ? `${age} Yrs` : '--'}</span>
                </div>
                <div className="id-meta-item">
                  <span className="meta-label">EMAIL</span>
                  <span className="meta-val meta-val-email">{email || 'student@domain.edu'}</span>
                </div>
              </div>
            </div>

            <div className="id-card-footer">
              <span className="id-barcode">||| | |||| | ||||| ||| || |</span>
              <span className="id-verified-pill">Draft Preview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const StudentFormPage: FC<StudentFormPageProps> = ({
  id,
  availableCourses,
  onSaveStudent,
}) => {
  const isEditing = Boolean(id)
  const allCourses = Array.from(
    new Set([...DEFAULT_COURSES, ...availableCourses.filter(Boolean)]),
  ).sort()

  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(isEditing)

  useEffect(() => {
    let ignore = false
    if (isEditing && id) {
      api
        .getStudentById(id)
        .then((data) => {
          if (!ignore) {
            setStudent(data)
            setLoading(false)
          }
        })
        .catch(() => {
          if (!ignore) setLoading(false)
        })
    }
    return () => {
      ignore = true
    }
  }, [id, isEditing])

  if (loading) {
    return (
      <div className="page-container loading-page">
        <div className="spinner" />
        <p>Loading student details...</p>
      </div>
    )
  }

  const contentKey = id ? `edit-${id}` : 'create-new'

  return (
    <StudentFormContent
      key={contentKey}
      id={id}
      initialStudent={student}
      allCourses={allCourses}
      onSaveStudent={onSaveStudent}
    />
  )
}
