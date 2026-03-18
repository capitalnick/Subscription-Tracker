import { prisma } from '../lib/prisma.js';
import { resolveUnknownMerchant } from './vertexAi.js';
import { fetchAndStoreLogo } from './logo.js';
import type { Merchant } from '@prisma/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResolvedMerchant {
  merchant: Merchant;
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

async function lookupMerchant(merchantName: string): Promise<Merchant | null> {
  if (!merchantName) return null;

  const normalized = merchantName.trim().toLowerCase();
  const slug = slugify(merchantName);

  // 1. Exact match on slug
  const slugMatch = await prisma.merchant.findUnique({ where: { slug } });
  if (slugMatch) return slugMatch;

  // 2. Case-insensitive match on canonical name
  const nameMatch = await prisma.merchant.findFirst({
    where: { canonicalName: { equals: merchantName.trim(), mode: 'insensitive' } },
  });
  if (nameMatch) return nameMatch;

  // 3. Descriptor match — check common_descriptors array
  const cleaned = cleanDescriptor(merchantName);
  const descriptorMatch = await prisma.merchant.findFirst({
    where: { commonDescriptors: { has: cleaned } },
  });
  if (descriptorMatch) return descriptorMatch;

  // 4. Partial / fuzzy match
  const firstWord = merchantName.trim().split(' ')[0];
  const candidates = await prisma.merchant.findMany({
    where: { canonicalName: { contains: firstWord, mode: 'insensitive' } },
    take: 50,
  });

  for (const m of candidates) {
    for (const desc of m.commonDescriptors ?? []) {
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
    if (local.websiteUrl && !local.logoUrl) {
      fetchAndStoreLogo(local.id, local.websiteUrl).catch(console.error);
    }
    return { merchant: local, canonicalName: local.canonicalName, isNew: false };
  }

  // Stage 2: AI resolution
  const ai = await resolveUnknownMerchant(rawDescriptor);

  // Re-check by slug to prevent duplicate merchants
  const aiSlug = slugify(ai.merchantName);
  const existing = await prisma.merchant.findUnique({ where: { slug: aiSlug } });

  if (existing) {
    await writeBackDescriptor(existing, rawDescriptor);
    // Fire-and-forget: fetch logo if missing
    if (existing.websiteUrl && !existing.logoUrl) {
      fetchAndStoreLogo(existing.id, existing.websiteUrl).catch(console.error);
    }
    return { merchant: existing, canonicalName: existing.canonicalName, isNew: false };
  }

  // Insert new merchant
  try {
    const newMerchant = await prisma.merchant.create({
      data: {
        canonicalName: ai.merchantName,
        slug: aiSlug,
        category: ai.category,
        commonDescriptors: [cleanDescriptor(rawDescriptor)],
        websiteUrl: ai.websiteUrl,
        logoLetter: logoLetterFrom(ai.merchantName),
        logoColor: logoColorFrom(ai.merchantName),
      },
    });

    // Fire-and-forget: fetch logo for new merchant
    if (ai.websiteUrl) {
      fetchAndStoreLogo(newMerchant.id, ai.websiteUrl).catch(console.error);
    }

    return { merchant: newMerchant, canonicalName: ai.merchantName, isNew: true };
  } catch (error) {
    console.error('Failed to insert new merchant:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Write-back — teach the system new descriptors
// ---------------------------------------------------------------------------

async function writeBackDescriptor(merchant: Merchant, rawDescriptor: string) {
  const cleaned = cleanDescriptor(rawDescriptor);
  const existing = (merchant.commonDescriptors ?? []).map((d: string) => d.toUpperCase());
  if (existing.includes(cleaned)) return;

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { commonDescriptors: [...merchant.commonDescriptors, cleaned] },
  });
}

// ---------------------------------------------------------------------------
// Legacy alias — local-only lookup for manual entry (no AI cost)
// ---------------------------------------------------------------------------

export async function matchMerchant(merchantName: string) {
  return lookupMerchant(merchantName);
}
