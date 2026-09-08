import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adoptVerifiedBaseline, requireMatchingSchema,
  requireVerificationProject, schemaFingerprint } from './database-schema.mjs';

// Internal quality-gate entry point. Never operates on the normal developer project.
const [project, envFile] = process.argv.slice(2);
requireVerificationProject(project);
assert.ok(envFile, 'Explicit private gate environment is required');
assert.match(process.env.STARTRACK_BOOTSTRAP_ADMIN_EMAIL ?? '', /^admin@startrack\.test$/);
const root = fileURLToPath(new URL('../', import.meta.url));
const composeArgs = ['compose', '--project-directory', root, '--env-file', envFile,
  '-f', path.join(root, 'compose.yaml'), '-p', project];
const scratch = mkdtempSync(path.join(tmpdir(), 'startrack-db-rehearsal-'));
const transient = new Set();
let backendPaused = false;
let checks = 0;
let interrupted = false;
let cleaning = false;
let completed = false;
let migrationRun = 0;
const signalHandler = () => { interrupted = true; };
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, signalHandler);

function run(args, { input, binary = false, allowFailure = false, env = process.env } = {}) {
  if (interrupted && !cleaning) throw new Error('Database rehearsal interrupted');
  const result = spawnSync('docker', args, { input, env, encoding: binary ? null : 'utf8',
    timeout: 180_000, maxBuffer: 32 * 1024 * 1024 });
  if (result.error || (result.status !== 0 && !allowFailure)) {
    // Never print arbitrary SQL/data dumps or environment values on failure.
    throw new Error(`Database rehearsal command failed (${args[0]}, status ${result.status ?? 'timeout'}).`);
  }
  return result;
}
const compose = (args, options) => run([...composeArgs, ...args], options);
const sql = (db, text, allowFailure = false) => compose(['exec', '-T', 'db',
  'psql', '-X', '-qAt', '-U', 'postgres', '-d', db, '-v', 'ON_ERROR_STOP=1'],
{ input: text, allowFailure });
const value = (db, text) => sql(db, text).stdout.trim();
const createDatabase = (name) => sql('postgres', `CREATE DATABASE ${name};`);
const schema = (db) => compose(['exec', '-T', 'db', 'pg_dump', '-U', 'postgres', '-d', db,
  '--schema-only', '--no-owner', '--no-acl', '--no-comments',
  '--exclude-table=startrack.flyway_schema_history']).stdout;
const dump = (db) => compose(['exec', '-T', 'db', 'pg_dump', '-U', 'postgres', '-d', db,
  '--format=custom'], { binary: true }).stdout;
const restore = (db, backup) => compose(['exec', '-T', 'db', 'pg_restore', '-U', 'postgres',
  '-d', db, '--exit-on-error', '--single-transaction'], { input: backup });
