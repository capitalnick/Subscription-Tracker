-- Spec 06: Merchant Display & Categorisation Migration
-- Run this in Supabase SQL Editor

-- 1. Add new columns to merchants table
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS known_plans JSONB;

-- 2. Add new columns to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS detected_plan_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_confirmed BOOLEAN DEFAULT false;

-- 3. Migrate old category values to new enum values
-- Merchants
UPDATE merchants SET category = 'STREAMING_VIDEO' WHERE category = 'Entertainment';
UPDATE merchants SET category = 'STREAMING_MUSIC' WHERE category = 'Music';
UPDATE merchants SET category = 'PRODUCTIVITY' WHERE category = 'Productivity';
UPDATE merchants SET category = 'CLOUD_STORAGE' WHERE category = 'Cloud';
UPDATE merchants SET category = 'FINANCE_INVEST' WHERE category = 'Finance';
UPDATE merchants SET category = 'FITNESS' WHERE category = 'Health';
UPDATE merchants SET category = 'NEWS_MAGAZINES' WHERE category = 'News';
UPDATE merchants SET category = 'EDUCATION' WHERE category = 'Education';
UPDATE merchants SET category = 'PRIME_MEMBERSHIPS' WHERE category = 'Shopping';
UPDATE merchants SET category = 'UTILITIES_HOME' WHERE category = 'Utilities';
UPDATE merchants SET category = 'SOFTWARE_TOOLS' WHERE category = 'Software';
-- Gaming stays as GAMING (already matches)

-- Subscriptions
UPDATE subscriptions SET category = 'STREAMING_VIDEO' WHERE category = 'Entertainment';
UPDATE subscriptions SET category = 'STREAMING_MUSIC' WHERE category = 'Music';
UPDATE subscriptions SET category = 'PRODUCTIVITY' WHERE category = 'Productivity';
UPDATE subscriptions SET category = 'CLOUD_STORAGE' WHERE category = 'Cloud';
UPDATE subscriptions SET category = 'FINANCE_INVEST' WHERE category = 'Finance';
UPDATE subscriptions SET category = 'FITNESS' WHERE category = 'Health';
UPDATE subscriptions SET category = 'NEWS_MAGAZINES' WHERE category = 'News';
UPDATE subscriptions SET category = 'EDUCATION' WHERE category = 'Education';
UPDATE subscriptions SET category = 'PRIME_MEMBERSHIPS' WHERE category = 'Shopping';
UPDATE subscriptions SET category = 'UTILITIES_HOME' WHERE category = 'Utilities';
UPDATE subscriptions SET category = 'SOFTWARE_TOOLS' WHERE category = 'Software';

-- Verify
SELECT category, COUNT(*) FROM merchants GROUP BY category ORDER BY category;
SELECT category, COUNT(*) FROM subscriptions GROUP BY category ORDER BY category;
