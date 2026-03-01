import type { FastifyInstance } from 'fastify';
import { getAdminClient } from '../lib/supabase.js';
import { merchantSearchSchema } from '../utils/validation.js';

export async function merchantRoutes(app: FastifyInstance) {
  app.get('/search', async (request, reply) => {
    const result = merchantSearchSchema.safeParse(request.query);

    if (!result.success) {
      return reply.send({ merchants: [] });
    }

    const { q } = result.data;
    const db = getAdminClient();

    // Search by canonical name or slug (PostgREST ilike)
    const { data: merchants } = await db
      .from('merchants')
      .select('*')
      .or(`canonical_name.ilike.%${q}%,slug.ilike.%${q.toLowerCase()}%`)
      .order('canonical_name', { ascending: true })
      .limit(10);

    return reply.send({ merchants: merchants ?? [] });
  });
}
