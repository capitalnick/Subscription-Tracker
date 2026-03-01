import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

async function fix() {
  const { data: g } = await db.from('merchants').update({ category: 'GAMING' }).eq('category', 'Gaming').select('id');
  console.log('Gaming → GAMING:', g?.length ?? 0, 'merchants');

  const { data: o } = await db.from('subscriptions').update({ category: 'OTHER', updated_at: new Date().toISOString() }).eq('category', 'Other').select('id');
  console.log('Other → OTHER:', o?.length ?? 0, 'subscriptions');
}

fix().catch(console.error);
