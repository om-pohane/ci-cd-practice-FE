export interface DiwaliWish {
  id: number
  wishCode: string
  fromName: string
  toName: string
  customMessage: string
  targetScore: number
  viewsCount: number
  createdAt: string
}

export interface CreateWishRequest {
  fromName: string
  toName: string
  customMessage: string
  targetScore?: number
}

export interface SafaiScore {
  id: number
  playerName: string
  wishCode?: string
  score: number
  kajuKatlis: number
  diyas: number
  chappalsDodged: number
  rankTitle: string
  createdAt: string
}

export interface SubmitScoreRequest {
  playerName: string
  wishCode?: string
  score: number
  kajuKatlis: number
  diyas: number
  chappalsDodged: number
}

export type ItemType =
  | 'DUST'
  | 'DIYA'
  | 'KAJU_KATLI'
  | 'GOLD_COIN'
  | 'CHAPPAL'
  | 'SOAN_PAPDI'
  | 'SHARMA_JI'

export interface FallingItem {
  id: number
  type: ItemType
  x: number // percentage 5% to 90%
  y: number // percentage 0% to 95%
  speed: number
  emoji: string
  label: string
  points: number
  isHazard: boolean
}

export interface FloatingText {
  id: number
  x: number
  y: number
  text: string
  color: string
}
