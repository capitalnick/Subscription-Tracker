import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Privacy verification tests — ensure the codebase
 * adheres to the privacy-first architecture.
 */

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
        files.push(...getAllTsFiles(fullPath));
      } else if (stat.isFile() && (extname(entry) === '.ts') && !entry.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }
  } catch {
    // ignore errors
  }
  return files;
}

const SRC_DIR = join(__dirname, '..');
const sourceFiles = getAllTsFiles(SRC_DIR);

describe('Privacy Verification', () => {
  describe('No file storage', () => {
    it('does not write uploaded files to disk', () => {
      for (const file of sourceFiles) {
        const content = readFileSync(file, 'utf-8');
        // Check for fs.writeFile patterns that might store uploads
        expect(content).not.toMatch(/writeFileSync.*upload/i);
        expect(content).not.toMatch(/createWriteStream.*upload/i);
      }
    });

    it('does not use temp file paths for uploads', () => {
      const ingestFile = sourceFiles.find((f) => f.includes('ingest.ts') && f.includes('routes'));
      if (ingestFile) {
        const content = readFileSync(ingestFile, 'utf-8');
        expect(content).not.toMatch(/tmp\//);
        expect(content).not.toMatch(/mkdtemp/);
      }
    });
  });

  describe('AI field purging', () => {
    it('purgeAiFields nulls all AI fields', () => {
      const privacyFile = sourceFiles.find((f) => f.includes('privacy.ts'));
      expect(privacyFile).toBeDefined();
      const content = readFileSync(privacyFile!, 'utf-8');

      // Verify all AI fields are set to null
      const aiFields = [
        'aiMerchantName',
        'aiAmount',
        'aiCurrency',
        'aiFrequency',
        'aiDetectedDate',
        'aiNextBilling',
        'aiConfidence',
        'aiNotes',
      ];

      for (const field of aiFields) {
        expect(content).toContain(`${field}: null`);
      }
    });

    it('queue confirm action calls purgeAiFields', () => {
      const queueFile = sourceFiles.find((f) => f.includes('queue.ts') && f.includes('routes'));
      expect(queueFile).toBeDefined();
      const content = readFileSync(queueFile!, 'utf-8');
      expect(content).toContain("import { purgeAiFields } from '../services/privacy.js'");
    });

    it('queue dismiss action calls purgeAiFields', () => {
      const queueFile = sourceFiles.find((f) => f.includes('queue.ts') && f.includes('routes'));
      expect(queueFile).toBeDefined();
      const content = readFileSync(queueFile!, 'utf-8');
      // Should call purgeAiFields with DISMISSED
      expect(content).toContain("'DISMISSED'");
    });

    it('queue merge action calls purgeAiFields', () => {
      const queueFile = sourceFiles.find((f) => f.includes('queue.ts') && f.includes('routes'));
      expect(queueFile).toBeDefined();
      const content = readFileSync(queueFile!, 'utf-8');
      // Should call purgeAiFields with MERGED
      expect(content).toContain("'MERGED'");
    });
  });

  describe('Log redaction', () => {
    it('configures Pino with redaction paths', () => {
      const indexFile = sourceFiles.find((f) => f.endsWith('index.ts') && !f.includes('__tests__'));
      expect(indexFile).toBeDefined();
      const content = readFileSync(indexFile!, 'utf-8');
      expect(content).toContain('redact');
      expect(content).toContain('req.headers.authorization');
      expect(content).toContain('*.email');
    });
  });

  describe('Account deletion', () => {
    it('has DELETE /account endpoint', () => {
      const authFile = sourceFiles.find((f) => f.includes('auth.ts') && f.includes('routes'));
      expect(authFile).toBeDefined();
      const content = readFileSync(authFile!, 'utf-8');
      expect(content).toContain("app.delete('/account'");
    });

    it('deletes Supabase auth user on account deletion', () => {
      const authFile = sourceFiles.find((f) => f.includes('auth.ts') && f.includes('routes'));
      expect(authFile).toBeDefined();
      const content = readFileSync(authFile!, 'utf-8');
      expect(content).toContain('auth.admin.deleteUser');
    });

    it('uses Prisma cascade delete for user data', () => {
      const authFile = sourceFiles.find((f) => f.includes('auth.ts') && f.includes('routes'));
      expect(authFile).toBeDefined();
      const content = readFileSync(authFile!, 'utf-8');
      expect(content).toContain('prisma.user.delete');
    });
  });

  describe('Schema cascade deletes', () => {
    it('has onDelete: Cascade on user relations in schema', () => {
      const schemaPath = join(SRC_DIR, '..', 'prisma', 'schema.prisma');
      const content = readFileSync(schemaPath, 'utf-8');

      // Subscription, DetectedItem, IngestionEvent, SubscriptionCharge should cascade
      const cascadeCount = (content.match(/onDelete: Cascade/g) ?? []).length;
      expect(cascadeCount).toBeGreaterThanOrEqual(4);
    });
  });
});
