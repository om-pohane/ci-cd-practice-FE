import { useEffect, useRef, useState, type FC, type ReactNode } from 'react'
import type { Student } from '../types/student'
import {
  BarChartIcon,
  BookOpenIcon,
  CloseIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  TrashIcon,
  UserPlusIcon,
  UsersIcon,
} from './Icons'
import { useRouter } from '../router/RouterContext'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
}

interface PageResult {
  title: string
  path: string
  icon: ReactNode
  category: 'Pages'
}

const allPages: PageResult[] = [
  { title: 'Dashboard Overview', path: '/', icon: <LayoutDashboardIcon size={16} />, category: 'Pages' },
  { title: 'Student Directory', path: '/students', icon: <UsersIcon size={16} />, category: 'Pages' },
  { title: 'Register New Student', path: '/students/new', icon: <UserPlusIcon size={16} />, category: 'Pages' },
  { title: 'Courses & Programs', path: '/courses', icon: <BookOpenIcon size={16} />, category: 'Pages' },
  { title: 'Recycle Bin (Deleted Students)', path: '/recycle-bin', icon: <TrashIcon size={16} />, category: 'Pages' },
  { title: 'Reports & Analytics', path: '/analytics', icon: <BarChartIcon size={16} />, category: 'Pages' },
  { title: 'Settings & API Playground', path: '/settings', icon: <SettingsIcon size={16} />, category: 'Pages' },
]

interface SearchContentProps {
  onClose: () => void
  students: Student[]
}

const SearchModalContent: FC<SearchContentProps> = ({ onClose, students }) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { navigate } = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const q = query.trim().toLowerCase()

  const matchedPages = q
    ? allPages.filter((p) => p.title.toLowerCase().includes(q) || p.path.includes(q))
    : allPages.slice(0, 4)

  const matchedStudents = q
    ? students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.course.toLowerCase().includes(q) ||
            s.id.toString() === q,
        )
        .slice(0, 6)
    : students.slice(0, 5)

  const combinedResults: Array<{ type: 'page'; data: PageResult } | { type: 'student'; data: Student }> = [
    ...matchedPages.map((p) => ({ type: 'page' as const, data: p })),
    ...matchedStudents.map((s) => ({ type: 'student' as const, data: s })),
  ]

  const handleSelect = (idx: number) => {
    const item = combinedResults[idx]
    if (!item) return
    onClose()
    if (item.type === 'page') {
      navigate(item.data.path)
    } else {
      navigate(`/students/${item.data.id}`)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (combinedResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % combinedResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + combinedResults.length) % combinedResults.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(selectedIndex)
    }
  }

  return (
    <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
      <div className="search-modal-input-row">
        <SearchIcon size={18} className="search-modal-icon" />
        <input
          ref={inputRef}
          type="text"
          className="search-modal-input"
          placeholder="Type a student name, course, ID, or page..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleInputKeyDown}
        />
        <button className="search-modal-close" onClick={onClose} aria-label="Close search">
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="search-modal-results">
        {matchedPages.length > 0 && (
          <div className="search-group">
            <span className="search-group-title">Navigation</span>
            {matchedPages.map((page) => {
              const globalIndex = combinedResults.findIndex(
                (r) => r.type === 'page' && r.data.path === page.path,
              )
              const isSelected = globalIndex === selectedIndex

              return (
                <div
                  key={page.path}
                  className={`search-result-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(globalIndex)}
                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                >
                  <span className="result-icon">{page.icon}</span>
                  <span className="result-title">{page.title}</span>
                  <span className="result-sub">{page.path}</span>
                </div>
              )
            })}
          </div>
        )}

        {matchedStudents.length > 0 && (
          <div className="search-group">
            <span className="search-group-title">Students</span>
            {matchedStudents.map((student) => {
              const globalIndex = combinedResults.findIndex(
                (r) => r.type === 'student' && r.data.id === student.id,
              )
              const isSelected = globalIndex === selectedIndex

              return (
                <div
                  key={student.id}
                  className={`search-result-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(globalIndex)}
                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                >
                  <span className="id-badge">#{student.id}</span>
                  <div className="result-student-info">
                    <span className="result-title">{student.name}</span>
                    <span className="result-sub">{student.email}</span>
                  </div>
                  <span className="course-pill">{student.course}</span>
                </div>
              )
            })}
          </div>
        )}

        {combinedResults.length === 0 && (
          <div className="search-no-results">
            <p>No results found for "{query}"</p>
          </div>
        )}
      </div>

      <div className="search-modal-footer">
        <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
        <span><kbd>↵</kbd> to select</span>
        <span><kbd>esc</kbd> to close</span>
      </div>
    </div>
  )
}

export const GlobalSearchModal: FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop search-modal-backdrop" onClick={onClose}>
      <SearchModalContent onClose={onClose} students={students} />
    </div>
  )
}
