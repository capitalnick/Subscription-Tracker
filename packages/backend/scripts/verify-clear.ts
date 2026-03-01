import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function verify() {
  const { count: di } = await db.from('detected_items').select('*', { count: 'exact', head: true });
  const { count: s } = await db.from('subscriptions').select('*', { count: 'exact', head: true });
  const { count: m } = await db.from('merchants').select('*', { count: 'exact', head: true });
  console.log(`detected_items: ${di} | subscriptions: ${s} | merchants: ${m}`);
}
verify().catch(console.error);
