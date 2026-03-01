import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const db = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function runMigration() {
  console.log('Running Spec 06 migration...\n');

  // 1. Check if new columns exist
  console.log('Step 1: Checking for new columns...');
  const { error: colCheck } = await db
    .from('merchants')
    .select('logo_url, known_plans')
    .limit(1);

  if (colCheck) {
    console.error('\n❌ New columns not found. Please run this SQL in Supabase SQL Editor first:\n');
    console.error(`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS known_plans JSONB;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS detected_plan_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_confirmed BOOLEAN DEFAULT false;`);
    console.error('\nThen re-run this script.');
    process.exit(1);
  }
  console.log('  ✓ Merchant columns (logo_url, known_plans) exist');

  const { error: subCheck } = await db
    .from('subscriptions')
    .select('detected_plan_id, plan_confirmed')
    .limit(1);

  if (subCheck) {
    console.error('\n❌ Subscription columns not found. Please run this SQL in Supabase SQL Editor:\n');
    console.error(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS detected_plan_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_confirmed BOOLEAN DEFAULT false;`);
    process.exit(1);
  }
  console.log('  ✓ Subscription columns (detected_plan_id, plan_confirmed) exist\n');

  // 2. Migrate merchant categories
  console.log('Step 2: Migrating merchant categories...');
  const categoryMapping: [string, string][] = [
    ['Entertainment', 'STREAMING_VIDEO'],
    ['Music', 'STREAMING_MUSIC'],
    ['Productivity', 'PRODUCTIVITY'],
    ['Cloud', 'CLOUD_STORAGE'],
    ['Finance', 'FINANCE_INVEST'],
    ['Health', 'FITNESS'],
    ['News', 'NEWS_MAGAZINES'],
    ['Education', 'EDUCATION'],
    ['Shopping', 'PRIME_MEMBERSHIPS'],
    ['Utilities', 'UTILITIES_HOME'],
    ['Software', 'SOFTWARE_TOOLS'],
  ];

  for (const [oldCat, newCat] of categoryMapping) {
    const { data } = await db
      .from('merchants')
      .update({ category: newCat })
      .eq('category', oldCat)
      .select('id');

    if (data && data.length > 0) {
      console.log(`  Merchants: ${oldCat} → ${newCat} (${data.length} rows)`);
    }
  }

  // 3. Migrate subscription categories
  console.log('\nStep 3: Migrating subscription categories...');
  for (const [oldCat, newCat] of categoryMapping) {
    const { data } = await db
      .from('subscriptions')
      .update({ category: newCat, updated_at: new Date().toISOString() })
      .eq('category', oldCat)
      .select('id');

    if (data && data.length > 0) {
      console.log(`  Subscriptions: ${oldCat} → ${newCat} (${data.length} rows)`);
    }
  }

  // 4. Verify
  console.log('\nStep 4: Verification...');

  const { data: allMerchants } = await db.from('merchants').select('category');
  const merchantCounts: Record<string, number> = {};
  for (const m of allMerchants ?? []) {
    merchantCounts[m.category] = (merchantCounts[m.category] ?? 0) + 1;
  }
  console.log('  Merchant categories:', JSON.stringify(merchantCounts, null, 2));

  const { data: allSubs } = await db.from('subscriptions').select('category');
  const subCounts: Record<string, number> = {};
  for (const s of allSubs ?? []) {
    subCounts[s.category] = (subCounts[s.category] ?? 0) + 1;
  }
  console.log('  Subscription categories:', JSON.stringify(subCounts, null, 2));

  console.log('\n✓ Migration complete!');
}

runMigration().catch((e) => {
  console.error(e);
  process.exit(1);
});
