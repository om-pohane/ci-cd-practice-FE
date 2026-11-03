import type { CombatBot, CombatBotInput, DuelRequest, DuelResult } from '../types/bot'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/bots').replace(/\/$/, '')

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
  /**
   * Fetch all active battle mechs in the hangar
   */
  async getAllBots(): Promise<CombatBot[]> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot[]>(res)
  },

  /**
   * Fetch a single combat mech by ID
   */
  async getBotById(id: number): Promise<CombatBot> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot>(res)
  },

  /**
   * Filter mechs by weight class
   */
  async getBotsByWeightClass(weightClass: string): Promise<CombatBot[]> {
    const res = await fetch(`${API_BASE_URL}/weight?class=${encodeURIComponent(weightClass)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot[]>(res)
  },

  /**
   * Filter mechs by weapon type
   */
  async getBotsByWeaponType(weaponType: string): Promise<CombatBot[]> {
    const res = await fetch(`${API_BASE_URL}/weapon?type=${encodeURIComponent(weaponType)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot[]>(res)
  },

  /**
   * Build/forge a new combat mech
   */
  async createBot(bot: CombatBotInput): Promise<CombatBot> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bot),
    })
    return handleResponse<CombatBot>(res)
  },

  /**
   * Update/upgrade an existing mech
   */
  async updateBot(id: number, bot: Partial<CombatBotInput>): Promise<CombatBot> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bot),
    })
    return handleResponse<CombatBot>(res)
  },

  /**
   * Decommission/scrap mech into Scrapyard (soft delete)
   */
  async scrapBot(id: number): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    })
    return handleResponse<string>(res)
  },

  /**
   * Get all scrapped/destroyed mechs in the Scrapyard
   */
  async getScrappedBots(): Promise<CombatBot[]> {
    const res = await fetch(`${API_BASE_URL}/scrapped`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot[]>(res)
  },

  /**
   * Nano-repair & rebuild a scrapped mech
   */
  async repairBot(id: number): Promise<CombatBot> {
    const res = await fetch(`${API_BASE_URL}/${id}/repair`, {
      method: 'PUT',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot>(res)
  },

  /**
   * Fetch top ranking gladiator bots
   */
  async getLeaderboard(): Promise<CombatBot[]> {
    const res = await fetch(`${API_BASE_URL}/leaderboard`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot[]>(res)
  },

  /**
   * Seed preset legendary champions
   */
  async seedChampions(): Promise<CombatBot[]> {
    const res = await fetch(`${API_BASE_URL}/seed`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })
    return handleResponse<CombatBot[]>(res)
  },

  /**
   * Run a live simulated battle duel between 2 bots
   */
  async executeDuel(request: DuelRequest): Promise<DuelResult> {
    const res = await fetch(`${API_BASE_URL}/duel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
    })
    return handleResponse<DuelResult>(res)
  },

  /**
   * Check connection to Spring Boot backend
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
