export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'COLLAPSING' | 'GAMEOVER';

export type FloorModuleStyle =
  | 'MODERN_APARTMENT_V1'
  | 'BRICK_APARTMENT'
  | 'GLASS_OFFICE'
  | 'CONCRETE_CANTILEVER'
  | 'INDUSTRIAL_FRAME'
  | 'SKY_GARDEN'
  | 'GLASS_MODERN'
  | 'BRUTALIST_CONCRETE'
  | 'RED_BRICK'
  | 'BALCONY_GARDEN'
  | 'WOOD_CLAD'
  | 'INDUSTRIAL_LOFT'
  | 'TERRACE_PERGOLA'
  | 'ART_DECO'
  | 'CANTILEVER_BAY'
  | 'AERODYNAMIC_METALLIC'
  | 'CORNER_BALCONY'
  | 'DUPLEX_PLANTERS';

export interface LiftingPoint {
  x: number;
  y: number;
  z: number;
}

export interface FloorDimensions {
  width: number;
  depth: number;
  height: number;
  liftingPoints?: LiftingPoint[];
}

export type FeedbackType = 'PERFECT' | 'GREAT' | 'BALANCED' | 'RISKY' | 'DANGEROUS' | null;

export type GameOverReason = 'MISSED_FLOOR' | 'REAL_TOP_COLLAPSE';

export interface GameStats {
  currentHeight: number;
  bestHeight: number;
  currentFloor: number;
  perfectStreak: number;
  isNewBest: boolean;
  gameOverReason?: GameOverReason;
  regionName?: string;
}

export interface FeedbackEvent {
  id: number;
  type: FeedbackType;
  message: string;
}
