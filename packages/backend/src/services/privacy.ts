import { getAdminClient } from '../lib/supabase.js';

/**
 * Atomically purge all AI-extracted fields from a detected item
 * after user review (confirm/dismiss/merge).
 */
export async function purgeAiFields(
  itemId: string,
  newStatus: 'CONFIRMED' | 'DISMISSED' | 'MERGED',
) {
  const db = getAdminClient();

  await db
    .from('detected_items')
    .update({
      status: newStatus,
      ai_merchant_name: null,
      ai_amount: null,
      ai_currency: null,
      ai_frequency: null,
      ai_detected_date: null,
      ai_next_billing: null,
      ai_confidence: null,
      ai_notes: null,
      ai_fields_purged_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId);
}
