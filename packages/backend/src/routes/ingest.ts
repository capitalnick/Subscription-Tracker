import type { FastifyInstance } from 'fastify';
import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { extractSubscriptions } from '../services/vertexAi.js';
import { resolveMerchant, matchMerchant } from '../services/merchant.js';
import { hashBuffer } from '../utils/hash.js';
import {
  manualEntrySchema,
  emailIngestSchema,
  ALLOWED_PDF_TYPES,
  ALLOWED_IMAGE_TYPES,
} from '../utils/validation.js';
import type { IngestionSource } from '@prisma/client';

async function processExtracted(
  userId: string,
  method: 'pdf' | 'screenshot' | 'email',
  buffer: Buffer,
  extractionType: 'pdf' | 'screenshot',
) {
  const sourceHash = hashBuffer(buffer);

  // Check for duplicate uploads
  const existingUpload = await prisma.detectedItem.findFirst({
    where: {
      userId,
      sourceHash,
      status: 'PENDING',
    },
  });

  if (existingUpload) {
    return { duplicate: true, items: [], count: 0, ingestionEventId: null };
  }

  // Create ingestion event
  const ingestionSource = method.toUpperCase() as IngestionSource;
  const ingestionEvent = await prisma.ingestionEvent.create({
    data: {
      userId,
      source: ingestionSource,
      status: 'PROCESSING',
      sourceHash,
    },
  });

  const startTime = Date.now();

  try {
    // Extract subscriptions via Vertex AI
    const extracted = await extractSubscriptions(buffer, extractionType);
    const processingMs = Date.now() - startTime;

    // Resolve merchants BEFORE insert
    const resolved = await Promise.all(
      extracted.map(async (sub) => {
        const result = await resolveMerchant(sub.merchantName);
        return { sub, result };
      }),
    );

    // Fetch existing subscriptions for duplicate detection
    const existingSubs = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { id: true, merchantId: true, amount: true },
    });

    // Create detected items with merchant_id, raw_descriptor, and duplicate detection
    const items = await Promise.all(
      resolved.map(async ({ sub, result }) => {
        // Enhanced duplicate detection: merchant + amount matching
        let duplicateOf: string | null = null;
        let duplicateConfidence: number | null = null;
        let isDuplicate = false;

        if (result?.merchant?.id) {
          const matchingSub = existingSubs.find((s) => s.merchantId === result.merchant.id);
          if (matchingSub) {
            const subAmount = Number(matchingSub.amount);
            const detectedAmount = sub.amount ?? 0;
            if (Math.abs(subAmount - detectedAmount) < 0.01) {
              // Exact match: same merchant, same amount
              duplicateOf = matchingSub.id;
              duplicateConfidence = 0.95;
              isDuplicate = true;
            } else if (subAmount > 0 && detectedAmount > 0 && Math.abs(subAmount - detectedAmount) / subAmount < 0.10) {
              // Near match: same merchant, within 10% — possible price change
              duplicateOf = matchingSub.id;
              duplicateConfidence = 0.75;
              isDuplicate = true;
            }
          }
        }

        return prisma.detectedItem.create({
          data: {
            userId,
            ingestionMethod: method,
            aiMerchantName: result?.canonicalName ?? sub.merchantName,
            aiAmount: sub.amount,
            aiCurrency: sub.currency ?? 'AUD',
            aiFrequency: sub.frequency,
            aiDetectedDate: sub.detectedDate,
            aiNextBilling: sub.nextBilling,
            aiConfidence: sub.confidence,
            aiNotes: sub.notes,
            sourceHash,
            merchantId: result?.merchant?.id ?? null,
            rawDescriptor: sub.merchantName,
            ingestionEventId: ingestionEvent.id,
            duplicate: isDuplicate,
            duplicateOf,
            duplicateConfidence,
          },
          include: { merchant: true },
        });
      }),
    );

    // Update ingestion event
    await prisma.ingestionEvent.update({
      where: { id: ingestionEvent.id },
      data: {
        status: 'COMPLETED',
        itemsDetected: items.length,
        processingMs,
        aiModel: 'gemini-2.0-flash',
        processedAt: new Date(),
      },
    });

    return { duplicate: false, items, count: items.length, ingestionEventId: ingestionEvent.id };
  } catch (error) {
    // Mark ingestion event as failed
    await prisma.ingestionEvent.update({
      where: { id: ingestionEvent.id },
      data: {
        status: 'FAILED',
        processingMs: Date.now() - startTime,
        processedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function ingestRoutes(app: FastifyInstance) {
  // PDF upload
  app.post('/pdf', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({ statusCode: 400, message: 'No file uploaded' });
    }

    if (!ALLOWED_PDF_TYPES.includes(file.mimetype)) {
      return reply.status(400).send({
        statusCode: 400,
        message: `Invalid file type: ${file.mimetype}. Expected PDF.`,
      });
    }

    const buffer = await file.toBuffer();
    const result = await processExtracted(userId, 'pdf', buffer, 'pdf');

    if (result.duplicate) {
      return reply.status(409).send({ statusCode: 409, message: 'This file has already been processed' });
    }

    return reply.send({ items: result.items, count: result.count, ingestionEventId: result.ingestionEventId });
  });

  // Screenshot upload
  app.post('/screenshot', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({ statusCode: 400, message: 'No file uploaded' });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return reply.status(400).send({
        statusCode: 400,
        message: `Invalid file type: ${file.mimetype}. Expected JPEG, PNG, WebP, or HEIC.`,
      });
    }

    const buffer = await file.toBuffer();
    const result = await processExtracted(userId, 'screenshot', buffer, 'screenshot');

    if (result.duplicate) {
      return reply.status(409).send({ statusCode: 409, message: 'This file has already been processed' });
    }

    return reply.send({ items: result.items, count: result.count, ingestionEventId: result.ingestionEventId });
  });

  // Email forwarding (with optional SendGrid webhook signature verification)
  app.post('/email', { preHandler: [authMiddleware] }, async (request, reply) => {
    // Verify SendGrid webhook signature if key is configured
    if (config.sendgrid.webhookVerificationKey) {
      const ew = new EventWebhook();
      const ecPublicKey = ew.convertPublicKeyToECDSA(config.sendgrid.webhookVerificationKey);
      const signature = request.headers[EventWebhookHeader.SIGNATURE()] as string;
      const timestamp = request.headers[EventWebhookHeader.TIMESTAMP()] as string;
      const rawBody = JSON.stringify(request.body);

      if (!signature || !timestamp || !ew.verifySignature(ecPublicKey, rawBody, signature, timestamp)) {
        return reply.status(403).send({ statusCode: 403, message: 'Invalid SendGrid signature' });
      }
    }

    const { userId } = request as AuthenticatedRequest;
    const body = emailIngestSchema.parse(request.body);

    const emailContent = `From: ${body.from}\nSubject: ${body.subject}\n\n${body.body}`;
    const buffer = Buffer.from(emailContent, 'utf-8');
    const result = await processExtracted(userId, 'email', buffer, 'pdf');

    if (result.duplicate) {
      return reply.status(409).send({ statusCode: 409, message: 'This email has already been processed' });
    }

    return reply.send({ items: result.items, count: result.count, ingestionEventId: result.ingestionEventId });
  });

  // Manual entry — local lookup only, no AI cost
  app.post('/manual', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const body = manualEntrySchema.parse(request.body);

    const merchant = await matchMerchant(body.name);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        merchantId: merchant?.id ?? null,
        customName: body.name,
        amount: body.amount,
        currency: body.currency,
        frequency: body.frequency,
        category: body.category !== 'Other' ? body.category : (merchant?.category ?? 'Other'),
        nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : null,
      },
      include: { merchant: true },
    });

    return reply.status(201).send({ subscription: formatSubscription(subscription) });
  });
}

