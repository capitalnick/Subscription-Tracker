import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { prisma } from '../lib/prisma.js';
import { confirmItemSchema, mergeItemSchema, paginationSchema } from '../utils/validation.js';
import { purgeAiFields } from '../services/privacy.js';

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
  const merchant = sub.merchant as Record<string, unknown> | null;
  const knownPlans = (merchant?.knownPlans as unknown[]) ?? [];
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
      knownPlans,
    } : null,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
  };
}

function formatItem(item: Record<string, unknown>) {
  const merchant = item.merchant as Record<string, unknown> | null;
  const knownPlans = (merchant?.knownPlans as unknown[]) ?? [];
  return {
    id: item.id,
    userId: item.userId,
    ingestionMethod: item.ingestionMethod,
    status: item.status,
    aiMerchantName: item.aiMerchantName,
    aiAmount: item.aiAmount != null ? Number(item.aiAmount) : null,
    aiCurrency: item.aiCurrency,
    aiFrequency: item.aiFrequency,
    aiDetectedDate: item.aiDetectedDate,
    aiNextBilling: item.aiNextBilling,
    aiConfidence: item.aiConfidence,
    aiNotes: item.aiNotes,
    aiFieldsPurgedAt: item.aiFieldsPurgedAt,
    merchantId: item.merchantId,
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
      knownPlans,
    } : null,
    duplicate: item.duplicate,
    duplicateOf: item.duplicateOf ?? null,
    duplicateConfidence: item.duplicateConfidence ?? null,
    sourceHash: item.sourceHash,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function queueRoutes(app: FastifyInstance) {
  // Get review queue with pagination
  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { limit, offset } = paginationSchema.parse(request.query);

    const [items, total, pending] = await Promise.all([
      prisma.detectedItem.findMany({
        where: { userId },
        include: { merchant: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.detectedItem.count({ where: { userId } }),
      prisma.detectedItem.count({ where: { userId, status: 'PENDING' } }),
    ]);

    return reply.send({
      items: items.map((i) => formatItem(i as unknown as Record<string, unknown>)),
      total,
      pending,
      limit,
      offset,
    });
  });

  // Confirm item -> create subscription + purge AI fields + detect plan
  app.post('/:id/confirm', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const overrides = confirmItemSchema.parse(request.body);

    const item = await prisma.detectedItem.findFirst({
      where: { id, userId, status: 'PENDING' },
      include: { merchant: true },
    });

    if (!item) {
      return reply.status(404).send({ statusCode: 404, message: 'Item not found or already reviewed' });
    }

    // Detect plan if merchant has known_plans
    const knownPlans = (item.merchant?.knownPlans as unknown as MerchantPlan[]) ?? [];
    const amount = overrides?.amount ?? (item.aiAmount != null ? Number(item.aiAmount) : 0);
    const detectedPlan = knownPlans.length > 0 ? detectPlan(knownPlans, amount) : null;

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        merchantId: item.merchantId,
        customName: overrides?.customName ?? item.aiMerchantName,
        amount,
        currency: item.aiCurrency ?? 'AUD',
        frequency: overrides?.frequency ?? item.aiFrequency ?? 'monthly',
        category: overrides?.category ?? item.merchant?.category ?? 'OTHER',
        nextBillingDate: item.aiNextBilling ? new Date(item.aiNextBilling) : null,
        detectedPlanId: detectedPlan?.id ?? null,
        planConfirmed: false,
      },
      include: { merchant: true },
    });

    // Store confirmed fields and purge AI fields
    await purgeAiFields(id, 'CONFIRMED', {
      confirmedMerchantName: overrides?.customName ?? item.aiMerchantName ?? undefined,
      confirmedAmount: amount,
      confirmedCurrency: item.aiCurrency ?? 'AUD',
      confirmedFrequency: overrides?.frequency ?? item.aiFrequency ?? undefined,
      subscriptionId: subscription.id,
    });

    return reply.send({ subscription: formatSubscription(subscription as unknown as Record<string, unknown>) });
  });

  // Dismiss item -> purge AI fields
  app.post('/:id/dismiss', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };

    const item = await prisma.detectedItem.findFirst({
      where: { id, userId, status: 'PENDING' },
      select: { id: true },
    });

    if (!item) {
      return reply.status(404).send({ statusCode: 404, message: 'Item not found or already reviewed' });
    }

    await purgeAiFields(id, 'DISMISSED');

    return reply.send({ status: 'dismissed' });
  });

  // Merge item -> update existing subscription + purge AI fields
  app.post('/:id/merge', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const { subscriptionId } = mergeItemSchema.parse(request.body);

    const item = await prisma.detectedItem.findFirst({
      where: { id, userId, status: 'PENDING' },
    });

    if (!item) {
      return reply.status(404).send({ statusCode: 404, message: 'Item not found or already reviewed' });
    }

    const targetSub = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
      select: { id: true },
    });

    if (!targetSub) {
      return reply.status(404).send({ statusCode: 404, message: 'Target subscription not found' });
    }

    // Update subscription
    const updateData: Record<string, unknown> = {};
    if (item.aiAmount != null) updateData.amount = Number(item.aiAmount);
    if (item.aiFrequency != null) updateData.frequency = item.aiFrequency;

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: { merchant: true },
    });

    // Purge AI fields
    await purgeAiFields(id, 'MERGED', {
      subscriptionId,
    });

    return reply.send({
      subscription: formatSubscription(subscription as unknown as Record<string, unknown>),
      status: 'merged',
    });
  });
}
