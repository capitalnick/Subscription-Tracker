import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import type { AuthenticatedRequest } from '../types.js';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    if (!config.supabase.url) {
      throw new Error('SUPABASE_URL is not configured');
    }
    supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
  }
  return supabase;
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ statusCode: 401, message: 'Missing authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await getSupabase().auth.getUser(token);

    if (error || !data.user) {
      return reply.status(401).send({ statusCode: 401, message: 'Invalid or expired token' });
    }

    const req = request as AuthenticatedRequest;
    req.userId = data.user.id;
    req.userEmail = data.user.email ?? '';
  } catch {
    return reply.status(401).send({ statusCode: 401, message: 'Authentication failed' });
  }
}
