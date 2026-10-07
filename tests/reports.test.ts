import { describe, expect, it } from 'vitest';
import { ProgressEntry } from '../src/core/types';
import { ReportsService } from '../src/panel/reports';

describe('ReportsService - CNEB y Recomendaciones', () => {
  it('calcula niveles formativos de logro CNEB correctamente', () => {
    const mockEntries: ProgressEntry[] = [
      {
        gameId: '01-cuenta-con-pomni',
        level: 4,
        hits: 8,
        misses: 1,
        timeMs: 120000,
        finishedAt: Date.now(),
        skillWorked: 'Conteo',
        area: 'Números',
      },
    ];

    const reports = ReportsService.calculateCNEBReports(mockEntries);
    expect(reports.cantidad).toBeDefined();
    expect(reports.cantidad.masteryPercentage).toBeGreaterThan(60);
    expect(['AD', 'A']).toContain(reports.cantidad.level);
  });

  it('genera recomendación de refuerzo si hay errores frecuentes en trazado', () => {
    const mockEntries: ProgressEntry[] = [
      {
        gameId: '03-traza-los-numeros',
        level: 1,
        hits: 2,
        misses: 5,
        timeMs: 180000,
        finishedAt: Date.now(),
        skillWorked: 'Trazado',
        area: 'Escritura',
      },
    ];

    const recs = ReportsService.generatePedagogicalRecommendations(mockEntries);
    expect(recs.some((r) => r.id === 'rec-trazado')).toBe(true);
  });
});
