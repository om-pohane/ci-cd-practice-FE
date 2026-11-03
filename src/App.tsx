import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnalyticsView } from './components/AnalyticsView'
import { BackendOfflineBanner } from './components/BackendOfflineBanner'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { FilterBar } from './components/FilterBar'
import { Navbar } from './components/Navbar'
import { StatsCards } from './components/StatsCards'
import { StudentCards } from './components/StudentCards'
import { StudentDetailModal } from './components/StudentDetailModal'
import { StudentModal } from './components/StudentModal'
import { StudentTable } from './components/StudentTable'
import { TabNavigation } from './components/TabNavigation'
import { ToastContainer } from './components/ToastContainer'
import { api } from './services/api'
import type { FilterState, Student, StudentInput, TabType, Toast } from './types/student'
import './App.css'

export function App() {
  const [activeStudents, setActiveStudents] = useState<Student[]>([])
  const [deletedStudents, setDeletedStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [checkingConnection, setCheckingConnection] = useState<boolean>(false)

  // Current navigation tab
  const [currentTab, setCurrentTab] = useState<TabType>('active')

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedCourse: '',
    sortField: 'id',
    sortDirection: 'asc',
    viewMode: 'table',
  })
  const [isSearchingBackendCourse, setIsSearchingBackendCourse] = useState<boolean>(false)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [detailStudent, setDetailStudent] = useState<Student | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (type: Toast['type'], title: string, message: string) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6)
      setToasts((prev) => [...prev, { id, type, title, message }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    },
    [],
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Manual or programmatic data reload
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    setCheckingConnection(true)

    try {
      const [activeList, deletedList] = await Promise.all([
        api.getAllStudents(),
        api.getDeletedStudents(),
      ])
      setActiveStudents(Array.isArray(activeList) ? activeList : [])
      setDeletedStudents(Array.isArray(deletedList) ? deletedList : [])
      setBackendConnected(true)
    } catch (err: unknown) {
      setBackendConnected(false)
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend'
      if (!isSilent) {
        addToast('error', 'Connection Error', msg)
      }
    } finally {
      setLoading(false)
      setCheckingConnection(false)
    }
  }, [addToast])

  // Initial load on mount
  useEffect(() => {
    let ignore = false

    async function initialFetch() {
      try {
        const [activeList, deletedList] = await Promise.all([
          api.getAllStudents(),
          api.getDeletedStudents(),
        ])
        if (!ignore) {
          setActiveStudents(Array.isArray(activeList) ? activeList : [])
          setDeletedStudents(Array.isArray(deletedList) ? deletedList : [])
          setBackendConnected(true)
        }
      } catch {
        if (!ignore) {
          setBackendConnected(false)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    initialFetch()

    return () => {
      ignore = true
    }
  }, [])

  // Extract unique courses across active and deleted for filters & modals
  const availableCourses = useMemo(() => {
    const set = new Set<string>()
    activeStudents.forEach((s) => s.course && set.add(s.course))
    deletedStudents.forEach((s) => s.course && set.add(s.course))
    return Array.from(set).sort()
  }, [activeStudents, deletedStudents])

  // Search by course using backend endpoint /api/student/search?course=...
  const handleCourseSearchSubmit = async (courseName: string) => {
    if (!courseName.trim()) {
      setIsSearchingBackendCourse(false)
      loadData(true)
      return
    }

    setLoading(true)
    setIsSearchingBackendCourse(true)
    try {
      const results = await api.getStudentsByCourse(courseName)
      setActiveStudents(results)
      addToast(
        'info',
        'Course Filter Applied',
        `Retrieved ${results.length} active students in "${courseName}"`,
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to search by course'
      addToast('error', 'Course Search Failed', msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setFilter((prev) => ({
      ...prev,
      searchQuery: '',
      selectedCourse: '',
    }))
    setIsSearchingBackendCourse(false)
    loadData(true)
  }

  // Filter and sort active students
  const filteredActiveStudents = useMemo(() => {
    let list = [...activeStudents]

    // Client-side text search by name, email, or id
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
  }, [activeStudents, filter.searchQuery, filter.sortField, filter.sortDirection])

  // Filter and sort deleted students (Recycle Bin)
  const filteredDeletedStudents = useMemo(() => {
    let list = [...deletedStudents]

    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.id.toString() === q,
      )
    }

    if (filter.selectedCourse) {
      list = list.filter((s) => s.course === filter.selectedCourse)
    }

    list.sort((a, b) => b.id - a.id)
    return list
  }, [deletedStudents, filter.searchQuery, filter.selectedCourse])

  // Handle Create or Update Student
  const handleSaveStudent = async (studentData: StudentInput) => {
    if (editingStudent) {
      // Update
      const updated = await api.updateStudent(editingStudent.id, studentData)
      setActiveStudents((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s)),
      )
      addToast('success', 'Student Updated', `${updated.name} was updated successfully.`)
    } else {
      // Create
      const created = await api.createStudent(studentData)
      setActiveStudents((prev) => [created, ...prev])
      addToast('success', 'Student Created', `${created.name} registered with ID #${created.id}.`)
    }
  }

  // Handle Soft-Delete
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return

    setIsDeleting(true)
    try {
      await api.deleteStudent(studentToDelete.id)
      const deletedItem = { ...studentToDelete, deleted: true }

      setActiveStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id))
      setDeletedStudents((prev) => [deletedItem, ...prev])

      addToast(
        'info',
        'Student Soft Deleted',
        `${studentToDelete.name} was moved to Recycle Bin.`,
      )
      setStudentToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete student'
      addToast('error', 'Delete Failed', msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle Restore
  const handleRestoreStudent = async (student: Student) => {
    try {
      const restored = await api.restoreStudent(student.id)
      setDeletedStudents((prev) => prev.filter((s) => s.id !== student.id))
      setActiveStudents((prev) => [restored, ...prev])

      addToast(
        'success',
        'Student Restored',
        `${restored.name} restored to active directory.`,
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to restore student'
      addToast('error', 'Restore Failed', msg)
    }
  }

  return (
    <div className="app-layout">
      <Navbar
        backendConnected={backendConnected}
        checkingConnection={checkingConnection}
        onRefresh={() => loadData(false)}
        onOpenCreateModal={() => {
          setEditingStudent(null)
          setIsModalOpen(true)
        }}
      />

      <main className="main-content">
        {/* Backend offline warning banner */}
        {backendConnected === false && (
          <BackendOfflineBanner
            onRetry={() => loadData(false)}
            isRetrying={checkingConnection}
          />
        )}

        {/* Quick Stats Overview */}
        <StatsCards
          activeStudents={activeStudents}
          deletedStudents={deletedStudents}
          onSelectTab={setCurrentTab}
          currentTab={currentTab}
        />

        {/* Navigation Tabs */}
        <TabNavigation
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          activeCount={activeStudents.length}
          deletedCount={deletedStudents.length}
        />

        {/* Tab 1: Active Students */}
        {currentTab === 'active' && (
          <div className="tab-pane">
            <FilterBar
              filter={filter}
              availableCourses={availableCourses}
              onFilterChange={(updated) => setFilter((prev) => ({ ...prev, ...updated }))}
              onCourseSearchSubmit={handleCourseSearchSubmit}
              onResetFilters={handleResetFilters}
              isSearchingBackendCourse={isSearchingBackendCourse}
            />

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>Loading student directory...</p>
              </div>
            ) : filter.viewMode === 'table' ? (
              <StudentTable
                students={filteredActiveStudents}
                onView={(s) => setDetailStudent(s)}
                onEdit={(s) => {
                  setEditingStudent(s)
                  setIsModalOpen(true)
                }}
                onDelete={(s) => setStudentToDelete(s)}
              />
            ) : (
              <StudentCards
                students={filteredActiveStudents}
                onView={(s) => setDetailStudent(s)}
                onEdit={(s) => {
                  setEditingStudent(s)
                  setIsModalOpen(true)
                }}
                onDelete={(s) => setStudentToDelete(s)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Recycle Bin (Deleted Students) */}
        {currentTab === 'deleted' && (
          <div className="tab-pane">
            <div className="tab-pane-header">
              <div>
                <h3 className="section-title">Recycle Bin</h3>
                <p className="section-subtitle">
                  Soft-deleted students are preserved here and can be restored back to the active
                  directory anytime.
                </p>
              </div>
            </div>

            <FilterBar
              filter={filter}
              availableCourses={availableCourses}
              onFilterChange={(updated) => setFilter((prev) => ({ ...prev, ...updated }))}
              onCourseSearchSubmit={() => {}}
              onResetFilters={handleResetFilters}
              isSearchingBackendCourse={false}
            />

            {filter.viewMode === 'table' ? (
              <StudentTable
                students={filteredDeletedStudents}
                isRecycleBin
                onView={(s) => setDetailStudent(s)}
                onEdit={() => {}}
                onDelete={() => {}}
                onRestore={handleRestoreStudent}
              />
            ) : (
              <StudentCards
                students={filteredDeletedStudents}
                isRecycleBin
                onView={(s) => setDetailStudent(s)}
                onEdit={() => {}}
                onDelete={() => {}}
                onRestore={handleRestoreStudent}
              />
            )}
          </div>
        )}

        {/* Tab 3: Analytics & Breakdown */}
        {currentTab === 'analytics' && (
          <div className="tab-pane">
            <AnalyticsView
              activeStudents={activeStudents}
              deletedStudents={deletedStudents}
              onFilterByCourse={(course) => {
                setFilter((prev) => ({ ...prev, selectedCourse: course }))
                handleCourseSearchSubmit(course)
                setCurrentTab('active')
              }}
            />
          </div>
        )}
      </main>

      {/* Modal: Create or Edit Student */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingStudent(null)
        }}
        onSubmit={handleSaveStudent}
        initialData={editingStudent}
        existingCourses={availableCourses}
      />

      {/* Modal: View Student Profile Details */}
      <StudentDetailModal
        isOpen={Boolean(detailStudent)}
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
        onEdit={(s) => {
          setEditingStudent(s)
          setIsModalOpen(true)
        }}
        onDelete={(s) => setStudentToDelete(s)}
        onRestore={handleRestoreStudent}
      />

      {/* Modal: Confirm Soft Delete */}
      <DeleteConfirmModal
        isOpen={Boolean(studentToDelete)}
        student={studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Floating Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default App
