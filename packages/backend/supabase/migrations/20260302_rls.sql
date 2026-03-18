-- Row Level Security Policies
-- Apply via Supabase SQL Editor or supabase db push

-- ── Enable RLS on all tables ───────────────────────────────────────────────────

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "detected_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ingestion_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_charges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "merchants" ENABLE ROW LEVEL SECURITY;

-- ── Users: own data only ───────────────────────────────────────────────────────

CREATE POLICY "users_own_data" ON "users"
  FOR ALL USING (auth.uid()::text = supabase_id);

-- ── Subscriptions: own data only ───────────────────────────────────────────────

CREATE POLICY "subscriptions_own_data" ON "subscriptions"
  FOR ALL USING (
    user_id IN (SELECT id FROM "users" WHERE supabase_id = auth.uid()::text)
  );

-- ── Detected Items: own data only ──────────────────────────────────────────────

CREATE POLICY "detected_items_own_data" ON "detected_items"
  FOR ALL USING (
    user_id IN (SELECT id FROM "users" WHERE supabase_id = auth.uid()::text)
  );

-- ── Ingestion Events: own data only ────────────────────────────────────────────

CREATE POLICY "ingestion_events_own_data" ON "ingestion_events"
  FOR ALL USING (
    user_id IN (SELECT id FROM "users" WHERE supabase_id = auth.uid()::text)
  );

-- ── Subscription Charges: own data only ────────────────────────────────────────

CREATE POLICY "subscription_charges_own_data" ON "subscription_charges"
  FOR ALL USING (
    user_id IN (SELECT id FROM "users" WHERE supabase_id = auth.uid()::text)
  );

-- ── Merchants: read-only for authenticated users ──────────────────────────────

CREATE POLICY "merchants_read_authenticated" ON "merchants"
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access to merchants (for write-back)
CREATE POLICY "merchants_service_role" ON "merchants"
  FOR ALL USING (auth.role() = 'service_role');
