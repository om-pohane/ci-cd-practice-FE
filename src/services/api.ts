import type { CreateWishRequest, DiwaliWish, SafaiScore, SubmitScoreRequest } from '../types/diwali'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/diwali').replace(/\/$/, '')

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
      // Fallback
    }
    throw new Error(errorMessage)
  }

  if (isJson) {
    return (await response.json()) as T
  }
  return (await response.text()) as unknown as T
}

export const api = {
  diwali: {
    async checkHealth(): Promise<{ status: string; festival: string; message: string }> {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      return handleResponse(res)
    },

    async getWish(code: string): Promise<DiwaliWish> {
      const res = await fetch(`${API_BASE_URL}/wishes/${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      return handleResponse<DiwaliWish>(res)
    },

    async createWish(req: CreateWishRequest): Promise<DiwaliWish> {
      const res = await fetch(`${API_BASE_URL}/wishes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(req),
      })
      return handleResponse<DiwaliWish>(res)
    },

    async submitScore(req: SubmitScoreRequest): Promise<SafaiScore> {
      const res = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(req),
      })
      return handleResponse<SafaiScore>(res)
    },

    async getLeaderboard(): Promise<SafaiScore[]> {
      const res = await fetch(`${API_BASE_URL}/scores/leaderboard`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      return handleResponse<SafaiScore[]>(res)
    },
  },
}
