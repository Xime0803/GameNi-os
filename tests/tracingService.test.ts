import { describe, it, expect } from 'vitest';
import { TracingService } from '../src/core/tracingService';

function createMockCanvas(): HTMLCanvasElement {
  return {
    width: 300,
    height: 420,
    getContext: () => ({
      save: () => {},
      restore: () => {},
      scale: () => {},
      clearRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      setLineDash: () => {},
    }),
    addEventListener: () => {},
    style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 420 }),
  } as unknown as HTMLCanvasElement;
}

describe('TracingService - Detección de trazo y salida de la línea', () => {
  it('debe aprobar un trazo bien seguido dentro del caminito (≥65% de cobertura sin salirse)', () => {
    const canvas = createMockCanvas();
    const service = new TracingService(canvas, 0.65);

    // Muestra de 20 puntos formando una línea recta horizontal en y=30 (x de 10 a 90)
    const samplePoints = Array.from({ length: 20 }, (_, i) => ({
      x: 10 + i * 4,
      y: 30,
    }));
    service.setSamplePointsForTesting(samplePoints);

    // Simular que el niño sigue el caminito casi en su totalidad (16 puntos sobre la línea)
    // Coordenadas canvas: normX = (canvasX / 300) * 100, normY = (canvasY / 420) * 140
    for (let i = 0; i < 16; i++) {
      const pt = samplePoints[i];
      const canvasX = (pt.x / 100) * 300;
      const canvasY = (pt.y / 140) * 420;
      service.simulatePoint(canvasX, canvasY);
    }

    expect(service.isCurrentlyOffTrack()).toBe(false);
    const result = service.evaluate();
    expect(result.wentOffTrack).toBe(false);
    expect(result.covered).toBeGreaterThanOrEqual(0.65);
    expect(result.passed).toBe(true);
  });

  it('debe RECHAZAR y marcar wentOffTrack=true si el trazo se sale de la línea (como dibujar un 4 sobre un 3)', () => {
    const canvas = createMockCanvas();
    const service = new TracingService(canvas, 0.65);

    // Puntos del número guía en x=70, y=30 a 100
    const samplePoints = Array.from({ length: 20 }, (_, i) => ({
      x: 70,
      y: 30 + i * 3.5,
    }));
    service.setSamplePointsForTesting(samplePoints);

    // El usuario dibuja trazos fuera en x=20 (a 50 unidades de distancia en el vacío)
    for (let i = 0; i < 10; i++) {
      const canvasX = (20 / 100) * 300;
      const canvasY = ((30 + i * 5) / 140) * 420;
      service.simulatePoint(canvasX, canvasY);
    }

    expect(service.isCurrentlyOffTrack()).toBe(true);
    const result = service.evaluate();
    expect(result.wentOffTrack).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('saliste del caminito');
  });

  it('debe rechazar trazos incompletos que no alcancen el 65% aunque no se hayan salido', () => {
    const canvas = createMockCanvas();
    const service = new TracingService(canvas, 0.65);

    const samplePoints = Array.from({ length: 20 }, (_, i) => ({
      x: 50,
      y: 20 + i * 5,
    }));
    service.setSamplePointsForTesting(samplePoints);

    // Solo traza 4 de 20 puntos (20% de cobertura)
    for (let i = 0; i < 4; i++) {
      const pt = samplePoints[i];
      service.simulatePoint((pt.x / 100) * 300, (pt.y / 140) * 420);
    }

    const result = service.evaluate();
    expect(result.wentOffTrack).toBe(false);
    expect(result.passed).toBe(false);
    expect(result.message).toContain('Casi lo logras');
  });

  it('debe resetear los contadores al limpiar con clear()', () => {
    const canvas = createMockCanvas();
    const service = new TracingService(canvas, 0.65);

    const samplePoints = Array.from({ length: 10 }, (_, i) => ({
      x: 30 + i * 4,
      y: 50,
    }));
    service.setSamplePointsForTesting(samplePoints);

    // Trazar puntos fuera
    for (let i = 0; i < 10; i++) {
      service.simulatePoint(0, 0);
    }
    expect(service.isCurrentlyOffTrack()).toBe(true);

    service.clear();
    expect(service.isCurrentlyOffTrack()).toBe(false);
    const result = service.evaluate();
    expect(result.covered).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.wentOffTrack).toBe(false);
  });
});
