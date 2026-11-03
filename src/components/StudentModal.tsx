import { useState, type FC, type FormEvent } from 'react'
import type { Student, StudentInput } from '../types/student'
import { CloseIcon, EditIcon, UserPlusIcon } from './Icons'

interface StudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StudentInput) => Promise<void>
  initialData?: Student | null
  existingCourses: string[]
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

interface ModalContentProps {
  onClose: () => void
  onSubmit: (data: StudentInput) => Promise<void>
  initialData?: Student | null
  allCourses: string[]
}

const StudentModalContent: FC<ModalContentProps> = ({
  onClose,
  onSubmit,
  initialData,
  allCourses,
}) => {
  const isPresetCourse = initialData?.course ? allCourses.includes(initialData.course) : true
  const initialCourse = initialData?.course
    ? isPresetCourse
      ? initialData.course
      : '__custom__'
    : allCourses[0] || 'Computer Science'

  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [age, setAge] = useState<string | number>(initialData?.age ?? '')
  const [course, setCourse] = useState(initialCourse)
  const [customCourse, setCustomCourse] = useState(
    !isPresetCourse && initialData?.course ? initialData.course : '',
  )
  const [isCustomCourse, setIsCustomCourse] = useState(!isPresetCourse)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        age: Number(age),
        course: finalCourse,
      })
      onClose()
    } catch {
      // Error handled in parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-header-icon">
          {initialData ? <EditIcon size={20} /> : <UserPlusIcon size={20} />}
        </div>
        <div>
          <h2 className="modal-title">
            {initialData ? 'Edit Student Details' : 'Add New Student'}
          </h2>
          <p className="modal-subtitle">
            {initialData
              ? `Updating student #${initialData.id}`
              : 'Fill in details to register student into the database'}
          </p>
        </div>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="modal-form" noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="student-name">
            Full Name <span className="req">*</span>
          </label>
          <input
            id="student-name"
            type="text"
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            placeholder="e.g. Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {errors.name && <span className="error-hint">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="student-email">
            Email Address <span className="req">*</span>
          </label>
          <input
            id="student-email"
            type="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="e.g. jane.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              placeholder="e.g. 21"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            {errors.age && <span className="error-hint">{errors.age}</span>}
          </div>

          <div className="form-group form-col">
            <label className="form-label" htmlFor="student-course">
              Course / Program <span className="req">*</span>
            </label>
            <select
              id="student-course"
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
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__custom__">+ Enter custom course...</option>
            </select>
          </div>
        </div>

        {isCustomCourse && (
          <div className="form-group">
            <label className="form-label" htmlFor="custom-course">
              Custom Course Name <span className="req">*</span>
            </label>
            <input
              id="custom-course"
              type="text"
              className={`form-input ${errors.course ? 'input-error' : ''}`}
              placeholder="e.g. Artificial Intelligence"
              value={customCourse}
              onChange={(e) => setCustomCourse(e.target.value)}
            />
            {errors.course && <span className="error-hint">{errors.course}</span>}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Student'}
          </button>
        </div>
      </form>
    </div>
  )
}

export const StudentModal: FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingCourses,
}) => {
  if (!isOpen) return null

  const allCourses = Array.from(
    new Set([...DEFAULT_COURSES, ...existingCourses.filter(Boolean)]),
  ).sort()

  const modalKey = initialData ? `edit-${initialData.id}` : 'create-new'

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <StudentModalContent
        key={modalKey}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={initialData}
        allCourses={allCourses}
      />
    </div>
  )
}
