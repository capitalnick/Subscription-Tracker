-- Stale Queue Cleanup — pg_cron job
-- Requires pg_cron extension enabled on Supabase Pro plan
-- Run this via Supabase SQL Editor after enabling pg_cron

-- Enable pg_cron extension (must be done by superuser / via Supabase dashboard)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Daily 3am AEST cleanup: purge AI fields on PENDING items older than 30 days
SELECT cron.schedule(
  'purge-stale-queue-items',
  '0 17 * * *', -- 3am AEST = 5pm UTC (during AEST) or 17:00 UTC
  $$
  UPDATE detected_items
  SET
    ai_merchant_name = NULL,
    ai_amount = NULL,
    ai_currency = NULL,
    ai_frequency = NULL,
    ai_detected_date = NULL,
    ai_next_billing = NULL,
    ai_confidence = NULL,
    ai_notes = NULL,
    ai_fields_purged_at = NOW(),
    reviewed_at = NOW(),
    status = 'DISMISSED'
  WHERE
    status = 'PENDING'
    AND ai_fields_purged_at IS NULL
    AND created_at < NOW() - INTERVAL '30 days'
  $$
);
