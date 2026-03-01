import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { config } from './config.js';
import { authRoutes } from './routes/auth.js';
import { ingestRoutes } from './routes/ingest.js';
import { queueRoutes } from './routes/queue.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { subscriptionRoutes } from './routes/subscriptions.js';
import { merchantRoutes } from './routes/merchants.js';

const app = Fastify({
  logger: true,
});

// Plugins
await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(rateLimit, {
  max: config.rateLimit.max,
  timeWindow: config.rateLimit.timeWindow,
});

await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Allow empty JSON bodies (mobile app sends POST with no body for confirm/dismiss)
app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  try {
    const str = (body as string).trim();
    done(null, str ? JSON.parse(str) : {});
  } catch (err) {
    done(err as Error, undefined);
  }
});

// Global error handler
app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      message: 'Validation failed',
      errors: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      statusCode: 429,
      message: 'Too many requests. Please slow down.',
    });
  }

  // Default: log and return 500
  request.log.error(error);
  return reply.status(error.statusCode ?? 500).send({
    statusCode: error.statusCode ?? 500,
    message: error.statusCode ? error.message : 'Internal server error',
  });
});

// Health check
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// Routes
await app.register(authRoutes, { prefix: '/v1/auth' });
await app.register(ingestRoutes, { prefix: '/v1/ingest' });
await app.register(queueRoutes, { prefix: '/v1/queue' });
await app.register(dashboardRoutes, { prefix: '/v1/dashboard' });
await app.register(subscriptionRoutes, { prefix: '/v1/subscriptions' });
await app.register(merchantRoutes, { prefix: '/v1/merchants' });

// Graceful shutdown
const shutdown = async () => {
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start
try {
  await app.listen({ port: config.port, host: config.host });
  console.log(`Server running on http://${config.host}:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
