import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { prisma } from '../lib/prisma.js';
import { extractSubscriptions } from '../services/vertexAi.js';
import { matchMerchant } from '../services/merchant.js';
import { hashBuffer } from '../utils/hash.js';
import {
  manualEntrySchema,
  emailIngestSchema,
  ALLOWED_PDF_TYPES,
  ALLOWED_IMAGE_TYPES,
} from '../utils/validation.js';

async function processExtracted(
  userId: string,
  method: 'pdf' | 'screenshot' | 'email',
  buffer: Buffer,
  extractionType: 'pdf' | 'screenshot',
) {
  const sourceHash = hashBuffer(buffer);

  // Check for duplicate uploads
  const existingUpload = await prisma.detectedItem.findFirst({
    where: { userId, sourceHash, status: 'PENDING' },
  });

  if (existingUpload) {
    return { duplicate: true, items: [], count: 0 };
  }

  // Extract subscriptions via Vertex AI
  const extracted = await extractSubscriptions(buffer, extractionType);

  // Create detected items inside a transaction
  const items = await prisma.$transaction(
    extracted.map((sub) =>
      prisma.detectedItem.create({
        data: {
          userId,
          ingestionMethod: method,
          aiMerchantName: sub.merchantName,
          aiAmount: sub.amount,
          aiCurrency: sub.currency ?? 'AUD',
          aiFrequency: sub.frequency,
          aiDetectedDate: sub.detectedDate,
          aiNextBilling: sub.nextBilling,
          aiConfidence: sub.confidence,
          aiNotes: sub.notes,
          sourceHash,
        },
      }),
    ),
  );

  // Match merchants (non-transactional, best-effort)
  const enriched = await Promise.all(
    items.map(async (item) => {
      const merchant = await matchMerchant(item.aiMerchantName ?? '');
      if (merchant) {
        await prisma.detectedItem.update({
          where: { id: item.id },
          data: { merchantId: merchant.id },
        });
      }
      return { ...item, merchantId: merchant?.id ?? null, merchant: merchant ?? null };
    }),
  );

  return { duplicate: false, items: enriched, count: enriched.length };
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

    return reply.send({ items: result.items, count: result.count });
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

    return reply.send({ items: result.items, count: result.count });
  });

  // Email forwarding (webhook from SendGrid or direct POST)
  app.post('/email', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const body = emailIngestSchema.parse(request.body);

    // Combine subject + body for extraction
    const emailContent = `From: ${body.from}\nSubject: ${body.subject}\n\n${body.body}`;
    const buffer = Buffer.from(emailContent, 'utf-8');
    const sourceHash = hashBuffer(buffer);

    // Check duplicate
    const existing = await prisma.detectedItem.findFirst({
      where: { userId, sourceHash, status: 'PENDING' },
    });

    if (existing) {
      return reply.status(409).send({ statusCode: 409, message: 'This email has already been processed' });
    }

    // Extract via AI (treat as text content, not PDF/image)
    const extracted = await extractSubscriptions(buffer, 'pdf');

    const items = await prisma.$transaction(
      extracted.map((sub) =>
        prisma.detectedItem.create({
          data: {
            userId,
            ingestionMethod: 'email',
            aiMerchantName: sub.merchantName,
            aiAmount: sub.amount,
            aiCurrency: sub.currency ?? 'AUD',
            aiFrequency: sub.frequency,
            aiDetectedDate: sub.detectedDate,
            aiNextBilling: sub.nextBilling,
            aiConfidence: sub.confidence,
            aiNotes: sub.notes,
            sourceHash,
          },
        }),
      ),
    );

    // Best-effort merchant matching
    const enriched = await Promise.all(
      items.map(async (item) => {
        const merchant = await matchMerchant(item.aiMerchantName ?? '');
        if (merchant) {
          await prisma.detectedItem.update({
            where: { id: item.id },
            data: { merchantId: merchant.id },
          });
        }
        return { ...item, merchant: merchant ?? null };
      }),
    );

    return reply.send({ items: enriched, count: enriched.length });
  });

  // Manual entry — creates a Subscription directly (no review queue)
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

    return reply.status(201).send({ subscription });
  });
}
