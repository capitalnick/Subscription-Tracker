import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { prisma } from '../lib/prisma.js';
import { updateSubscriptionSchema, paginationSchema } from '../utils/validation.js';

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
        take: limit,
        skip: offset,
      }),
      prisma.subscription.count({ where: { userId } }),
    ]);

    return reply.send({ subscriptions, total, limit, offset });
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

    return reply.send({ subscription });
  });

  // Update subscription
  app.patch('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };
    const updates = updateSubscriptionSchema.parse(request.body);

    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        customName: updates.customName,
        amount: updates.amount,
        frequency: updates.frequency,
        category: updates.category,
        isActive: updates.isActive,
        nextBillingDate: updates.nextBillingDate ? new Date(updates.nextBillingDate) : updates.nextBillingDate === null ? null : undefined,
      },
      include: { merchant: true },
    });

    return reply.send({ subscription });
  });

  // Delete subscription
  app.delete('/:id', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const { id } = request.params as { id: string };

    const existing = await prisma.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ statusCode: 404, message: 'Subscription not found' });
    }

    await prisma.subscription.delete({ where: { id } });

    return reply.send({ status: 'deleted' });
  });
}
