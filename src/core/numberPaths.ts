import { TracingGuide } from './types';

// Rutas vectoriales normalizadas en viewBox="0 0 100 140"
export const DIGIT_PATHS: Record<string, { path: string; start: { x: number; y: number } }> = {
  '0': {
    path: 'M 50 20 C 75 20, 80 50, 80 70 C 80 90, 75 120, 50 120 C 25 120, 20 90, 20 70 C 20 50, 25 20, 50 20 Z',
    start: { x: 50, y: 20 },
  },
  '1': {
    path: 'M 30 45 L 50 20 L 50 120',
    start: { x: 30, y: 45 },
  },
  '2': {
    path: 'M 25 45 C 25 20, 75 20, 75 45 C 75 70, 25 90, 25 120 L 75 120',
    start: { x: 25, y: 45 },
  },
  '3': {
    path: 'M 25 30 L 75 30 L 45 65 C 75 65, 80 95, 75 110 C 68 125, 30 125, 25 110',
    start: { x: 25, y: 30 },
  },
  '4': {
    path: 'M 65 120 L 65 20 L 20 85 L 80 85',
    start: { x: 65, y: 20 },
  },
  '5': {
    path: 'M 75 25 L 30 25 L 30 65 C 50 55, 80 65, 75 100 C 70 125, 35 125, 25 115',
    start: { x: 75, y: 25 },
  },
  '6': {
    path: 'M 70 25 C 40 25, 25 60, 25 85 C 25 110, 40 120, 55 120 C 75 120, 75 90, 55 90 C 35 90, 25 100, 25 85',
    start: { x: 70, y: 25 },
  },
  '7': {
    path: 'M 25 25 L 75 25 L 45 120',
    start: { x: 25, y: 25 },
  },
  '8': {
    path: 'M 50 65 C 30 65, 25 40, 50 25 C 75 40, 70 65, 50 65 C 25 65, 20 95, 50 118 C 80 95, 75 65, 50 65 Z',
    start: { x: 50, y: 25 },
  },
  '9': {
    path: 'M 50 75 C 30 75, 25 50, 45 30 C 65 30, 75 45, 75 75 L 75 120',
    start: { x: 75, y: 75 },
  },
};

export function getNumberGuide(num: number): TracingGuide {
  const str = Math.min(100, Math.max(0, Math.floor(num))).toString();
  if (str.length === 1 && DIGIT_PATHS[str]) {
    const digit = DIGIT_PATHS[str];
    return {
      id: `num-${str}`,
      label: str,
      svgPath: digit.path,
      startingPoint: digit.start,
    };
  }

  // Para números de dos dígitos (ej. 10 a 100), generar composición visual centrada
  const firstDigit = str[0];
  const digitInfo = DIGIT_PATHS[firstDigit] || DIGIT_PATHS['1'];
  return {
    id: `num-${str}`,
    label: str,
    svgPath: digitInfo.path,
    startingPoint: digitInfo.start,
  };
}