function flyway(db, command, options = {}) {
  const name = `${project}-flyway-${++migrationRun}`;
  transient.add(name);
  const result = compose(['run', '--rm', '--name', name, '--no-deps', '-T',
    '-e', `FLYWAY_URL=jdbc:postgresql://db:5432/${db}`, 'migrate', ...command],
  { ...options, allowFailure: true });
  transient.delete(name); // --rm completed; timeout/error retains the cleanup target.
  if (result.status !== 0 && !options.allowFailure) throw new Error('Migration operation failed');
  return result;
}
function passed(label) { checks += 1; console.log(`Database check ${checks}: ${label}`); }
const quoteIdentifier = (name) => '"' + name.replaceAll('"', '""') + '"';
function contentFingerprint(db) {
  const tables = JSON.parse(value(db, `SELECT coalesce(json_agg(tablename ORDER BY tablename),'[]')
    FROM pg_tables WHERE schemaname='startrack' AND tablename <> 'flyway_schema_history';`));
  const data = tables.map((table) => [table, value(db, `SELECT coalesce(jsonb_agg(row ORDER BY row::text),'[]')
    FROM (SELECT to_jsonb(t) AS row FROM startrack.${quoteIdentifier(table)} t) data;`)]);
  const sequences = JSON.parse(value(db, `SELECT coalesce(json_agg(schemaname||'.'||sequencename
    ORDER BY schemaname,sequencename),'[]') FROM pg_sequences WHERE schemaname IN ('startrack','public');`));
  for (const seq of sequences) {
    data.push([seq, value(db, `SELECT last_value||':'||is_called FROM ${seq.split('.').map(quoteIdentifier).join('.')};`)]);
  }
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
async function ready(url) {
  for (let i = 0; i < 90; i += 1) {
    if (interrupted) throw new Error('Database rehearsal interrupted');
    try { if ((await fetch(`${url}/api/all`, { signal: AbortSignal.timeout(2000) })).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error('Disposable backend did not become ready');
}
async function temporaryBackend(db, suffix, ddl = 'validate') {
  const name = `${project}-${suffix}`;
  transient.add(name);
  compose(['run', '-d', '--no-deps', '--name', name, '-p', '127.0.0.1::8080',
    '-e', `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/${db}`,
    '-e', `SPRING_JPA_HIBERNATE_DDL_AUTO=${ddl}`, 'backend']);
  const published = run(['port', name, '8080/tcp']).stdout.trim();
  assert.match(published, /^127\.0\.0\.1:\d+$/);
  const url = `http://${published}`;
  await ready(url);
  return { name, url };
}
function removeContainer(name) {
  const result = run(['container', 'rm', '-f', name], { allowFailure: true });
  if (result.status !== 0 && !/No such (container|object)/i.test(result.stderr)) {
    throw new Error('Could not remove disposable container');
  }
  transient.delete(name);
}
function alteredMigration(db, suffix, file, contents, command) {
  const name = `${project}-${suffix}`;
  const source = path.join(scratch, file);
  writeFileSync(source, contents, { mode: 0o644 });
  transient.add(name);
  run(['create', '--name', name, '--network', `${project}_default`,
    '-e', `FLYWAY_URL=jdbc:postgresql://db:5432/${db}`, '-e', 'FLYWAY_USER=postgres',
    '-e', 'FLYWAY_PASSWORD', process.env.STARTRACK_MIGRATION_IMAGE, command],
  { env: { ...process.env, FLYWAY_PASSWORD: process.env.STARTRACK_DB_PASSWORD } });
  run(['cp', source, `${name}:/flyway/sql/${file}`]);
  const result = run(['start', '-a', name], { allowFailure: true });
  removeContainer(name);
  return result;
}
async function projectRoundTrip(url, expectedProject = null) {
  const login = await fetch(`${url}/api/auth/signin`, { method: 'POST',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      email: process.env.STARTRACK_BOOTSTRAP_ADMIN_EMAIL,
      password: process.env.STARTRACK_BOOTSTRAP_ADMIN_PASSWORD,
    }), signal: AbortSignal.timeout(10_000) });
  assert.equal(login.status, 200);
  const { accessToken } = await login.json();
  assert.ok(accessToken);
  const headers = { 'content-type': 'application/json', Authorization: `Bearer ${accessToken}` };
  const request = async (route, options = {}) => {
    const response = await fetch(url + route, { headers, ...options, signal: AbortSignal.timeout(10_000) });
    assert.equal(response.status, 200, route);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  };
  assert.equal((await request('/api/user/me')).email, process.env.STARTRACK_BOOTSTRAP_ADMIN_EMAIL);
  const fixture = JSON.parse(readFileSync(path.join(root, 'scripts/fixtures/project-with-children.json'), 'utf8'));
  if (!expectedProject) {
    await request('/projectCreate/addToProjectCreate/admin%40startrack.test', {
      method: 'POST', body: JSON.stringify(fixture) });
  }
  const projects = await request('/projectCreate/allData');
  const projectRow = projects.find((row) => row.projectName === fixture.projectName);
  assert.ok(projectRow, 'Synthetic nested project must persist');
  assert.ok(Number.isSafeInteger(projectRow.id) && projectRow.id > 0, 'Project ID must be generated');
  if (expectedProject) assert.equal(projectRow.id, expectedProject.id);
  const collections = {
    allGroupMember: 'groupMemberRows', allOutput: 'outputRows', allCollaboration: 'collaborationRows',
    allExternalAdvisor: 'externalAdvisorsRows', allSubcontractor: 'subContractorsRows',
    allPPI: 'ppiRows', allOTR: 'otrRows', allFunding: 'fundingRows', allFundingOverview: 'fundingOverviewRows',
  };
  const dates = new Set(['externalAdvisorsMeeting', 'ppiMeeting', 'otrDate',
    'fundingStartDate', 'fundingEndDate', 'fundingOverviewStartDate', 'fundingOverviewEndDate']);
  const stringified = new Set(['modality', 'areaOfExpertise', 'funding', 'fundingOverview']);
  const compareField = (field, actual, expected, label) => {
    if (dates.has(field)) {
      assert.equal(typeof actual, 'string', `${label}.${field} must be an ISO timestamp`);
      assert.ok(Number.isFinite(Date.parse(actual)), `${label}.${field} must parse as a timestamp`);
      assert.equal(Date.parse(actual), Date.parse(expected), `${label}.${field} must preserve milliseconds`);
    } else {
      // Preserve the inherited Java list-to-string storage, not JSON.stringify(array).
      const stored = stringified.has(field) ? `[${expected.join(', ')}]` : expected;
      assert.deepEqual(actual, stored, `${label}.${field} must equal the submitted fixture`);
    }
  };
  for (const [field, expected] of Object.entries(fixture)) {
    if (field !== 'id' && !Object.values(collections).includes(field)) {
      compareField(field, projectRow[field], expected, 'project');
    }
  }
  assert.equal(projectRow.applyValue, 'SUBMITTED');
  assert.equal(typeof projectRow.createdDate, 'string');
  assert.ok(Number.isFinite(Date.parse(projectRow.createdDate)), 'Server creation timestamp must be valid');
  const overview = fixture.fundingOverviewRows[0];
  for (const field of ['fundingOverview', 'fundingOverviewOther', 'schemeOverview', 'valueOverview',
    'fundingOverviewStartDate', 'fundingOverviewEndDate', 'grantNumberOverview', 'worktribeNumberOverview']) {
    compareField(field, projectRow[field], overview[field], 'project overview summary');
  }
  const children = {};
  for (const [route, collection] of Object.entries(collections)) {
    children[route] = await request(`/projectCreate/${route}/${projectRow.id}`);
    assert.equal(children[route].length, 1, `${route} must return its saved child`);
    const actual = children[route][0];
    const expected = fixture[collection][0];
    assert.deepEqual(Object.keys(actual).sort(), [...new Set([...Object.keys(expected), 'id'])].sort(),
      `${route} must return every submitted field and its generated ID`);
    if (route === 'allGroupMember') {
      assert.equal(actual.id, projectRow.id, 'Inherited group-member projection uses the project ID');
    } else {
      assert.ok(Number.isSafeInteger(actual.id) && actual.id > 0, `${route} child ID must be generated`);
    }
    for (const [field, expectedValue] of Object.entries(expected)) {
      if (field !== 'id') compareField(field, actual[field], expectedValue, route);
    }
  }
  if (expectedProject) assert.deepEqual(children, expectedProject.children);
  return { id: projectRow.id, children, request };
}

try {
  const dbId = compose(['ps', '-q', 'db']).stdout.trim();
  assert.ok(dbId);
  const labels = JSON.parse(run(['inspect', '--format', '{{json .Config.Labels}}', dbId]).stdout);
  assert.equal(labels['com.docker.compose.project'], project);
  assert.equal(labels['com.docker.compose.service'], 'db');

  const backendId = compose(['ps', '-q', 'backend']).stdout.trim();
  assert.ok(backendId);
  const backendLabels = JSON.parse(run(['inspect', '--format', '{{json .Config.Labels}}', backendId]).stdout);
  assert.equal(backendLabels['com.docker.compose.project'], project);
  assert.equal(backendLabels['com.docker.compose.service'], 'backend');
  const initialPort = run(['port', backendId, '8080/tcp']).stdout.trim();
  assert.match(initialPort, /^127\.0\.0\.1:\d+$/);
  // Never use an inherited API URL for writes: derive it from the verified stack.
  const initial = await projectRoundTrip(`http://${initialPort}`);
  passed('all nine nested collections persist through real JPA/PostgreSQL APIs');
  compose(['stop', 'backend']);
  backendPaused = true;
  const reference = schema('starTrack');
  assert.equal(value('starTrack', "SELECT count(*) FROM startrack.flyway_schema_history WHERE version='1' AND success;"), '1');
  flyway('starTrack', ['migrate']);
  flyway('starTrack', ['validate']);
  passed('fresh initialization, repeat migration and checksum validation');

  const changed = alteredMigration('starTrack', 'checksum-test', 'V1__legacy_baseline.sql',
    readFileSync(path.join(root, 'database/migrations/V1__legacy_baseline.sql'), 'utf8') + '\nSELECT 42;\n', 'validate');
  assert.notEqual(changed.status, 0);
  assert.match(changed.stdout + changed.stderr, /checksum mismatch/i);
  const failed = alteredMigration('starTrack', 'rollback-test', 'V2__deliberate_failure.sql',
    'CREATE TABLE startrack.failed_migration_probe (id integer);\nSELECT 1/0;\n', 'migrate');
  assert.notEqual(failed.status, 0);
  assert.match(failed.stdout + failed.stderr, /division by zero/i);
  assert.equal(value('starTrack', "SELECT to_regclass('startrack.failed_migration_probe') IS NULL;"), 't');
  assert.equal(value('starTrack', "SELECT count(*) FROM startrack.flyway_schema_history WHERE version='2';"), '0');
  flyway('starTrack', ['validate']);
  assert.notEqual(flyway('starTrack', ['clean'], { allowFailure: true }).status, 0);
  passed('checksum tampering fails, transactional migration failure rolls back, and clean is disabled');

  // Reconcile SQL baseline against an independently Hibernate-generated schema.
  createDatabase('phase3_generated');
  sql('phase3_generated', 'CREATE SCHEMA startrack;');
  const generated = await temporaryBackend('phase3_generated', 'schema-generator', 'create');
  removeContainer(generated.name);
  requireMatchingSchema(schema('phase3_generated'), reference);
  passed('fresh Hibernate schema matches migration baseline');

  // Populated legacy copy, deliberately excluding migration history from the dump.
  createDatabase('phase3_legacy');
  const legacyBackup = compose(['exec', '-T', 'db', 'pg_dump', '-U', 'postgres', '-d', 'starTrack',
    '--format=custom', '--exclude-table=startrack.flyway_schema_history'], { binary: true }).stdout;
  restore('phase3_legacy', legacyBackup);
  sql('postgres', 'CREATE ROLE phase3_reader NOLOGIN;');
  sql('phase3_legacy', 'GRANT USAGE ON SCHEMA startrack TO phase3_reader; GRANT SELECT ON ALL TABLES IN SCHEMA startrack TO phase3_reader;');
  const before = contentFingerprint('phase3_legacy');
  const recoveryBackup = dump('phase3_legacy');
  const backupFile = path.join(scratch, 'synthetic-recovery.dump');
  writeFileSync(backupFile, recoveryBackup, { mode: 0o600 });
  createDatabase('phase3_restored');
  restore('phase3_restored', readFileSync(backupFile));
  assert.equal(contentFingerprint('phase3_restored'), before);
  assert.equal(value('phase3_restored', "SELECT has_table_privilege('phase3_reader','startrack.project_create','SELECT');"), 't');
  console.log(JSON.stringify({ schemaFingerprint: schemaFingerprint(reference),
    syntheticBackupSha256: createHash('sha256').update(recoveryBackup).digest('hex') }));
  passed('backup/restore preserves every application table, relationship, sequence counter and test grant');

  assert.notEqual(flyway('phase3_legacy', ['migrate'], { allowFailure: true }).status, 0);
  assert.equal(value('phase3_legacy', "SELECT to_regclass('startrack.flyway_schema_history') IS NULL;"), 't');
  passed('ordinary startup refuses an unmanaged populated database');

  createDatabase('phase3_drift');
  restore('phase3_drift', recoveryBackup);
  sql('phase3_drift', 'ALTER TABLE startrack.project_create ADD COLUMN unexpected text;');
  assert.throws(() => requireMatchingSchema(schema('phase3_drift'), reference), /adoption refused/);
  assert.equal(value('phase3_drift', "SELECT to_regclass('startrack.flyway_schema_history') IS NULL;"), 't');
  passed('unexpected schema drift is refused before baseline metadata is written');

  for (const db of ['phase3_legacy', 'phase3_restored']) {
    await adoptVerifiedBaseline({ schema: schema(db), reference,
      restoredSchema: schema('phase3_restored'), restoredDataMatches: contentFingerprint(db) === before,
      hasHistory: value(db, "SELECT to_regclass('startrack.flyway_schema_history') IS NOT NULL;") === 't',
      baseline: () => flyway(db, ['-baselineVersion=1', 'baseline']),
      validate: () => { flyway(db, ['migrate']); flyway(db, ['validate']); } });
    assert.equal(contentFingerprint(db), before);
  }
  passed('explicit V1 adoption preserves populated data and ID counters');

  const recovered = await temporaryBackend('phase3_restored', 'recovered-app');
  const restoredProject = await projectRoundTrip(recovered.url, initial);
  const additional = JSON.parse(readFileSync(path.join(root, 'scripts/fixtures/project-with-children.json'), 'utf8'));
  additional.projectName += ' after recovery';
  await restoredProject.request('/projectCreate/addToProjectCreate/admin%40startrack.test', {
    method: 'POST', body: JSON.stringify(additional) });
  const newProject = (await restoredProject.request('/projectCreate/allData')).find((row) => row.projectName === additional.projectName);
  assert.ok(newProject.id > initial.id, 'New records must advance restored ID counters');
  // Real JPA history queries: repeated names and tied timestamps remain distinct rows.
  await restoredProject.request('/projectCreate/addToProjectCreate/admin%40startrack.test', {
    method: 'POST', body: JSON.stringify(additional) });
  const peers = (await restoredProject.request('/projectCreate/allData')).filter((row) => row.projectName === additional.projectName);
  assert.equal(peers.length, 2);
  const peerIds = peers.map((row) => { assert.ok(Number.isSafeInteger(row.id)); return row.id; });
  sql('phase3_restored', `UPDATE startrack.project_create SET created_date='2026-01-02 03:04:05' WHERE id IN (${peerIds.join(',')});`);
  assert.equal((await restoredProject.request('/projectCreate/allDatalatest')).filter((row) => peerIds.includes(row.id)).length, 2);
  assert.deepEqual(await restoredProject.request('/projectCreate/allDataHistroy/' + encodeURIComponent(additional.projectName)), []);
  sql('phase3_restored', `UPDATE startrack.project_create SET created_date='2026-01-01 03:04:05' WHERE id=${peerIds[0]};`);
  assert.equal((await restoredProject.request('/projectCreate/allDataHistroy/' + encodeURIComponent(additional.projectName)))[0].id, peerIds[0]);
  passed('actual repository history queries preserve repeated-name and tied-timestamp behavior');
  const childTables = ['collaboration_rows', 'external_advisors_rows', 'funding_overview_rows',
    'funding_rows', 'group_member_rows', 'otr_rows', 'output_rows', 'ppi_rows', 'sub_contractors_rows'];
  const childCounts = childTables.map((table) => value('phase3_restored', `SELECT count(*) FROM startrack.${table};`));
  sql('phase3_restored', `INSERT INTO startrack.project_create_collaboration_rows
    SELECT ${peerIds[1]}, collaboration_rows_id FROM startrack.project_create_collaboration_rows
    WHERE project_create_id=${peerIds[0]};`);
  await restoredProject.request(`/projectCreate/delete/${peerIds[0]}`, { method: 'DELETE' });
  assert.equal(value('phase3_restored', `SELECT count(*) FROM startrack.project_create WHERE id=${peerIds[0]};`), '0');
  for (const [index, table] of childTables.entries()) {
    assert.equal(value('phase3_restored', `SELECT count(*) FROM startrack.project_create_${table} WHERE project_create_id=${peerIds[0]};`), '0');
    assert.equal(value('phase3_restored', `SELECT count(*) FROM startrack.${table};`), childCounts[index]);
  }
  assert.equal((await restoredProject.request(`/projectCreate/allCollaboration/${peerIds[1]}`)).length, 2);
  passed('JPA deletion removes project links but retains orphan/shared child rows as currently mapped');
  removeContainer(recovered.name);
  passed('restored application validates schema, logs in, reads nested records and inserts new IDs');

  completed = true;
} finally {
  cleaning = true;
  let failed = false;
  for (const name of transient) {
    try { removeContainer(name); } catch { failed = true; }
  }
  if (backendPaused) {
    try { compose(['start', 'backend']); } catch { failed = true; }
  }
  rmSync(scratch, { recursive: true, force: true });
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.removeListener(signal, signalHandler);
  if (failed) throw new Error('Database rehearsal cleanup/restoration failed');
  if (interrupted) throw new Error('Database rehearsal interrupted');
}
if (completed) console.log(`PostgreSQL migration/recovery rehearsal and cleanup passed: ${checks} checks.`);
