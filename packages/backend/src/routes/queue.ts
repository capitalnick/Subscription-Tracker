import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { getAdminClient } from '../lib/supabase.js';
import { confirmItemSchema, mergeItemSchema, paginationSchema } from '../utils/validation.js';

interface MerchantPlan {
  id: string;
  label: string;
  tier_rank: number;
  amounts_aud: number[];
  max_users: number | null;
  plan_type: string;
  features: string[];
  is_active: boolean;
}

function detectPlan(knownPlans: MerchantPlan[], amountAud: number): MerchantPlan | null {
  // Exact match first
  const exact = knownPlans.find((p) =>
    p.amounts_aud.some((a) => Math.abs(a - amountAud) < 0.01),
  );
  if (exact) return exact;

  // Fuzzy match within 5%
  const fuzzy = knownPlans.find((p) =>
    p.amounts_aud.some((a) => Math.abs(a - amountAud) / a < 0.05),
  );
  return fuzzy ?? null;
}

function formatSubscription(sub: Record<string, unknown>) {
  const merchant = sub.merchants as Record<string, unknown> | null;
  const knownPlans = (merchant?.known_plans as unknown[]) ?? [];
  return {
    id: sub.id,
    userId: sub.user_id,
    merchantId: sub.merchant_id,
    customName: sub.custom_name,
    displayName: (sub.custom_name as string) ?? (merchant?.canonical_name as string) ?? 'Unknown',
    amount: Number(sub.amount),
    currency: sub.currency,
    frequency: sub.frequency,
    category: sub.category,
    nextBillingDate: sub.next_billing_date ?? null,
    isActive: sub.is_active,
    detectedPlanId: sub.detected_plan_id ?? null,
    planConfirmed: sub.plan_confirmed ?? false,
    logoUrl: (merchant?.logo_url as string) ?? null,
    logoColor: (merchant?.logo_color as string) ?? '#9CA3AF',
    logoLetter: (merchant?.logo_letter as string) ?? '?',
    websiteUrl: (merchant?.website_url as string) ?? null,
    merchant: merchant ? {
      id: merchant.id,
      canonicalName: merchant.canonical_name,
      slug: merchant.slug,
      category: merchant.category,
      commonDescriptors: merchant.common_descriptors,
      websiteUrl: merchant.website_url,
      logoUrl: merchant.logo_url ?? null,
      logoLetter: merchant.logo_letter,
      logoColor: merchant.logo_color,
      knownPlans,
    } : null,
    createdAt: sub.created_at,
    updatedAt: sub.updated_at,
  };
}

