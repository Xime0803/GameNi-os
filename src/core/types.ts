export type SkillArea = 'Números' | 'Escritura' | 'Vocabulario' | 'Lógica' | 'Vocabulario y Lógica';

export type AgeGroup = 'inicial' | 'avanzado'; // 3-6 años vs 7-10 años

export interface UserProfile {
  id: string; // ej: "perfil-1"
  name: string; // ej: "Mateo" o "Estudiante 1"
  avatar: string; // emoji de personaje
  ageGroup: AgeGroup;
  createdAt: number;
}

export interface ProgressEntry {
  gameId: string;
  level: number;
  hits: number;
  misses: number;
  timeMs: number;
  finishedAt: number;
  skillWorked: string;
  area: SkillArea;
  details?: {
    accuracy: number;
    specificItemsWorked?: string[];
  };
}

export interface ParentSettings {
  voiceSpeed: 'normal' | 'lenta' | 'muy_lenta'; // 0.85, 0.70, 0.55
  musicEnabled: boolean;
  soundMuted: boolean;
  dailyTimeLimitMinutes: number; // 0 = sin límite, 10, 20, 30, 45
  subtitlesEnabled: boolean;
  adultPassword?: string;
}

export interface RewardState {
  totalStars: number;
  unlockedStickers: string[];
  unlockedCharacters: string[];
  circusStageLevel: number; // 1: carpa básica, 2: banderines, 3: luces, 4: público, 5: gran espectáculo
}

export interface TracingPoint {
  x: number;
  y: number;
}

export interface TracingGuide {
  id: string;
  label: string;
  svgPath: string; // en viewBox 0 0 100 140
  startingPoint: TracingPoint;
  totalLength?: number;
}

export interface TracingResult {
  covered: number; // 0.0 a 1.0
  passed: boolean;
  wentBackwards: boolean;
  message?: string;
}

export interface MiniGameConfig {
  id: string;
  title: string;
  area: SkillArea;
  characterId: string;
  description: string;
  instruction: string;
  outfit: 'default' | 'artist' | 'explorer' | 'chef' | 'magician' | 'detective';
  rounds: number;
  levels: number;
}

export interface MiniGameSessionResult {
  gameId: string;
  finalLevel: number;
  hits: number;
  misses: number;
  timeSpentMs: number;
  skillWorked: string;
  area: SkillArea;
  details?: Record<string, any>;
}

export interface MiniGame {
  readonly config: MiniGameConfig;
  mount(container: HTMLElement, onComplete: (result: MiniGameSessionResult) => void): void | Promise<void>;
  unmount(): void;
}
