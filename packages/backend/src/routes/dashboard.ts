import type { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';
import { getDashboardData } from '../services/dashboard.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;
    const data = await getDashboardData(userId);
    return reply.send(data);
  });
}
