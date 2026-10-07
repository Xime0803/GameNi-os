import { describe, expect, it } from 'vitest';
import { DifficultyService } from '../src/core/difficultyService';

describe('DifficultyService', () => {
  it('inicia en nivel 1 por defecto', () => {
    const diff = new DifficultyService();
    expect(diff.getLevel()).toBe(1);
  });

  it('sube de nivel tras 3 aciertos consecutivos', () => {
    const diff = new DifficultyService(1);
    expect(diff.recordHit().levelChanged).toBe(false);
    expect(diff.recordHit().levelChanged).toBe(false);
    const result = diff.recordHit();
    expect(result.levelChanged).toBe(true);
    expect(result.newLevel).toBe(2);
    expect(diff.getLevel()).toBe(2);
  });

  it('no sube más allá del nivel 5', () => {
    const diff = new DifficultyService(5);
    diff.recordHit();
    diff.recordHit();
    const result = diff.recordHit();
    expect(result.levelChanged).toBe(false);
    expect(diff.getLevel()).toBe(5);
  });

  it('baja de nivel tras 2 errores consecutivos', () => {
    const diff = new DifficultyService(3);
    expect(diff.recordMiss().levelChanged).toBe(false);
    const result = diff.recordMiss();
    expect(result.levelChanged).toBe(true);
    expect(result.newLevel).toBe(2);
    expect(diff.getLevel()).toBe(2);
  });

  it('no baja más allá del nivel 1', () => {
    const diff = new DifficultyService(1);
    diff.recordMiss();
    const result = diff.recordMiss();
    expect(result.levelChanged).toBe(false);
    expect(diff.getLevel()).toBe(1);
  });
});
