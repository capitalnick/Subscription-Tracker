import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { registerProfileSchema } from '../utils/validation.js';

export async function authRoutes(app: FastifyInstance) {
  // Create user profile after Supabase signup
  app.post('/register-profile', async (request, reply) => {
    const body = registerProfileSchema.parse(request.body);

    const existing = await prisma.user.findUnique({
      where: { supabaseId: body.supabaseId },
    });

    if (existing) {
      return reply.status(200).send({ user: existing });
    }

    const user = await prisma.user.create({
      data: {
        supabaseId: body.supabaseId,
        email: body.email,
      },
    });

    return reply.status(201).send({ user });
  });
}
