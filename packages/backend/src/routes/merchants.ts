import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { merchantSearchSchema } from '../utils/validation.js';

export async function merchantRoutes(app: FastifyInstance) {
  // Typeahead search for merchants
  app.get('/search', async (request, reply) => {
    const result = merchantSearchSchema.safeParse(request.query);

    if (!result.success) {
      return reply.send({ merchants: [] });
    }

    const { q } = result.data;

    const merchants = await prisma.merchant.findMany({
      where: {
        OR: [
          { canonicalName: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q.toLowerCase() } },
          { commonDescriptors: { has: q.toUpperCase() } },
        ],
      },
      take: 10,
      orderBy: { canonicalName: 'asc' },
    });

    return reply.send({ merchants });
  });
}
