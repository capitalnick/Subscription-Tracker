import { prisma } from '../lib/prisma.js';

/**
 * Match an AI-extracted merchant name to our merchant database.
 * Uses a three-stage approach: slug match → name match → descriptor match.
 */
export async function matchMerchant(merchantName: string) {
  if (!merchantName) return null;

  const normalized = merchantName.trim().toLowerCase();
  const slug = normalized.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // 1. Exact match on slug (fastest)
  const slugMatch = await prisma.merchant.findUnique({ where: { slug } });
  if (slugMatch) return slugMatch;

  // 2. Case-insensitive match on canonical name
  const nameMatch = await prisma.merchant.findFirst({
    where: { canonicalName: { equals: merchantName.trim(), mode: 'insensitive' } },
  });
  if (nameMatch) return nameMatch;

  // 3. Descriptor match using Postgres array contains
  // Try matching the uppercased name against the commonDescriptors array
  const descriptorMatch = await prisma.merchant.findFirst({
    where: {
      commonDescriptors: { has: merchantName.trim().toUpperCase() },
    },
  });
  if (descriptorMatch) return descriptorMatch;

  // 4. Partial descriptor match — check if any descriptor is contained in the input
  //    Limited to 50 merchants to avoid full table scan
  const candidates = await prisma.merchant.findMany({
    where: {
      OR: [
        { canonicalName: { contains: merchantName.trim().split(' ')[0], mode: 'insensitive' } },
      ],
    },
    take: 50,
  });

  for (const m of candidates) {
    for (const desc of m.commonDescriptors) {
      if (normalized.includes(desc.toLowerCase()) || desc.toLowerCase().includes(normalized)) {
        return m;
      }
    }
  }

  return null;
}
