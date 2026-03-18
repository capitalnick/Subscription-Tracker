import { describe, it, expect } from 'vitest';
import { hashBuffer } from '../utils/hash.js';

describe('hashBuffer', () => {
  it('returns a hex string', () => {
    const result = hashBuffer(Buffer.from('hello'));
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it('produces consistent hashes for same input', () => {
    const buf = Buffer.from('test data');
    expect(hashBuffer(buf)).toBe(hashBuffer(buf));
  });

  it('produces different hashes for different input', () => {
    expect(hashBuffer(Buffer.from('a'))).not.toBe(hashBuffer(Buffer.from('b')));
  });

  it('handles empty buffer', () => {
    const result = hashBuffer(Buffer.from(''));
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });
});
