import { createHash } from 'node:crypto';

// Compare pg_dump --schema-only output produced by the SAME PostgreSQL version.
// Ignore only dump comments, blank lines and randomized psql safety wrappers.
// Keep types, defaults, constraints, indexes, sequences and SQL statements.
export function canonicalSchema(sql) {
  return sql.split(/\r?\n/).filter((line) => {
    const text = line.trim();
    return text && !text.startsWith('--') && !/^\\(?:un)?restrict\s/.test(text);
  }).map((line) => line.trim()).join('\n');
}

export function schemaFingerprint(sql) {
  return createHash('sha256').update(canonicalSchema(sql)).digest('hex');
}

export function requireMatchingSchema(actual, expected) {
  if (schemaFingerprint(actual) !== schemaFingerprint(expected)) {
    throw new Error('Schema differs from the reviewed baseline; adoption refused.');
  }
}

export function requireVerificationProject(project) {
  if (!/^startrack_verify_[a-f0-9]{16}$/.test(project ?? '')) {
    throw new Error('Database rehearsals require a gate-generated disposable project.');
  }
}

// No baseline action is allowed until backup/restore evidence and schema checks pass.
export async function adoptVerifiedBaseline({ schema, reference, restoredSchema,
  restoredDataMatches, hasHistory, baseline, validate }) {
  if (hasHistory) throw new Error('Database already has migration history; adoption refused.');
  if (!restoredDataMatches) throw new Error('Backup/restore evidence missing; adoption refused.');
  requireMatchingSchema(schema, reference);
  requireMatchingSchema(restoredSchema, reference);
  await baseline();
  await validate();
}
