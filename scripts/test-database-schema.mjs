import assert from 'node:assert/strict';
import test from 'node:test';
import { adoptVerifiedBaseline, canonicalSchema, requireMatchingSchema,
  requireVerificationProject } from './database-schema.mjs';

const schema = 'CREATE TABLE startrack.example (id bigint NOT NULL);\n';
test('schema comparison ignores only dump decoration', () => {
  assert.equal(canonicalSchema('-- version\n\\restrict random\n' + schema +
    '\\unrestrict random\n'), canonicalSchema(schema));
});
for (const changed of [schema.replace('bigint', 'integer'),
  schema.replace('NOT NULL', ''), schema + 'CREATE TABLE startrack.extra (id int);',
  schema + 'CREATE SEQUENCE public.extra;']) {
  test('schema drift is rejected: ' + changed.trim(), () => {
    assert.throws(() => requireMatchingSchema(changed, schema), /adoption refused/);
  });
}
test('rehearsals reject normal, absent and malformed project names', () => {
  for (const value of [undefined, '', 'startrack', 'startrack_verify_', '../startrack',
    'startrack_verify_0123456789abcdef;echo']) {
    assert.throws(() => requireVerificationProject(value), /disposable project/);
  }
  requireVerificationProject('startrack_verify_0123456789abcdef');
});
test('adoption requires a matching restored copy before baselining', async () => {
  const calls = [];
  const input = { schema, reference: schema, restoredSchema: schema,
    restoredDataMatches: true, hasHistory: false,
    baseline: () => calls.push('baseline'), validate: () => calls.push('validate') };
  for (const override of [{ hasHistory: true }, { restoredDataMatches: false },
    { schema: schema + 'SELECT 1;' }, { restoredSchema: schema + 'SELECT 1;' }]) {
    await assert.rejects(adoptVerifiedBaseline({ ...input, ...override }));
    assert.deepEqual(calls, []);
  }
  await adoptVerifiedBaseline(input);
  assert.deepEqual(calls, ['baseline', 'validate']);
});
test('failed baseline prevents later operations', async () => {
  let validated = false;
  await assert.rejects(adoptVerifiedBaseline({ schema, reference: schema,
    restoredSchema: schema, restoredDataMatches: true, hasHistory: false,
    baseline: () => { throw new Error('database failure'); },
    validate: () => { validated = true; } }), /database failure/);
  assert.equal(validated, false);
});
