export interface GameDifficultyConfig {
  gameId: string;
  totalLevels: number;
  roundsPerSession: number;
  hitsToLevelUp: number;
  missesToLevelDown: number;
  levels: {
    level: number;
    name: string;
    description: string;
    cnebCycle: 'Ciclo II (3-6 años)' | 'Ciclo III (7-8 años)' | 'Ciclo IV (9-10 años)';
    params: Record<string, number | string | boolean>;
  }[];
}

export const DEFAULT_DIFFICULTY_RULES = {
  hitsToLevelUp: 3,
  missesToLevelDown: 2,
  roundsPerSession: 8,
  totalLevels: 5,
};
