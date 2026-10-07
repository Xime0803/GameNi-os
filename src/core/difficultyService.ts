import { DEFAULT_DIFFICULTY_RULES } from '../config/difficulty';

export class DifficultyService {
  private currentLevel: number = 1;
  private consecutiveHits: number = 0;
  private consecutiveMisses: number = 0;
  private maxLevel: number = DEFAULT_DIFFICULTY_RULES.totalLevels;
  private minLevel: number = 1;

  constructor(initialLevel: number = 1) {
    this.currentLevel = Math.max(1, Math.min(this.maxLevel, initialLevel));
  }

  public recordHit(): { levelChanged: boolean; newLevel: number } {
    this.consecutiveHits++;
    this.consecutiveMisses = 0;

    if (this.consecutiveHits >= DEFAULT_DIFFICULTY_RULES.hitsToLevelUp) {
      this.consecutiveHits = 0;
      if (this.currentLevel < this.maxLevel) {
        this.currentLevel++;
        return { levelChanged: true, newLevel: this.currentLevel };
      }
    }
    return { levelChanged: false, newLevel: this.currentLevel };
  }

  public recordMiss(): { levelChanged: boolean; newLevel: number } {
    this.consecutiveMisses++;
    this.consecutiveHits = 0;

    if (this.consecutiveMisses >= DEFAULT_DIFFICULTY_RULES.missesToLevelDown) {
      this.consecutiveMisses = 0;
      if (this.currentLevel > this.minLevel) {
        this.currentLevel--;
        return { levelChanged: true, newLevel: this.currentLevel };
      }
    }
    return { levelChanged: false, newLevel: this.currentLevel };
  }

  public getLevel(): number {
    return this.currentLevel;
  }

  public setLevel(lvl: number): void {
    this.currentLevel = Math.max(1, Math.min(this.maxLevel, lvl));
    this.consecutiveHits = 0;
    this.consecutiveMisses = 0;
  }
}
