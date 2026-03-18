import { prisma } from '../lib/prisma.js';
import type { DetectedItemStatus } from '@prisma/client';

interface ConfirmedFields {
  confirmedMerchantName?: string;
  confirmedAmount?: number;
  confirmedCurrency?: string;
  confirmedFrequency?: string;
  confirmedNextBilling?: Date;
  subscriptionId?: string;
}

/**
 * Atomically purge all AI-extracted fields from a detected item
 * after user review (confirm/dismiss/merge).
 * Optionally stores user-confirmed overrides for prompt improvement.
 */
export async function purgeAiFields(
  itemId: string,
  newStatus: 'CONFIRMED' | 'DISMISSED' | 'MERGED',
  confirmedFields?: ConfirmedFields,
) {
  await prisma.detectedItem.update({
    where: { id: itemId },
    data: {
      status: newStatus as DetectedItemStatus,
      aiMerchantName: null,
      aiAmount: null,
      aiCurrency: null,
      aiFrequency: null,
      aiDetectedDate: null,
      aiNextBilling: null,
      aiConfidence: null,
      aiNotes: null,
      aiFieldsPurgedAt: new Date(),
      reviewedAt: new Date(),
      // Store user-confirmed overrides if provided
      ...(confirmedFields?.confirmedMerchantName !== undefined && {
        confirmedMerchantName: confirmedFields.confirmedMerchantName,
      }),
      ...(confirmedFields?.confirmedAmount !== undefined && {
        confirmedAmount: confirmedFields.confirmedAmount,
      }),
      ...(confirmedFields?.confirmedCurrency !== undefined && {
        confirmedCurrency: confirmedFields.confirmedCurrency,
      }),
      ...(confirmedFields?.confirmedFrequency !== undefined && {
        confirmedFrequency: confirmedFields.confirmedFrequency,
      }),
      ...(confirmedFields?.confirmedNextBilling !== undefined && {
        confirmedNextBilling: confirmedFields.confirmedNextBilling,
      }),
      ...(confirmedFields?.subscriptionId !== undefined && {
        subscriptionId: confirmedFields.subscriptionId,
      }),
    },
  });
}
