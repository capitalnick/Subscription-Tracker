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
    model: 'gemini-2.0-flash',
  },

  logoDev: {
    token: process.env.LOGO_DEV_TOKEN ?? '',
  },

  sendgrid: {
    webhookVerificationKey: process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY ?? '',
  },

  appEnv: (process.env.APP_ENV ?? 'development') as 'development' | 'staging' | 'production',

  rateLimit: {
    max: 200,
    timeWindow: '1 minute',
  },
} as const;

// Validate required environment variables
const requiredVars = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}
