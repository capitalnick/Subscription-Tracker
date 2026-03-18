import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma before importing the module
const mockUpdate = vi.fn().mockResolvedValue({});
vi.mock('../lib/prisma.js', () => ({
  prisma: {
    detectedItem: {
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Import after mocking
const { purgeAiFields } = await import('../services/privacy.js');

describe('purgeAiFields', () => {
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  it('sets all AI fields to null on CONFIRMED', async () => {
    await purgeAiFields('item-1', 'CONFIRMED');

    expect(mockUpdate).toHaveBeenCalledOnce();
    const call = mockUpdate.mock.calls[0][0];
    expect(call.where).toEqual({ id: 'item-1' });
    expect(call.data.status).toBe('CONFIRMED');
    expect(call.data.aiMerchantName).toBeNull();
    expect(call.data.aiAmount).toBeNull();
    expect(call.data.aiCurrency).toBeNull();
    expect(call.data.aiFrequency).toBeNull();
    expect(call.data.aiDetectedDate).toBeNull();
    expect(call.data.aiNextBilling).toBeNull();
    expect(call.data.aiConfidence).toBeNull();
    expect(call.data.aiNotes).toBeNull();
    expect(call.data.aiFieldsPurgedAt).toBeInstanceOf(Date);
    expect(call.data.reviewedAt).toBeInstanceOf(Date);
  });

  it('sets status to DISMISSED', async () => {
    await purgeAiFields('item-2', 'DISMISSED');

    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.status).toBe('DISMISSED');
  });

  it('sets status to MERGED', async () => {
    await purgeAiFields('item-3', 'MERGED');

    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.status).toBe('MERGED');
  });

  it('stores confirmed fields when provided', async () => {
    await purgeAiFields('item-4', 'CONFIRMED', {
      confirmedMerchantName: 'Netflix',
      confirmedAmount: 13.99,
      confirmedCurrency: 'AUD',
      subscriptionId: 'sub-1',
    });

    const call = mockUpdate.mock.calls[0][0];
    expect(call.data.confirmedMerchantName).toBe('Netflix');
    expect(call.data.confirmedAmount).toBe(13.99);
    expect(call.data.confirmedCurrency).toBe('AUD');
    expect(call.data.subscriptionId).toBe('sub-1');
  });

  it('does not include confirmed fields when not provided', async () => {
    await purgeAiFields('item-5', 'DISMISSED');

    const call = mockUpdate.mock.calls[0][0];
    expect(call.data).not.toHaveProperty('confirmedMerchantName');
    expect(call.data).not.toHaveProperty('confirmedAmount');
    expect(call.data).not.toHaveProperty('subscriptionId');
  });
});
