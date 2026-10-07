import { describe, expect, it } from 'vitest';
import { numberToSpanishWord } from '../src/core/numberWords';

describe('numberToSpanishWord phonetic converter', () => {
  it('converts units correctly', () => {
    expect(numberToSpanishWord(1)).toBe('uno');
    expect(numberToSpanishWord(5)).toBe('cinco');
    expect(numberToSpanishWord(9)).toBe('nueve');
  });

  it('converts teens and twenties correctly', () => {
    expect(numberToSpanishWord(10)).toBe('diez');
    expect(numberToSpanishWord(15)).toBe('quince');
    expect(numberToSpanishWord(16)).toBe('dieciséis');
    expect(numberToSpanishWord(20)).toBe('veinte');
    expect(numberToSpanishWord(21)).toBe('veintiuno');
    expect(numberToSpanishWord(28)).toBe('veintiocho');
  });

  it('converts compound tens and hundreds correctly', () => {
    expect(numberToSpanishWord(30)).toBe('treinta');
    expect(numberToSpanishWord(35)).toBe('treinta y cinco');
    expect(numberToSpanishWord(42)).toBe('cuarenta y dos');
    expect(numberToSpanishWord(99)).toBe('noventa y nueve');
    expect(numberToSpanishWord(100)).toBe('cien');
  });
});
