import { useMemo, useState, type FC } from 'react'
import type { FilterState, Student } from '../types/student'
import { FilterBar } from '../components/FilterBar'
import { StudentCards } from '../components/StudentCards'
import { StudentTable } from '../components/StudentTable'
import { UserPlusIcon } from '../components/Icons'
import { Link } from '../router/Router'
import { useRouter } from '../router/RouterContext'

interface StudentsPageProps {
  students: Student[]
  availableCourses: string[]
  onDeleteStudent: (student: Student) => void
  onSearchByCourse: (course: string) => Promise<void>
  onResetFilters: () => void
  isSearchingBackendCourse: boolean
}

export const StudentsPage: FC<StudentsPageProps> = ({
  students,
  availableCourses,
  onDeleteStudent,
  onSearchByCourse,
  onResetFilters,
  isSearchingBackendCourse,
}) => {
  const { navigate, query } = useRouter()

  // Initialize selectedCourse from URL query if present (e.g. ?course=Computer+Science)
  const queryCourse = query.get('course') || ''

  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedCourse: queryCourse,
    sortField: 'id',
    sortDirection: 'asc',
    viewMode: 'table',
  })

  // Filter and sort active students
  const filteredStudents = useMemo(() => {
    let list = [...students]

    // Text search
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.id.toString() === q,
      )
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[filter.sortField]
      let valB = b[filter.sortField]

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB)
        return filter.sortDirection === 'asc' ? cmp : -cmp
      }

      valA = Number(valA) || 0
      valB = Number(valB) || 0
      return filter.sortDirection === 'asc' ? valA - valB : valB - valA
    })

    return list
  }, [students, filter.searchQuery, filter.sortField, filter.sortDirection])

  return (
    <div className="page-container students-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Directory</h1>
          <p className="page-subtitle">
            Browse, search, sort, and manage all currently active students.
          </p>
        </div>
        <Link to="/students/new" className="btn btn-primary">
          <UserPlusIcon size={16} />
          <span>Register Student</span>
        </Link>
      </div>

      <FilterBar
        filter={filter}
        availableCourses={availableCourses}
        onFilterChange={(updated) => setFilter((prev) => ({ ...prev, ...updated }))}
        onCourseSearchSubmit={onSearchByCourse}
        onResetFilters={() => {
          setFilter((prev) => ({ ...prev, searchQuery: '', selectedCourse: '' }))
          onResetFilters()
        }}
        isSearchingBackendCourse={isSearchingBackendCourse}
      />

      {filter.viewMode === 'table' ? (
        <StudentTable
          students={filteredStudents}
          onView={(s) => navigate(`/students/${s.id}`)}
          onEdit={(s) => navigate(`/students/${s.id}/edit`)}
          onDelete={onDeleteStudent}
        />
      ) : (
        <StudentCards
          students={filteredStudents}
          onView={(s) => navigate(`/students/${s.id}`)}
          onEdit={(s) => navigate(`/students/${s.id}/edit`)}
          onDelete={onDeleteStudent}
        />
      )}
    </div>
  )
}
