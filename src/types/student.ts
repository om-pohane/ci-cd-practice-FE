export interface Student {
  id: number
  name: string
  email: string
  age: number
  course: string
  deleted: boolean
}

export interface StudentInput {
  name: string
  email: string
  age: number
  course: string
}

export type TabType = 'active' | 'deleted' | 'analytics'

export type SortField = 'id' | 'name' | 'email' | 'age' | 'course'
export type SortDirection = 'asc' | 'desc'
export type ViewMode = 'table' | 'cards'

export interface FilterState {
  searchQuery: string
  selectedCourse: string
  sortField: SortField
  sortDirection: SortDirection
  viewMode: ViewMode
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
}
