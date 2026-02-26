import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  host: process.env.HOST ?? '0.0.0.0',

  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET ?? '',
  },

  database: {
    url: process.env.DATABASE_URL ?? '',
  },

  vertexAi: {
    projectId: process.env.GCP_PROJECT_ID ?? '',
    location: process.env.GCP_LOCATION ?? 'australia-southeast1',
    model: 'gemini-1.5-flash',
  },

  rateLimit: {
    max: 100,
    timeWindow: '1 minute',
  },
} as const;
