import { prisma } from '../lib/prisma.js';

/**
 * Atomically purge all AI-extracted fields from a detected item
 * after user review (confirm/dismiss/merge).
 * This is the core privacy mechanism — no PII persists after review.
 */
export async function purgeAiFields(
  itemId: string,
  newStatus: 'CONFIRMED' | 'DISMISSED' | 'MERGED',
) {
  await prisma.detectedItem.update({
    where: { id: itemId },
    data: {
      status: newStatus,
      aiMerchantName: null,
      aiAmount: null,
      aiCurrency: null,
      aiFrequency: null,
      aiDetectedDate: null,
      aiNextBilling: null,
      aiConfidence: null,
      aiNotes: null,
      aiFieldsPurgedAt: new Date(),
    },
  });
}
