import { createHash } from 'crypto';

/**
 * SHA-256 hash of a buffer — used for file deduplication.
 * No PII is stored, only the hash.
 */
export function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
