import type { Student, StudentInput } from '../types/student'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/student').replace(/\/$/, '')

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    try {
      if (isJson) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)
      } else {
        const textData = await response.text()
        if (textData) errorMessage = textData
      }
    } catch {
      // Fallback to initial error message
    }
    throw new Error(errorMessage)
  }

  if (isJson) {
    return (await response.json()) as T
  }
  return (await response.text()) as unknown as T
}

export const api = {
  /**
   * Fetch all active students
   */
  async getAllStudents(): Promise<Student[]> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<Student[]>(res)
  },

  /**
   * Fetch a single student by ID
   */
  async getStudentById(id: number): Promise<Student> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<Student>(res)
  },

  /**
   * Search active students by course name
   */
  async getStudentsByCourse(course: string): Promise<Student[]> {
    const encodedCourse = encodeURIComponent(course.trim())
    const res = await fetch(`${API_BASE_URL}/search?course=${encodedCourse}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<Student[]>(res)
  },

  /**
   * Create a new student
   */
  async createStudent(student: StudentInput): Promise<Student> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(student),
    })
    return handleResponse<Student>(res)
  },

  /**
   * Update existing student by ID
   */
  async updateStudent(id: number, student: StudentInput): Promise<Student> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(student),
    })
    return handleResponse<Student>(res)
  },

  /**
   * Soft-delete student by ID
   */
  async deleteStudent(id: number): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    })
    return handleResponse<string>(res)
  },

  /**
   * Get all soft-deleted students (Recycle Bin)
   */
  async getDeletedStudents(): Promise<Student[]> {
    const res = await fetch(`${API_BASE_URL}/deleted`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<Student[]>(res)
  },

  /**
   * Restore a soft-deleted student by ID
   */
  async restoreStudent(id: number): Promise<Student> {
    const res = await fetch(`${API_BASE_URL}/${id}/restore`, {
      method: 'PUT',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<Student>(res)
  },

  /**
   * Check connection to backend
   */
  async checkConnection(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)
      const res = await fetch(`${API_BASE_URL}`, {
        method: 'GET',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return res.ok || res.status < 500
    } catch {
      return false
    }
  },
}