function formatSubscription(sub: Record<string, unknown>) {
  const merchant = sub.merchant as Record<string, unknown> | null;
  return {
    id: sub.id,
    userId: sub.userId,
    merchantId: sub.merchantId,
    customName: sub.customName,
    displayName: (sub.customName as string) ?? (merchant?.canonicalName as string) ?? 'Unknown',
    amount: Number(sub.amount),
    currency: sub.currency,
    frequency: sub.frequency,
    category: sub.category,
    nextBillingDate: sub.nextBillingDate ?? null,
    status: sub.status,
    isActive: sub.status === 'ACTIVE',
    detectedPlanId: sub.detectedPlanId ?? null,
    planConfirmed: sub.planConfirmed ?? false,
    logoUrl: (merchant?.logoUrl as string) ?? null,
    logoColor: (merchant?.logoColor as string) ?? '#9CA3AF',
    logoLetter: (merchant?.logoLetter as string) ?? '?',
    websiteUrl: (merchant?.websiteUrl as string) ?? null,
    merchant: merchant ? {
      id: merchant.id,
      canonicalName: merchant.canonicalName,
      slug: merchant.slug,
      category: merchant.category,
      commonDescriptors: merchant.commonDescriptors,
      websiteUrl: merchant.websiteUrl,
      logoUrl: merchant.logoUrl ?? null,
      logoLetter: merchant.logoLetter,
      logoColor: merchant.logoColor,
      knownPlans: merchant.knownPlans ?? [],
    } : null,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
}
