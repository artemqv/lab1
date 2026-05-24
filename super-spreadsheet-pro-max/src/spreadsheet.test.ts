import { describe, it, expect } from 'vitest';
import { evaluateFormula } from './formulaEngine';
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  isValidEmail,
  isValidNumber,
  isInRange,
  isNotEmpty,
  parseCSVLine,
  escapeCSV,
  generateId,
  deepClone,
} from './utils';

describe('Formula Engine', () => {
  const testGrid = [
    ['10', '20', '30'],
    ['5', '15', '25'],
    ['8', '12', '18']
  ];

  it('SUM calculates sum of range', () => {
    expect(evaluateFormula('=SUM(A1:C1)', testGrid)).toBe('60');
  });

  it('AVERAGE calculates average', () => {
    expect(evaluateFormula('=AVERAGE(A1:C1)', testGrid)).toBe('20');
  });

  it('MIN finds minimum value', () => {
    expect(evaluateFormula('=MIN(A1:C3)', testGrid)).toBe('5');
  });

  it('MAX finds maximum value', () => {
    expect(evaluateFormula('=MAX(A1:C3)', testGrid)).toBe('30');
  });

  it('COUNT counts numeric cells', () => {
    expect(evaluateFormula('=COUNT(A1:C3)', testGrid)).toBe('9');
  });

  it('handles cell references', () => {
    expect(evaluateFormula('=A1+B1', testGrid)).toBe('30');
  });

  it('handles errors', () => {
    expect(evaluateFormula('=AVERAGE(A1:A1)', [['text']])).toBe('#ДЕЛ/0!');
  });
});

describe('Number Formatting', () => {
  it('formatNumber formats with decimals', () => {
    expect(formatNumber(123.456, 2)).toBe('123.46');
    expect(formatNumber(123.456, 0)).toBe('123');
  });

  it('formatCurrency formats as currency', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234.56');
  });

  it('formatPercent formats as percentage', () => {
    expect(formatPercent(0.1234, 2)).toBe('12.34%');
    expect(formatPercent(0.5, 0)).toBe('50%');
  });

  it('formatDate formats date', () => {
    const date = new Date('2024-05-24');
    const result = formatDate(date);
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });
});

describe('Validation', () => {
  it('isValidEmail validates emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });

  it('isValidNumber validates numbers', () => {
    expect(isValidNumber('123')).toBe(true);
    expect(isValidNumber('123.45')).toBe(true);
    expect(isValidNumber('abc')).toBe(false);
  });

  it('isInRange checks range', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange(11, 1, 10)).toBe(false);
  });

  it('isNotEmpty checks for empty strings', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false);
  });
});

describe('CSV Utilities', () => {
  it('parseCSVLine parses simple CSV', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('parseCSVLine handles quoted values', () => {
    expect(parseCSVLine('"a,b",c,d')).toEqual(['a,b', 'c', 'd']);
  });

  it('parseCSVLine handles escaped quotes', () => {
    expect(parseCSVLine('"a""b",c')).toEqual(['a"b', 'c']);
  });

  it('escapeCSV escapes special characters', () => {
    expect(escapeCSV('hello')).toBe('hello');
    expect(escapeCSV('hello,world')).toBe('"hello,world"');
    expect(escapeCSV('say "hi"')).toBe('"say ""hi"""');
  });
});

describe('Utility Functions', () => {
  it('generateId creates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^id_\d+_[a-z0-9]+$/);
  });

  it('deepClone creates deep copy', () => {
    const obj = { a: 1, b: { c: 2 } };
    const clone = deepClone(obj);
    clone.b.c = 3;
    expect(obj.b.c).toBe(2);
    expect(clone.b.c).toBe(3);
  });
});
