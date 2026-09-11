import { readFileSync } from 'node:fs';
import { requireMatchingSchema, schemaFingerprint } from './database-schema.mjs';

const [referenceFile, candidateFile, ...extra] = process.argv.slice(2);
if (!referenceFile || !candidateFile || extra.length) {
  console.error('Usage: node scripts/compare-database-schema.mjs reference.sql candidate.sql');
  process.exitCode = 2;
} else {
  try {
    const reference = readFileSync(referenceFile, 'utf8');
    const candidate = readFileSync(candidateFile, 'utf8');
    requireMatchingSchema(candidate, reference);
    console.log(`Schema match: ${schemaFingerprint(reference)}. No database changes were made.`);
  } catch {
    console.error('Schema comparison failed: unreadable files or structural mismatch. Do not baseline.');
    process.exitCode = 1;
  }
}
