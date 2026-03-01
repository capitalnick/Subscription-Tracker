import type { FastifyInstance } from 'fastify';
import { getAdminClient } from '../lib/supabase.js';
import { registerProfileSchema } from '../utils/validation.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register-profile', async (request, reply) => {
    const body = registerProfileSchema.parse(request.body);
    const db = getAdminClient();

    // Check if user already exists
    const { data: existing } = await db
      .from('users')
      .select('*')
      .eq('supabase_id', body.supabaseId)
      .single();

    if (existing) {
      return reply.status(200).send({ user: existing });
    }

    const { data: user, error } = await db
      .from('users')
      .insert({
        id: body.supabaseId,
        supabase_id: body.supabaseId,
        email: body.email,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return reply.status(409).send({ statusCode: 409, message: 'User already exists' });
      }
      throw error;
    }

    return reply.status(201).send({ user });
  });
}
