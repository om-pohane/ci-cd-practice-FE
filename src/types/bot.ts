export type WeightClass = 'LIGHTWEIGHT' | 'MIDDLEWEIGHT' | 'HEAVYWEIGHT' | 'TITAN'

export type WeaponType =
  | 'PLASMA_SAW'
  | 'TESLA_COIL'
  | 'HYDRAULIC_CRUSHER'
  | 'FLAMETHROWER'
  | 'RAILGUN'
  | 'SPINNING_BLADE'

export type ArenaEnvironment =
  | 'NEON_CAGE'
  | 'MOLTEN_FOUNDRY'
  | 'ACID_PIT'
  | 'CYBER_ROOF'

export interface CombatBot {
  id: number
  name: string
  weightClass: WeightClass
  weaponType: WeaponType
  maxHealth: number
  currentHealth: number
  attack: number
  defense: number
  speed: number
  powerRating: number
  wins: number
  losses: number
  draws: number
  status: 'READY' | 'IN_ARENA' | 'DAMAGED' | 'SCRAPPED'
  scrapped: boolean
  avatarColor: string
  createdAt?: string
}

export interface CombatBotInput {
  name: string
  weightClass: WeightClass
  weaponType: WeaponType
  maxHealth: number
  attack: number
  defense: number
  speed: number
  avatarColor: string
}

export interface BattleRoundLog {
  round: number
  attackerId: number
  attackerName: string
  defenderId: number
  defenderName: string
  damageDealt: number
  isCritical: boolean
  isDodge: boolean
  defenderHpRemaining: number
  commentary: string
}

export interface DuelRequest {
  bot1Id: number
  bot2Id: number
  arenaEnvironment: ArenaEnvironment
}

export interface DuelResult {
  winner: CombatBot | null
  loser: CombatBot | null
  isDraw: boolean
  totalRounds: number
  arenaEnvironment: ArenaEnvironment
  combatLog: BattleRoundLog[]
  victoryQuote: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
}
