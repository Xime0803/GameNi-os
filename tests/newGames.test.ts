import { describe, it, expect } from 'vitest';
import { ALL_GAMES } from '../src/games';
import { ConectaNumerosGame } from '../src/games/11-conecta-numeros';
import { SumasInicialGame } from '../src/games/12-sumas-inicial';
import { config as conectaConfig } from '../src/games/11-conecta-numeros/config';
import { config as sumasConfig } from '../src/games/12-sumas-inicial/config';

describe('Nuevos Juegos Infantiles: Conecta Números y Primeras Sumas', () => {
  it('debe registrar 12 juegos en el catálogo central ALL_GAMES', () => {
    expect(ALL_GAMES.length).toBe(12);
    const gameIds = ALL_GAMES.map((g) => g.config.id);
    expect(gameIds).toContain('11-conecta-numeros');
    expect(gameIds).toContain('12-sumas-inicial');
  });

  describe('Juego 11: Une Números y Dibujos (Conecta con Líneas)', () => {
    it('tiene la configuración pedagógica adecuada para ciclo II inicial', () => {
      expect(conectaConfig.id).toBe('11-conecta-numeros');
      expect(conectaConfig.title).toBe('Une Números y Dibujos');
      expect(conectaConfig.area).toBe('Números');
      expect(conectaConfig.characterId).toBe('bubble');
      expect(conectaConfig.rounds).toBe(4);
      expect(conectaConfig.levels).toBe(3);
    });

    it('se instancia correctamente como MiniGame', () => {
      const game = new ConectaNumerosGame();
      expect(game.config.id).toBe('11-conecta-numeros');
      expect(typeof game.mount).toBe('function');
      expect(typeof game.unmount).toBe('function');
    });
  });

  describe('Juego 12: Primeras Sumas (3 a 5 Años)', () => {
    it('tiene la configuración pedagógica concreta y manipulativa', () => {
      expect(sumasConfig.id).toBe('12-sumas-inicial');
      expect(sumasConfig.title).toBe('Primeras Sumas (3 a 5 años)');
      expect(sumasConfig.area).toBe('Números');
      expect(sumasConfig.characterId).toBe('kaufmo');
      expect(sumasConfig.rounds).toBe(6);
      expect(sumasConfig.levels).toBe(3);
    });

    it('se instancia correctamente como MiniGame', () => {
      const game = new SumasInicialGame();
      expect(game.config.id).toBe('12-sumas-inicial');
      expect(typeof game.mount).toBe('function');
      expect(typeof game.unmount).toBe('function');
    });
  });
});
