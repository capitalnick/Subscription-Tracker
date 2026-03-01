import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { getAdminClient } from '../lib/supabase.js';
import { extractSubscriptions } from '../services/vertexAi.js';
import { resolveMerchant, matchMerchant } from '../services/merchant.js';
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
  const db = getAdminClient();
  const sourceHash = hashBuffer(buffer);

  // Check for duplicate uploads
  const { data: existingUpload } = await db
    .from('detected_items')
    .select('id')
    .eq('user_id', userId)
    .eq('source_hash', sourceHash)
    .eq('status', 'PENDING')
    .limit(1)
    .single();

  if (existingUpload) {
    return { duplicate: true, items: [], count: 0 };
  }

  // Extract subscriptions via Vertex AI
  const extracted = await extractSubscriptions(buffer, extractionType);

  // Resolve merchants BEFORE insert
  const resolved = await Promise.all(
    extracted.map(async (sub) => {
      const result = await resolveMerchant(sub.merchantName);
      return { sub, result };
    }),
  );

  // Create detected items with merchant_id and raw_descriptor pre-populated
  const itemsToInsert = resolved.map(({ sub, result }) => ({
    user_id: userId,
    ingestion_method: method,
    ai_merchant_name: result?.canonicalName ?? sub.merchantName,
    ai_amount: sub.amount,
    ai_currency: sub.currency ?? 'AUD',
    ai_frequency: sub.frequency,
    ai_detected_date: sub.detectedDate,
    ai_next_billing: sub.nextBilling,
    ai_confidence: sub.confidence,
    ai_notes: sub.notes,
    source_hash: sourceHash,
    merchant_id: result?.merchant?.id ?? null,
    raw_descriptor: sub.merchantName,
    updated_at: new Date().toISOString(),
  }));

  const { data: items, error } = await db
    .from('detected_items')
    .insert(itemsToInsert)
    .select('*, merchants(*)');

  if (error) throw error;

  const enriched = (items ?? []).map((item) => ({
    ...item,
    merchant: item.merchants ?? null,
  }));

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

  // Email forwarding
  app.post('/email', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const body = emailIngestSchema.parse(request.body);
    const db = getAdminClient();

    const emailContent = `From: ${body.from}\nSubject: ${body.subject}\n\n${body.body}`;
    const buffer = Buffer.from(emailContent, 'utf-8');
    const sourceHash = hashBuffer(buffer);

    // Check duplicate
    const { data: existing } = await db
      .from('detected_items')
      .select('id')
      .eq('user_id', userId)
      .eq('source_hash', sourceHash)
      .eq('status', 'PENDING')
      .limit(1)
      .single();

    if (existing) {
      return reply.status(409).send({ statusCode: 409, message: 'This email has already been processed' });
    }

    const extracted = await extractSubscriptions(buffer, 'pdf');

    // Resolve merchants BEFORE insert
    const resolved = await Promise.all(
      extracted.map(async (sub) => {
        const result = await resolveMerchant(sub.merchantName);
        return { sub, result };
      }),
    );

    const itemsToInsert = resolved.map(({ sub, result }) => ({
      user_id: userId,
      ingestion_method: 'email',
      ai_merchant_name: result?.canonicalName ?? sub.merchantName,
      ai_amount: sub.amount,
      ai_currency: sub.currency ?? 'AUD',
      ai_frequency: sub.frequency,
      ai_detected_date: sub.detectedDate,
      ai_next_billing: sub.nextBilling,
      ai_confidence: sub.confidence,
      ai_notes: sub.notes,
      source_hash: sourceHash,
      merchant_id: result?.merchant?.id ?? null,
      raw_descriptor: sub.merchantName,
      updated_at: new Date().toISOString(),
    }));

    const { data: items, error } = await db
      .from('detected_items')
      .insert(itemsToInsert)
      .select('*, merchants(*)');

    if (error) throw error;

    const enriched = (items ?? []).map((item) => ({
      ...item,
      merchant: item.merchants ?? null,
    }));

    return reply.send({ items: enriched, count: enriched.length });
  });

  // Manual entry — local lookup only, no AI cost
  app.post('/manual', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const body = manualEntrySchema.parse(request.body);
    const db = getAdminClient();

    const merchant = await matchMerchant(body.name);

    const { data: subscription, error } = await db
      .from('subscriptions')
      .insert({
        user_id: userId,
        merchant_id: merchant?.id ?? null,
        custom_name: body.name,
        amount: body.amount,
        currency: body.currency,
        frequency: body.frequency,
        category: body.category !== 'Other' ? body.category : (merchant?.category ?? 'Other'),
        next_billing_date: body.nextBillingDate ?? null,
        updated_at: new Date().toISOString(),
      })
      .select('*, merchants(*)')
      .single();

    if (error) throw error;

    return reply.status(201).send({ subscription });
  });
}
