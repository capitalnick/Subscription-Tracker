import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { prisma } from '../lib/prisma.js';
import { updateSubscriptionSchema, paginationSchema } from '../utils/validation.js';
import type { SubscriptionStatus } from '@prisma/client';

function formatSub(sub: Record<string, unknown>) {
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
    billingAnchor: sub.billingAnchor ?? null,
    lastChargedDate: sub.lastChargedDate ?? null,
    lastChargedAmount: sub.lastChargedAmount != null ? Number(sub.lastChargedAmount) : null,
    trialEndDate: sub.trialEndDate ?? null,
    cancelledAt: sub.cancelledAt ?? null,
    notes: sub.notes ?? null,
    isShared: sub.isShared ?? false,
    sharedMyPortion: sub.sharedMyPortion != null ? Number(sub.sharedMyPortion) : null,
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

export async function subscriptionRoutes(app: FastifyInstance) {
  // List all subscriptions with pagination
  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { limit, offset } = paginationSchema.parse(request.query);

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: { userId },
        include: { merchant: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.subscription.count({ where: { userId } }),
    ]);

    return reply.send({
      subscriptions: subscriptions.map((s) => formatSub(s as unknown as Record<string, unknown>)),
      total,
      limit,
      offset,
    });
  });

  // Get single subscription
  app.get('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
      include: { merchant: true },
    });

    if (!subscription) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    return reply.send({ subscription: formatSub(subscription as unknown as Record<string, unknown>) });
  });

  // Update subscription
  app.patch('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const updates = updateSubscriptionSchema.parse(request.body);

    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    const updateData: Record<string, unknown> = {};
    if (updates.customName !== undefined) updateData.customName = updates.customName;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.nextBillingDate !== undefined) {
      updateData.nextBillingDate = updates.nextBillingDate ? new Date(updates.nextBillingDate) : null;
    }
    if (updates.detectedPlanId !== undefined) updateData.detectedPlanId = updates.detectedPlanId;
    if (updates.planConfirmed !== undefined) updateData.planConfirmed = updates.planConfirmed;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    // Handle status field (replaces isActive)
    if (updates.status !== undefined) {
      updateData.status = updates.status as SubscriptionStatus;
      if (updates.status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }
    } else if (updates.isActive !== undefined) {
      // Backward compat: map isActive to status
      updateData.status = updates.isActive ? 'ACTIVE' : 'CANCELLED';
      if (!updates.isActive) {
        updateData.cancelledAt = new Date();
      }
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: { merchant: true },
    });

    return reply.send({ subscription: formatSub(subscription as unknown as Record<string, unknown>) });
  });

  // Delete subscription
  app.delete('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };

    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    await prisma.subscription.delete({ where: { id } });

    return reply.send({ status: 'deleted' });
  });
}
