import { ALL_GAMES } from '../games';
import { MiniGame } from './types';

export class GameRegistry {
  private static games: MiniGame[] = ALL_GAMES;

  public static getAll(): MiniGame[] {
    return this.games;
  }

  public static getById(id: string): MiniGame | undefined {
    return this.games.find((g) => g.config.id === id);
  }
}
