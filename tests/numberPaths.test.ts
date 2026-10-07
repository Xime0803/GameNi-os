import { describe, expect, it } from 'vitest';
import { getNumberGuide } from '../src/core/numberPaths';

describe('numberPaths', () => {
  it('obtiene guía de trazado válida para dígitos del 0 al 9', () => {
    for (let i = 0; i <= 9; i++) {
      const guide = getNumberGuide(i);
      expect(guide.label).toBe(i.toString());
      expect(guide.svgPath).toBeDefined();
      expect(guide.startingPoint).toBeDefined();
      expect(guide.startingPoint.x).toBeGreaterThanOrEqual(0);
      expect(guide.startingPoint.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('soporta números compuestos hasta 100', () => {
    const guide25 = getNumberGuide(25);
    expect(guide25.label).toBe('25');
    expect(guide25.svgPath).toBeDefined();
  });
});
