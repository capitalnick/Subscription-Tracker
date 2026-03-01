import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

const sql = `
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS known_plans JSONB;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS detected_plan_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_confirmed BOOLEAN DEFAULT false;
`;

async function run() {
  // Use DIRECT connection (db.{ref}.supabase.co) instead of pooler
  const client = new Client({
    host: 'db.rlkhobxsmbxposxukuju.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'JB@bgsBh$Mt9PFQ',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database.\n');

  // Run ALTER TABLE statements
  console.log('Adding new columns...');
  await client.query(sql);
  console.log('  ✓ Columns added\n');

  // Migrate merchant categories
  console.log('Migrating merchant categories...');
  const categoryMapping = [
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
    const res = await client.query(
      `UPDATE merchants SET category = $1 WHERE category = $2`,
      [newCat, oldCat]
    );
    if (res.rowCount > 0) {
      console.log(`  Merchants: ${oldCat} → ${newCat} (${res.rowCount} rows)`);
    }
  }

  // Migrate subscription categories
  console.log('\nMigrating subscription categories...');
  for (const [oldCat, newCat] of categoryMapping) {
    const res = await client.query(
      `UPDATE subscriptions SET category = $1, updated_at = NOW() WHERE category = $2`,
      [newCat, oldCat]
    );
    if (res.rowCount > 0) {
      console.log(`  Subscriptions: ${oldCat} → ${newCat} (${res.rowCount} rows)`);
    }
  }

  // Verify
  console.log('\nVerification:');
  const mRes = await client.query(`SELECT category, COUNT(*) as cnt FROM merchants GROUP BY category ORDER BY category`);
  console.log('  Merchant categories:', mRes.rows.map(r => `${r.category}: ${r.cnt}`).join(', '));

  const sRes = await client.query(`SELECT category, COUNT(*) as cnt FROM subscriptions GROUP BY category ORDER BY category`);
  if (sRes.rows.length > 0) {
    console.log('  Subscription categories:', sRes.rows.map(r => `${r.category}: ${r.cnt}`).join(', '));
  } else {
    console.log('  No subscriptions yet');
  }

  await client.end();
  console.log('\n✓ Migration complete!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
