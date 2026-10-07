/**
 * Conversor fonético optimizado de números a palabras en español (Perú / Latinoamérica)
 * Permite que los motores de síntesis de voz (SpeechSynthesis) pronuncien números
 * de forma instantánea y natural sin retrasos de normalización regex.
 */

const UNITS: Record<number, string> = {
  0: 'cero',
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veintisiete',
  28: 'veintiocho',
  29: 'veintinueve',
};

const TENS: Record<number, string> = {
  3: 'treinta',
  4: 'cuarenta',
  5: 'cincuenta',
  6: 'sesenta',
  7: 'setenta',
  8: 'ochenta',
  9: 'noventa',
};

export function numberToSpanishWord(num: number): string {
  const n = Math.floor(num);
  if (n <= 29) {
    return UNITS[n] || n.toString();
  }

  if (n === 100) {
    return 'cien';
  }

  const tensDigit = Math.floor(n / 10);
  const unitsDigit = n % 10;
  const tensWord = TENS[tensDigit];

  if (!tensWord) {
    return n.toString();
  }

  if (unitsDigit === 0) {
    return tensWord;
  }

  return `${tensWord} y ${UNITS[unitsDigit] || unitsDigit}`;
}
