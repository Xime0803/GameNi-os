import { TracingGuide } from './types';

export const LETTER_PATHS: Record<string, { path: string; start: { x: number; y: number } }> = {
  A: {
    path: 'M 50 20 L 20 120 M 50 20 L 80 120 M 32 80 L 68 80',
    start: { x: 50, y: 20 },
  },
  E: {
    path: 'M 80 20 L 25 20 L 25 120 L 80 120 M 25 70 L 70 70',
    start: { x: 80, y: 20 },
  },
  I: {
    path: 'M 30 20 L 70 20 M 50 20 L 50 120 M 30 120 L 70 120',
    start: { x: 50, y: 20 },
  },
  O: {
    path: 'M 50 20 C 80 20, 80 120, 50 120 C 20 120, 20 20, 50 20 Z',
    start: { x: 50, y: 20 },
  },
  U: {
    path: 'M 25 20 L 25 85 C 25 120, 75 120, 75 85 L 75 20',
    start: { x: 25, y: 20 },
  },
  M: {
    path: 'M 20 120 L 20 20 L 50 80 L 80 20 L 80 120',
    start: { x: 20, y: 120 },
  },
  P: {
    path: 'M 25 120 L 25 20 L 65 20 C 80 20, 80 70, 65 70 L 25 70',
    start: { x: 25, y: 20 },
  },
  S: {
    path: 'M 75 35 C 75 20, 30 20, 30 50 C 30 75, 75 75, 75 100 C 75 125, 25 125, 25 105',
    start: { x: 75, y: 35 },
  },
};

export function getLetterGuide(letter: string): TracingGuide {
  const upper = letter.toUpperCase();
  const info = LETTER_PATHS[upper] || LETTER_PATHS['A'];
  return {
    id: `letter-${upper}`,
    label: upper,
    svgPath: info.path,
    startingPoint: info.start,
  };
}
