import { z } from 'zod';

// Auth
export const registerProfileSchema = z.object({
  supabaseId: z.string().min(1),
  email: z.string().email(),
});

// Ingestion — manual entry
export const manualEntrySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('AUD'),
  frequency: z.enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annual']),
  category: z.string().min(1).default('Other'),
  nextBillingDate: z.string().datetime().optional(),
});

// Ingestion — email forwarding
export const emailIngestSchema = z.object({
  from: z.string().email(),
  subject: z.string(),
  body: z.string().min(1),
  rawHtml: z.string().optional(),
});

// Queue — confirm overrides
export const confirmItemSchema = z.object({
  customName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annual']).optional(),
  category: z.string().min(1).optional(),
}).optional().default({});

// Queue — merge
export const mergeItemSchema = z.object({
  subscriptionId: z.string().uuid('Invalid subscription ID'),
});

// Subscriptions — update
export const updateSubscriptionSchema = z.object({
  customName: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annual']).optional(),
  category: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  nextBillingDate: z.string().datetime().optional().nullable(),
});

// Pagination
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Merchant search
export const merchantSearchSchema = z.object({
  q: z.string().min(2, 'Query must be at least 2 characters'),
});

// Allowed upload MIME types
export const ALLOWED_PDF_TYPES = ['application/pdf'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
