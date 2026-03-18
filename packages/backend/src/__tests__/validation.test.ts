import { describe, it, expect } from 'vitest';
import {
  registerProfileSchema,
  manualEntrySchema,
  emailIngestSchema,
  confirmItemSchema,
  mergeItemSchema,
  updateSubscriptionSchema,
  paginationSchema,
  merchantSearchSchema,
} from '../utils/validation.js';

describe('registerProfileSchema', () => {
  it('accepts valid data', () => {
    const result = registerProfileSchema.parse({
      supabaseId: 'abc-123',
      email: 'test@example.com',
    });
    expect(result.supabaseId).toBe('abc-123');
    expect(result.email).toBe('test@example.com');
  });

  it('rejects missing supabaseId', () => {
    expect(() => registerProfileSchema.parse({ email: 'test@example.com' })).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => registerProfileSchema.parse({ supabaseId: 'abc', email: 'not-email' })).toThrow();
  });
});

describe('manualEntrySchema', () => {
  it('accepts valid data with defaults', () => {
    const result = manualEntrySchema.parse({
      name: 'Netflix',
      amount: 13.99,
      frequency: 'monthly',
    });
    expect(result.currency).toBe('AUD');
    expect(result.category).toBe('Other');
  });

  it('rejects negative amount', () => {
    expect(() => manualEntrySchema.parse({
      name: 'Netflix',
      amount: -5,
      frequency: 'monthly',
    })).toThrow();
  });

  it('rejects invalid frequency', () => {
    expect(() => manualEntrySchema.parse({
      name: 'Netflix',
      amount: 10,
      frequency: 'daily',
    })).toThrow();
  });
});

describe('emailIngestSchema', () => {
  it('accepts valid email data', () => {
    const result = emailIngestSchema.parse({
      from: 'billing@netflix.com',
      subject: 'Your receipt',
      body: 'Payment of $13.99',
    });
    expect(result.from).toBe('billing@netflix.com');
  });

  it('rejects empty body', () => {
    expect(() => emailIngestSchema.parse({
      from: 'a@b.com',
      subject: 'test',
      body: '',
    })).toThrow();
  });
});

describe('confirmItemSchema', () => {
  it('accepts empty object (no overrides)', () => {
    const result = confirmItemSchema.parse({});
    expect(result).toEqual({});
  });

  it('accepts partial overrides', () => {
    const result = confirmItemSchema.parse({
      amount: 15.99,
      frequency: 'annual',
    });
    expect(result?.amount).toBe(15.99);
    expect(result?.frequency).toBe('annual');
  });
});

describe('mergeItemSchema', () => {
  it('accepts valid UUID', () => {
    const result = mergeItemSchema.parse({
      subscriptionId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.subscriptionId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('rejects non-UUID', () => {
    expect(() => mergeItemSchema.parse({ subscriptionId: 'not-a-uuid' })).toThrow();
  });
});

describe('updateSubscriptionSchema', () => {
  it('accepts status field', () => {
    const result = updateSubscriptionSchema.parse({ status: 'CANCELLED' });
    expect(result.status).toBe('CANCELLED');
  });

  it('accepts notes field', () => {
    const result = updateSubscriptionSchema.parse({ notes: 'Shared with family' });
    expect(result.notes).toBe('Shared with family');
  });

  it('accepts null nextBillingDate', () => {
    const result = updateSubscriptionSchema.parse({ nextBillingDate: null });
    expect(result.nextBillingDate).toBeNull();
  });

  it('rejects invalid status', () => {
    expect(() => updateSubscriptionSchema.parse({ status: 'INVALID' })).toThrow();
  });

  it('still accepts isActive for backward compat', () => {
    const result = updateSubscriptionSchema.parse({ isActive: false });
    expect(result.isActive).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('applies defaults', () => {
    const result = paginationSchema.parse({});
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it('coerces string numbers', () => {
    const result = paginationSchema.parse({ limit: '20', offset: '10' });
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(10);
  });

  it('clamps limit to max 100', () => {
    expect(() => paginationSchema.parse({ limit: 200 })).toThrow();
  });
});

describe('merchantSearchSchema', () => {
  it('accepts valid query', () => {
    const result = merchantSearchSchema.parse({ q: 'net' });
    expect(result.q).toBe('net');
  });

  it('rejects single character', () => {
    expect(() => merchantSearchSchema.parse({ q: 'n' })).toThrow();
  });
});