function formatItem(item: Record<string, unknown>) {
  const merchant = item.merchants as Record<string, unknown> | null;
  const knownPlans = (merchant?.known_plans as unknown[]) ?? [];
  return {
    id: item.id,
    userId: item.user_id,
    ingestionMethod: item.ingestion_method,
    status: item.status,
    aiMerchantName: item.ai_merchant_name,
    aiAmount: item.ai_amount != null ? Number(item.ai_amount) : null,
    aiCurrency: item.ai_currency,
    aiFrequency: item.ai_frequency,
    aiDetectedDate: item.ai_detected_date,
    aiNextBilling: item.ai_next_billing,
    aiConfidence: item.ai_confidence,
    aiNotes: item.ai_notes,
    aiFieldsPurgedAt: item.ai_fields_purged_at,
    merchantId: item.merchant_id,
    merchant: merchant ? {
      id: merchant.id,
      canonicalName: merchant.canonical_name,
      slug: merchant.slug,
      category: merchant.category,
      commonDescriptors: merchant.common_descriptors,
      websiteUrl: merchant.website_url,
      logoUrl: merchant.logo_url ?? null,
      logoLetter: merchant.logo_letter,
      logoColor: merchant.logo_color,
      knownPlans,
    } : null,
    duplicate: item.duplicate,
    sourceHash: item.source_hash,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

export async function queueRoutes(app: FastifyInstance) {
  // Get review queue with pagination
  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { limit, offset } = paginationSchema.parse(request.query);
    const db = getAdminClient();

    const { data: items, count: total } = await db
      .from('detected_items')
      .select('*, merchants(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { count: pending } = await db
      .from('detected_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'PENDING');

    return reply.send({
      items: (items ?? []).map(formatItem),
      total: total ?? 0,
      pending: pending ?? 0,
      limit,
      offset,
    });
  });

  // Confirm item → create subscription + purge AI fields + detect plan
  app.post('/:id/confirm', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const overrides = confirmItemSchema.parse(request.body);
    const db = getAdminClient();

    const { data: item } = await db
      .from('detected_items')
      .select('*, merchants(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'PENDING')
      .single();

    if (!item) {
      return reply.status(404).send({ statusCode: 404, message: 'Item not found or already reviewed' });
    }

    // Detect plan if merchant has known_plans
    const merchant = item.merchants as Record<string, unknown> | null;
    const knownPlans = (merchant?.known_plans as MerchantPlan[]) ?? [];
    const amount = overrides?.amount ?? (item.ai_amount != null ? Number(item.ai_amount) : 0);
    const detectedPlan = knownPlans.length > 0 ? detectPlan(knownPlans, amount) : null;

    // Create subscription
    const { data: subscription, error: subError } = await db
      .from('subscriptions')
      .insert({
        user_id: userId,
        merchant_id: item.merchant_id,
        custom_name: overrides?.customName ?? item.ai_merchant_name,
        amount: amount,
        currency: item.ai_currency ?? 'AUD',
        frequency: overrides?.frequency ?? item.ai_frequency ?? 'monthly',
        category: overrides?.category ?? (merchant?.category as string) ?? 'OTHER',
        next_billing_date: item.ai_next_billing ?? null,
        detected_plan_id: detectedPlan?.id ?? null,
        plan_confirmed: false,
        updated_at: new Date().toISOString(),
      })
      .select('*, merchants(*)')
      .single();

    if (subError) throw subError;

    // Purge AI fields
    await db
      .from('detected_items')
      .update({
        status: 'CONFIRMED',
        ai_merchant_name: null,
        ai_amount: null,
        ai_currency: null,
        ai_frequency: null,
        ai_detected_date: null,
        ai_next_billing: null,
        ai_confidence: null,
        ai_notes: null,
        ai_fields_purged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return reply.send({ subscription: formatSubscription(subscription) });
  });

  // Dismiss item → purge AI fields
  app.post('/:id/dismiss', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const db = getAdminClient();

    const { data: item } = await db
      .from('detected_items')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'PENDING')
      .single();

    if (!item) {
      return reply.status(404).send({ statusCode: 404, message: 'Item not found or already reviewed' });
    }

    await db
      .from('detected_items')
      .update({
        status: 'DISMISSED',
        ai_merchant_name: null,
        ai_amount: null,
        ai_currency: null,
        ai_frequency: null,
        ai_detected_date: null,
        ai_next_billing: null,
        ai_confidence: null,
        ai_notes: null,
        ai_fields_purged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return reply.send({ status: 'dismissed' });
  });

  // Merge item → update existing subscription + purge AI fields
  app.post('/:id/merge', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const { subscriptionId } = mergeItemSchema.parse(request.body);
    const db = getAdminClient();

    const { data: item } = await db
      .from('detected_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'PENDING')
      .single();

    if (!item) {
      return reply.status(404).send({ statusCode: 404, message: 'Item not found or already reviewed' });
    }

    const { data: targetSub } = await db
      .from('subscriptions')
      .select('id')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (!targetSub) {
      return reply.status(404).send({ statusCode: 404, message: 'Target subscription not found' });
    }

    // Update subscription
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (item.ai_amount != null) updateData.amount = item.ai_amount;
    if (item.ai_frequency != null) updateData.frequency = item.ai_frequency;

    const { data: subscription, error } = await db
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select('*, merchants(*)')
      .single();

    if (error) throw error;

    // Purge AI fields
    await db
      .from('detected_items')
      .update({
        status: 'MERGED',
        ai_merchant_name: null,
        ai_amount: null,
        ai_currency: null,
        ai_frequency: null,
        ai_detected_date: null,
        ai_next_billing: null,
        ai_confidence: null,
        ai_notes: null,
        ai_fields_purged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return reply.send({ subscription: formatSubscription(subscription), status: 'merged' });
  });
}
