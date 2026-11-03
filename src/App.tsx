import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './services/api'
import { ThemeProvider } from './context/ThemeContext'
import { RouterProvider } from './router/Router'
import { useRouter } from './router/RouterContext'
import { matchRoutePattern } from './router/router-utils'
import type { Student, StudentInput, Toast } from './types/student'

// Layout Components
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { GlobalSearchModal } from './components/GlobalSearchModal'
import { ToastContainer } from './components/ToastContainer'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { BackendOfflineBanner } from './components/BackendOfflineBanner'

// Pages
import { DashboardPage } from './pages/DashboardPage'
import { StudentsPage } from './pages/StudentsPage'
import { StudentDetailPage } from './pages/StudentDetailPage'
import { StudentFormPage } from './pages/StudentFormPage'
import { CoursesPage } from './pages/CoursesPage'
import { RecycleBinPage } from './pages/RecycleBinPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'

import './App.css'

function AppContent() {
  const { path, navigate } = useRouter()

  const [activeStudents, setActiveStudents] = useState<Student[]>([])
  const [deletedStudents, setDeletedStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [checkingConnection, setCheckingConnection] = useState(false)

  // Layout UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false)

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Search by course state
  const [isSearchingBackendCourse, setIsSearchingBackendCourse] = useState(false)

  // Toasts
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

  // Load data
  const loadData = useCallback(
    async (isSilent = false) => {
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
    },
    [addToast],
  )

  // Initial load on mount
  useEffect(() => {
    let ignore = false
    async function init() {
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
    init()
    return () => {
      ignore = true
    }
  }, [])

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsGlobalSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Available courses
  const availableCourses = useMemo(() => {
    const set = new Set<string>()
    activeStudents.forEach((s) => s.course && set.add(s.course))
    deletedStudents.forEach((s) => s.course && set.add(s.course))
    return Array.from(set).sort()
  }, [activeStudents, deletedStudents])

  // Save student (create or update)
  const handleSaveStudent = async (studentData: StudentInput, id?: number): Promise<Student> => {
    if (id) {
      const updated = await api.updateStudent(id, studentData)
      setActiveStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      addToast('success', 'Student Updated', `${updated.name} updated successfully.`)
      return updated
    } else {
      const created = await api.createStudent(studentData)
      setActiveStudents((prev) => [created, ...prev])
      addToast('success', 'Student Enrolled', `${created.name} registered with ID #${created.id}.`)
      return created
    }
  }

  // Soft delete confirm
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    setIsDeleting(true)
    try {
      await api.deleteStudent(studentToDelete.id)
      const deletedItem = { ...studentToDelete, deleted: true }
      setActiveStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id))
      setDeletedStudents((prev) => [deletedItem, ...prev])
      addToast('info', 'Student Soft Deleted', `${studentToDelete.name} moved to Recycle Bin.`)
      setStudentToDelete(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete student'
      addToast('error', 'Delete Failed', msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // Restore student
  const handleRestoreStudent = async (student: Student) => {
    try {
      const restored = await api.restoreStudent(student.id)
      setDeletedStudents((prev) => prev.filter((s) => s.id !== student.id))
      setActiveStudents((prev) => [restored, ...prev])
      addToast('success', 'Student Restored', `${restored.name} restored to active directory.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to restore student'
      addToast('error', 'Restore Failed', msg)
    }
  }

  // Search by course (backend endpoint)
  const handleSearchByCourse = async (courseName: string) => {
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

  // Route matches
  const matchDetail = matchRoutePattern('/students/:id', path)
  const matchEdit = matchRoutePattern('/students/:id/edit', path)

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Top Loading Progress Line */}
      {loading && <div className="global-top-progress" />}

      {/* Sidebar */}
      <Sidebar
        activeCount={activeStudents.length}
        deletedCount={deletedStudents.length}
        courseCount={availableCourses.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="app-main-viewport">
        <Header
          backendConnected={backendConnected}
          checkingConnection={checkingConnection}
          onRefresh={() => loadData(false)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="app-content-body">
          {backendConnected === false && (
            <div style={{ maxWidth: '1240px', margin: '0 auto 20px' }}>
              <BackendOfflineBanner
                onRetry={() => loadData(false)}
                isRetrying={checkingConnection}
              />
            </div>
          )}

          {/* Router View Switching */}
          {path === '/' || path === '' ? (
            <DashboardPage
              activeStudents={activeStudents}
              deletedStudents={deletedStudents}
              availableCourses={availableCourses}
              onCreateStudent={async (data) => {
                await handleSaveStudent(data)
              }}
            />
          ) : path === '/students' ? (
            <StudentsPage
              students={activeStudents}
              availableCourses={availableCourses}
              onDeleteStudent={(s) => setStudentToDelete(s)}
              onSearchByCourse={handleSearchByCourse}
              onResetFilters={() => {
                setIsSearchingBackendCourse(false)
                loadData(true)
              }}
              isSearchingBackendCourse={isSearchingBackendCourse}
            />
          ) : path === '/students/new' ? (
            <StudentFormPage
              availableCourses={availableCourses}
              onSaveStudent={handleSaveStudent}
            />
          ) : matchEdit.match ? (
            <StudentFormPage
              id={Number(matchEdit.params.id)}
              availableCourses={availableCourses}
              onSaveStudent={handleSaveStudent}
            />
          ) : matchDetail.match ? (
            <StudentDetailPage
              id={Number(matchDetail.params.id)}
              onDeleteStudent={(s) => setStudentToDelete(s)}
              onRestoreStudent={handleRestoreStudent}
            />
          ) : path === '/courses' ? (
            <CoursesPage students={activeStudents} />
          ) : path === '/recycle-bin' ? (
            <RecycleBinPage
              deletedStudents={deletedStudents}
              onRestoreStudent={handleRestoreStudent}
              onRefresh={() => loadData(false)}
            />
          ) : path === '/analytics' ? (
            <AnalyticsPage
              activeStudents={activeStudents}
              deletedStudents={deletedStudents}
            />
          ) : path === '/settings' ? (
            <SettingsPage
              backendConnected={backendConnected}
              checkingConnection={checkingConnection}
              onRecheckConnection={() => loadData(true)}
            />
          ) : (
            <div className="page-container error-page">
              <div className="empty-state">
                <h2>Page Not Found</h2>
                <p>The path <code>{path}</code> does not exist.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '14px' }}
                  onClick={() => navigate('/')}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Quick Search (Cmd+K) Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        students={activeStudents}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(studentToDelete)}
        student={studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </ThemeProvider>
  )
}

export default App
