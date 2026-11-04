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

export type StageId = 'LIVING_ROOM' | 'KITCHEN' | 'BEDROOM' | 'MAIN_ENTRANCE'

export interface StageConfig {
  id: StageId
  name: string
  hindiName: string
  subtitle: string
  targetScore: number
  timeLimit: number
  themeColor: string
  accentColor: string
  floorColor: string
  description: string
  mummyBriefing: string
  roomIcon: string
}

export type ItemType =
  | 'DUST'
  | 'SPIDERWEB'
  | 'DIYA'
  | 'KAJU_KATLI'
  | 'GOLD_COIN'
  | 'CHAPPAL'
  | 'SOAN_PAPDI'
  | 'SHARMA_JI'

export interface FallingItem {
  id: number
  type: ItemType
  x: number // percentage 5% to 88%
  y: number // percentage -5% to 105%
  speed: number
  width: number
  height: number
  label: string
  points: number
  isHazard: boolean
  rotation: number
  rotationSpeed: number
  warningTimer?: number // Used for warning indicator before hazards drop
  warningX?: number
  // For Sharma Ji zig-zag movement
  baseX?: number
  timeAlive?: number
}

export type AngerLevel = 'CALM' | 'SUSPICIOUS' | 'ANGRY' | 'RAGE'

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
  shape?: 'circle' | 'star' | 'sparkle'
}

export interface FloatingText {
  id: number
  x: number
  y: number
  text: string
  color: string
  opacity: number
}

export interface GameStats {
  score: number
  cleanlinessPercent: number
  dustCleared: number
  coinsCollected: number
  sweetsCollected: number
  chappalsDodged: number
  diyasCollected: number
  timeTaken: number
  livesRemaining: number
  stageId: StageId
  rankTitle: string
}

export interface SoundSettings {
  sfxEnabled: boolean
  musicEnabled: boolean
  vibrationEnabled: boolean
}
