import assert from 'node:assert/strict';
import test from 'node:test';
import { applySql, prepareManifest, validateManifest, main } from './review-project-history.mjs';

const snapshot = { fingerprint: 'a'.repeat(64), versions: [
  { id: '1', name: 'Same name', createdAt: null, creatorId: null },
  { id: '9007199254740993', name: 'Same name', createdAt: null, creatorId: null },
] };
const target = { project: 'startrack_verify_0123456789abcdef', database: 'phase4_review' };
const reviewed = () => ({ ...prepareManifest(snapshot, target), approved: true,
  reviewer: 'Synthetic verification reviewer', approvalReference: 'Synthetic fixture review',
  approvedAt: '2026-09-08T12:00:00.000Z' });

test('prepare never groups equal names or approves its own proposal', () => {
  const manifest = prepareManifest(snapshot,target);
  assert.equal(manifest.approved,false);
  assert.equal(manifest.groups.length,2);
  assert.notEqual(manifest.groups[0].projectId,manifest.groups[1].projectId);
  assert.deepEqual(manifest.groups.map((group) => group.versions),[['1'],['9007199254740993']]);
  assert.throws(() => validateManifest(manifest,snapshot.versions.map((row) => row.id)), /approval/);
});

test('explicit reviewed grouping preserves version order and full bigint IDs', () => {
  const manifest = reviewed();
  manifest.groups = [{ projectId: manifest.groups[0].projectId, versions: ['9007199254740993','1'] }];
  validateManifest(manifest,['1','9007199254740993']);
  assert.match(applySql(manifest), /version_ordinal := version_ordinal\+1/);
});

for (const [name, mutate] of [
  ['string approval', (m) => { m.approved = 'true'; }],
  ['missing approval', (m) => { delete m.approved; }],
  ['missing reviewer', (m) => { m.reviewer = ' '; }],
  ['missing approval reference', (m) => { m.approvalReference = ''; }],
  ['invalid approval timestamp', (m) => { m.approvedAt = 'not-a-date'; }],
  ['invalid fingerprint', (m) => { m.sourceFingerprint = 'stale'; }],
  ['incomplete mapping', (m) => { m.groups.pop(); }],
  ['duplicate version', (m) => { m.groups[1].versions = ['1']; }],
  ['duplicate project', (m) => { m.groups[1].projectId = m.groups[0].projectId; }],
  ['invalid project UUID', (m) => { m.groups[0].projectId = "'; DROP TABLE example;"; }],
  ['unknown version', (m) => { m.groups[0].versions = ['2']; }],
  ['numeric ID', (m) => { m.groups[0].versions = [1]; }],
  ['empty group', (m) => { m.groups[0].versions = []; }],
]) {
  test(`review refuses ${name}`, () => {
    const manifest = reviewed(); mutate(manifest);
    assert.throws(() => validateManifest(manifest,snapshot.versions.map((row) => row.id)));
  });
}

test('apply locks source before rechecking fingerprint and writes within one transaction', () => {
  const sql = applySql(reviewed());
  assert.ok(sql.startsWith('BEGIN;'));
  assert.ok(sql.indexOf('ACCESS EXCLUSIVE') < sql.indexOf("pg_temp.history_snapshot()->>'fingerprint'"));
  assert.ok(sql.indexOf('Source data or schema changed') < sql.indexOf('INSERT INTO startrack.project('));
  assert.match(sql,/INSERT INTO startrack.project_history_review/);
  assert.ok(sql.endsWith('COMMIT;'));
});

test('review text cannot escape SQL literals or procedural dollar quoting', () => {
  const manifest = reviewed();
  manifest.sourceVersions[0].name = "$$; DROP TABLE startrack.project; -- O'Reilly";
  const sql = applySql(manifest);
  assert.match(sql,/DO \$history_[a-f0-9]+\$/);
  assert.ok(sql.includes("O''Reilly"));
});

test('CLI refuses developer project before any Docker interaction', () => {
  assert.throws(() => main(['prepare','startrack','private.env','starTrack','review.json']),/disposable project/);
});
