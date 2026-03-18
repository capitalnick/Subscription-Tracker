import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { getAdminClient } from '../lib/supabase.js';
import { registerProfileSchema } from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types.js';

function generateForwardingAddress(): string {
  return crypto.randomBytes(6).toString('base64url').slice(0, 8);
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register-profile', async (request, reply) => {
    const body = registerProfileSchema.parse(request.body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { supabaseId: body.supabaseId },
    });

    if (existing) {
      return reply.status(200).send({ user: existing });
    }

    try {
      const user = await prisma.user.create({
        data: {
          id: body.supabaseId,
          supabaseId: body.supabaseId,
          email: body.email,
          forwardingAddress: generateForwardingAddress(),
        },
      });

      return reply.status(201).send({ user });
    } catch (err: unknown) {
      const prismaError = err as { code?: string };
      if (prismaError.code === 'P2002') {
        return reply.status(409).send({ statusCode: 409, message: 'User already exists' });
      }
      throw err;
    }
  });

  // DELETE /v1/auth/account — delete user and all data
  app.delete('/account', { preHandler: [authMiddleware] }, async (request, reply) => {
    const { userId } = request as AuthenticatedRequest;

    // Find the user to get supabaseId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return reply.status(404).send({ statusCode: 404, message: 'User not found' });
    }

    // Delete from Supabase Auth
    const supabase = getAdminClient();
    await supabase.auth.admin.deleteUser(user.supabaseId);

    // Prisma cascade deletes handle all related data
    await prisma.user.delete({ where: { id: userId } });

    return reply.send({ deleted: true });
  });
}
