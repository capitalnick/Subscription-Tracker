import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { getAdminClient } from '../lib/supabase.js';
import { updateSubscriptionSchema, paginationSchema } from '../utils/validation.js';

function formatSub(sub: Record<string, unknown>) {
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

export async function subscriptionRoutes(app: FastifyInstance) {
  // List all subscriptions with pagination
  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { limit, offset } = paginationSchema.parse(request.query);
    const db = getAdminClient();

    const { data: subscriptions, count: total } = await db
      .from('subscriptions')
      .select('*, merchants(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return reply.send({
      subscriptions: (subscriptions ?? []).map(formatSub),
      total: total ?? 0,
      limit,
      offset,
    });
  });

  // Get single subscription
  app.get('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const db = getAdminClient();

    const { data: subscription } = await db
      .from('subscriptions')
      .select('*, merchants(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!subscription) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    return reply.send({ subscription: formatSub(subscription) });
  });

  // Update subscription
  app.patch('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const updates = updateSubscriptionSchema.parse(request.body);
    const db = getAdminClient();

    const { data: existing } = await db
      .from('subscriptions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.customName !== undefined) updateData.custom_name = updates.customName;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.nextBillingDate !== undefined) updateData.next_billing_date = updates.nextBillingDate;
    if (updates.detectedPlanId !== undefined) updateData.detected_plan_id = updates.detectedPlanId;
    if (updates.planConfirmed !== undefined) updateData.plan_confirmed = updates.planConfirmed;

    const { data: subscription, error } = await db
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select('*, merchants(*)')
      .single();

    if (error) throw error;

    return reply.send({ subscription: formatSub(subscription) });
  });

  // Delete subscription
  app.delete('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const db = getAdminClient();

    const { data: existing } = await db
      .from('subscriptions')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    await db.from('subscriptions').delete().eq('id', id);

    return reply.send({ status: 'deleted' });
  });
}
