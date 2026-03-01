import { getAdminClient } from '../lib/supabase.js';
import { resolveUnknownMerchant } from './vertexAi.js';
import { fetchAndStoreLogo } from './logo.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MerchantRecord {
  id: string;
  canonical_name: string;
  slug: string;
  category: string;
  common_descriptors: string[];
  website_url: string | null;
  logo_url: string | null;
  logo_letter: string;
  logo_color: string;
  known_plans: unknown;
  created_at: string;
}

export interface ResolvedMerchant {
  merchant: MerchantRecord;
  canonicalName: string;
  isNew: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Trim, uppercase, collapse whitespace */
function cleanDescriptor(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, ' ');
}

/** URL-safe slug from a name */
function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** First letter (uppercase) for fallback logo */
function logoLetterFrom(name: string): string {
  return (name.trim()[0] ?? '?').toUpperCase();
}

/** Deterministic colour from a string (8-colour palette) */
const LOGO_PALETTE = [
  '#6366F1', '#EC4899', '#F59E0B', '#10B981',
  '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6',
];
function logoColorFrom(name: string): string {
  let hash = 0;
  for (const ch of name) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return LOGO_PALETTE[Math.abs(hash) % LOGO_PALETTE.length];
}

// ---------------------------------------------------------------------------
// Stage 1 — Local lookup (free, fast)
// ---------------------------------------------------------------------------

async function lookupMerchant(merchantName: string): Promise<MerchantRecord | null> {
  if (!merchantName) return null;

  const db = getAdminClient();
  const normalized = merchantName.trim().toLowerCase();
  const slug = slugify(merchantName);

  // 1. Exact match on slug
  const { data: slugMatch } = await db
    .from('merchants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (slugMatch) return slugMatch;

  // 2. Case-insensitive match on canonical name
  const { data: nameMatch } = await db
    .from('merchants')
    .select('*')
    .ilike('canonical_name', merchantName.trim())
    .limit(1)
    .single();

  if (nameMatch) return nameMatch;

  // 3. Descriptor match — check common_descriptors array
  const cleaned = cleanDescriptor(merchantName);
  const { data: descriptorMatch } = await db
    .from('merchants')
    .select('*')
    .contains('common_descriptors', [cleaned])
    .limit(1)
    .single();

  if (descriptorMatch) return descriptorMatch;

  // 4. Partial / fuzzy match
  const firstWord = merchantName.trim().split(' ')[0];
  const { data: candidates } = await db
    .from('merchants')
    .select('*')
    .ilike('canonical_name', `%${firstWord}%`)
    .limit(50);

  for (const m of candidates ?? []) {
    for (const desc of m.common_descriptors ?? []) {
      if (normalized.includes(desc.toLowerCase()) || desc.toLowerCase().includes(normalized)) {
        return m;
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Stage 2+3 — Full resolution pipeline (AI fallback + write-back)
// ---------------------------------------------------------------------------

export async function resolveMerchant(rawDescriptor: string): Promise<ResolvedMerchant | null> {
  if (!rawDescriptor?.trim()) return null;

  // Stage 1: local lookup
  const local = await lookupMerchant(rawDescriptor);
  if (local) {
    // Write-back: teach the system this descriptor
    await writeBackDescriptor(local, rawDescriptor);
    // Fire-and-forget: fetch logo if missing
    if (local.website_url && !local.logo_url) {
      fetchAndStoreLogo(local.id, local.website_url).catch(console.error);
    }
    return { merchant: local, canonicalName: local.canonical_name, isNew: false };
  }

  // Stage 2: AI resolution
  const ai = await resolveUnknownMerchant(rawDescriptor);

  // Re-check by slug to prevent duplicate merchants
  const aiSlug = slugify(ai.merchantName);
  const db = getAdminClient();
  const { data: existing } = await db
    .from('merchants')
    .select('*')
    .eq('slug', aiSlug)
    .single();

  if (existing) {
    await writeBackDescriptor(existing, rawDescriptor);
    // Fire-and-forget: fetch logo if missing
    if (existing.website_url && !existing.logo_url) {
      fetchAndStoreLogo(existing.id, existing.website_url).catch(console.error);
    }
    return { merchant: existing, canonicalName: existing.canonical_name, isNew: false };
  }

  // Insert new merchant
  const { data: newMerchant, error } = await db
    .from('merchants')
    .insert({
      canonical_name: ai.merchantName,
      slug: aiSlug,
      category: ai.category,
      common_descriptors: [cleanDescriptor(rawDescriptor)],
      website_url: ai.websiteUrl,
      logo_letter: logoLetterFrom(ai.merchantName),
      logo_color: logoColorFrom(ai.merchantName),
    })
    .select('*')
    .single();

  if (error || !newMerchant) {
    console.error('Failed to insert new merchant:', error);
    return null;
  }

  // Fire-and-forget: fetch logo for new merchant
  if (ai.websiteUrl) {
    fetchAndStoreLogo(newMerchant.id, ai.websiteUrl).catch(console.error);
  }

  return { merchant: newMerchant, canonicalName: ai.merchantName, isNew: true };
}

// ---------------------------------------------------------------------------
// Write-back — teach the system new descriptors
// ---------------------------------------------------------------------------

async function writeBackDescriptor(merchant: MerchantRecord, rawDescriptor: string) {
  const cleaned = cleanDescriptor(rawDescriptor);
  const existing = (merchant.common_descriptors ?? []).map((d: string) => d.toUpperCase());
  if (existing.includes(cleaned)) return;

  const db = getAdminClient();
  await db
    .from('merchants')
    .update({ common_descriptors: [...merchant.common_descriptors, cleaned] })
    .eq('id', merchant.id);
}

// ---------------------------------------------------------------------------
// Legacy alias — local-only lookup for manual entry (no AI cost)
// ---------------------------------------------------------------------------

export async function matchMerchant(merchantName: string) {
  return lookupMerchant(merchantName);
}
