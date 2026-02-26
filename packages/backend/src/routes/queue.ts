import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { prisma } from '../lib/prisma.js';
import { confirmItemSchema, mergeItemSchema, paginationSchema } from '../utils/validation.js';

export async function queueRoutes(app: FastifyInstance) {
  // Get review queue with pagination
  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { limit, offset } = paginationSchema.parse(request.query);

    const [items, total] = await Promise.all([
      prisma.detectedItem.findMany({
        where: { userId },
        include: { merchant: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.detectedItem.count({ where: { userId } }),
    ]);

    const pending = await prisma.detectedItem.count({
      where: { userId, status: 'PENDING' },
    });

    return reply.send({ items, total, pending, limit, offset });
  });

  // Confirm item → create subscription + purge AI fields atomically
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

    // Atomic: create subscription + update detected item status + purge AI fields
    const [subscription] = await prisma.$transaction([
      prisma.subscription.create({
        data: {
          userId,
          merchantId: item.merchantId,
          customName: overrides?.customName ?? item.aiMerchantName,
          amount: overrides?.amount ?? item.aiAmount ?? 0,
          currency: item.aiCurrency ?? 'AUD',
          frequency: overrides?.frequency ?? item.aiFrequency ?? 'monthly',
          category: overrides?.category ?? item.merchant?.category ?? 'Other',
          nextBillingDate: item.aiNextBilling ? new Date(item.aiNextBilling) : null,
        },
        include: { merchant: true },
      }),
      prisma.detectedItem.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
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
      }),
    ]);

    return reply.send({ subscription });
  });

  // Dismiss item → purge AI fields
  app.post('/:id/dismiss', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };

    const item = await prisma.detectedItem.findFirst({
      where: { id, userId, status: 'PENDING' },
    });

    if (!item) {
      return reply.status(404).send({ statusCode: 404, message: 'Item not found or already reviewed' });
    }

    await prisma.detectedItem.update({
      where: { id },
      data: {
        status: 'DISMISSED',
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

    return reply.send({ status: 'dismissed' });
  });

  // Merge item → update existing subscription + purge AI fields atomically
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

    // Verify the target subscription belongs to the user
    const targetSub = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!targetSub) {
      return reply.status(404).send({ statusCode: 404, message: 'Target subscription not found' });
    }

    // Atomic: update subscription + purge detected item
    const [subscription] = await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          amount: item.aiAmount ?? undefined,
          frequency: item.aiFrequency ?? undefined,
        },
        include: { merchant: true },
      }),
      prisma.detectedItem.update({
        where: { id },
        data: {
          status: 'MERGED',
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
      }),
    ]);

    return reply.send({ subscription, status: 'merged' });
  });
}
