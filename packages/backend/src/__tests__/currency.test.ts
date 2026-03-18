import { describe, it, expect } from 'vitest';
import { normalizeToMonthly } from '../utils/currency.js';

describe('normalizeToMonthly', () => {
  it('returns same amount for monthly', () => {
    expect(normalizeToMonthly(10, 'monthly')).toBe(10);
  });

  it('multiplies weekly by ~4.33', () => {
    expect(normalizeToMonthly(10, 'weekly')).toBeCloseTo(43.3, 1);
  });

  it('multiplies fortnightly by ~2.167', () => {
    expect(normalizeToMonthly(20, 'fortnightly')).toBeCloseTo(43.34, 1);
  });

  it('divides quarterly by 3', () => {
    expect(normalizeToMonthly(30, 'quarterly')).toBe(10);
  });

  it('divides annual by 12', () => {
    expect(normalizeToMonthly(120, 'annual')).toBe(10);
  });

  it('returns amount for unknown frequency', () => {
    expect(normalizeToMonthly(10, 'unknown')).toBe(10);
  });

  it('handles zero amount', () => {
    expect(normalizeToMonthly(0, 'monthly')).toBe(0);
  });
});
