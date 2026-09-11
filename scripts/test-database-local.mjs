import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adoptVerifiedBaseline, requireMatchingSchema,
  requireVerificationProject, schemaFingerprint } from './database-schema.mjs';
import { main as reviewHistory } from './review-project-history.mjs';
import { rehearsalFetch } from './rehearsal-http.mjs';

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
function contentFingerprint(db, includeSequences = true) {
  const tables = JSON.parse(value(db, `SELECT coalesce(json_agg(tablename ORDER BY tablename),'[]')
    FROM pg_tables WHERE schemaname='startrack' AND tablename <> 'flyway_schema_history';`));
  const data = tables.map((table) => [table, value(db, `SELECT coalesce(jsonb_agg(row ORDER BY row::text),'[]')
    FROM (SELECT to_jsonb(t) AS row FROM startrack.${quoteIdentifier(table)} t) data;`)]);
  const sequences = includeSequences ? JSON.parse(value(db, `SELECT coalesce(json_agg(schemaname||'.'||sequencename
    ORDER BY schemaname,sequencename),'[]') FROM pg_sequences WHERE schemaname IN ('startrack','public');`)) : [];
  for (const seq of sequences) {
    data.push([seq, value(db, `SELECT last_value||':'||is_called FROM ${seq.split('.').map(quoteIdentifier).join('.')};`)]);
  }
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}
async function ready(url) {
  for (let i = 0; i < 90; i += 1) {
    if (interrupted) throw new Error('Database rehearsal interrupted');
    try { if ((await rehearsalFetch(`${url}/api/all`, { signal: AbortSignal.timeout(2000) })).ok) return; } catch {}
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
  const login = await rehearsalFetch(`${url}/api/auth/signin`, { method: 'POST',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      email: process.env.STARTRACK_BOOTSTRAP_ADMIN_EMAIL,
      password: process.env.STARTRACK_BOOTSTRAP_ADMIN_PASSWORD,
    }), signal: AbortSignal.timeout(10_000) });
  assert.equal(login.status, 200);
  const { accessToken } = await login.json();
  assert.ok(accessToken);
  const headers = { 'content-type': 'application/json', Authorization: `Bearer ${accessToken}` };
  const rawRequest = (route, options = {}) => rehearsalFetch(url + route,
    { headers, ...options, signal: AbortSignal.timeout(10_000) });
  const request = async (route, options = {}) => {
    const response = await rawRequest(route, options);
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
  return { id: projectRow.id, children, request, rawRequest };
}

async function verifyLateProjectRollback(client) {
  // Invoked only after the outer project/container label and loopback-port checks.
  const db = 'starTrack';
  const marker = `synthetic-rollback-${randomUUID()}`;
  const fixture = JSON.parse(readFileSync(path.join(root, 'scripts/fixtures/project-with-children.json'), 'utf8'));
  fixture.projectName = marker;
  fixture.outputRows[0].output = marker;
  const beforeSchema = schema(db);
  // PostgreSQL sequences intentionally do not roll back; compare every application
  // row (including all children and joins), not generated counter positions.
  const beforeRows = contentFingerprint(db, false);
  const tables = ['collaboration_rows', 'external_advisors_rows', 'funding_overview_rows',
    'funding_rows', 'group_member_rows', 'otr_rows', 'output_rows', 'ppi_rows', 'sub_contractors_rows'];
  const joinAssertions = tables.map((table) => `
    IF NOT EXISTS (SELECT 1 FROM startrack.project_create_${table} WHERE project_create_id=probe_id) THEN
      RAISE EXCEPTION 'Synthetic probe did not reach every nested join' USING ERRCODE='P0001';
    END IF;`).join('\n');
  try {
    sql(db, `
      CREATE SEQUENCE startrack.phase4_rollback_witness;
      CREATE FUNCTION startrack.phase4_reject_synthetic_output() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE probe_id bigint;
      BEGIN
        IF NEW.output = '${marker}' THEN
          SELECT id INTO STRICT probe_id FROM startrack.project_create WHERE project_name='${marker}';
          ${joinAssertions}
          -- Sequence changes survive rollback, proving this was the late DB failure,
          -- rather than an earlier DTO validation error or a different exception.
          PERFORM nextval('startrack.phase4_rollback_witness');
          RAISE EXCEPTION 'Synthetic late nested constraint failure' USING ERRCODE='23514';
        END IF;
        RETURN NEW;
      END;
      $$;
      CREATE CONSTRAINT TRIGGER phase4_reject_synthetic_output
        AFTER INSERT ON startrack.output_rows DEFERRABLE INITIALLY DEFERRED
        FOR EACH ROW EXECUTE FUNCTION startrack.phase4_reject_synthetic_output();
    `);
    const response = await client.rawRequest('/projectCreate/addToProjectCreate/admin%40startrack.test', {
      method: 'POST', body: JSON.stringify(fixture),
    });
    assert.equal(response.status, 409, 'A late database constraint must produce a safe conflict response');
    const text = await response.text();
    const error = JSON.parse(text);
    assert.equal(error.success, false);
    assert.equal(error.code, 'CONFLICT');
    assert.equal(typeof error.message, 'string');
    assert.equal(typeof error.requestId, 'string');
    assert.ok(error.requestId.length > 0);
    assert.doesNotMatch(text, /synthetic-rollback-|Synthetic late nested|23514|phase4_|org\.hibernate|SQLException|stackTrace|INSERT INTO/i,
      'Conflict response must not reveal trigger internals, SQL or rejected fixture data');
    assert.equal(value(db, 'SELECT is_called FROM startrack.phase4_rollback_witness;'), 't',
      'The deferred trigger must run after the project and all nine nested joins have been inserted');
    assert.equal(contentFingerprint(db, false), beforeRows,
      'Failed API transaction must leave every project, child, join and account row unchanged');
  } finally {
    // Permit cleanup even when the signal handler has marked execution interrupted.
    const wasCleaning = cleaning;
    cleaning = true;
    try {
      sql(db, `DROP TRIGGER IF EXISTS phase4_reject_synthetic_output ON startrack.output_rows;
        DROP FUNCTION IF EXISTS startrack.phase4_reject_synthetic_output();
        DROP SEQUENCE IF EXISTS startrack.phase4_rollback_witness;`);
      requireMatchingSchema(schema(db), beforeSchema);
    } finally { cleaning = wasCleaning; }
  }
  fixture.projectName = `${marker}-recovered`;
  fixture.outputRows[0].output = 'Synthetic valid output after rollback';
  await client.request('/projectCreate/addToProjectCreate/admin%40startrack.test', {
    method: 'POST', body: JSON.stringify(fixture),
  });
  assert.equal((await client.request('/projectCreate/allData'))
    .filter((row) => row.projectName === fixture.projectName).length, 1,
  'A valid API transaction must still succeed after the rejected nested insert');
  passed('late nested PostgreSQL constraint through real API rolls back every row and allows subsequent saves');
}

async function verifyReviewedUpgrade(db) {
  const legacyRowsSql = `SELECT jsonb_agg(to_jsonb(p)-ARRAY['project_id','version_number','created_by','modified_by'] ORDER BY id)
    FROM startrack.project_create p;`;
  const originalRows = value(db,legacyRowsSql);
  flyway(db,['-target=2','migrate']);
  assert.notEqual(flyway(db,['migrate'],{allowFailure:true}).status,0,
    'Populated V2 must not finalize without explicit mapping');
  const manifestFile = path.join(scratch,`${db}-review.json`);
  reviewHistory(['prepare',project,envFile,db,manifestFile]);
  const proposal = JSON.parse(readFileSync(manifestFile,'utf8'));
  assert.equal(proposal.approved,false);
  assert.equal(proposal.groups.length,3,'Equal legacy names must remain separate proposals');
  assert.throws(() => reviewHistory(['apply',project,envFile,db,manifestFile]));
  const manifest = {...proposal,approved:true,reviewer:'Synthetic regression reviewer',
    approvalReference:'Synthetic Phase 4 migration rehearsal',approvedAt:new Date().toISOString()};
  const sourceIds = proposal.sourceVersions.map((row) => row.id);
  manifest.groups = [{projectId:proposal.groups[0].projectId,versions:[sourceIds[1],sourceIds[0]]},
    {projectId:proposal.groups[2].projectId,versions:[sourceIds[2]]}];
  const writeManifest = (data) => writeFileSync(manifestFile,JSON.stringify(data),{mode:0o600});
  writeManifest({...manifest,groups:manifest.groups.slice(0,1)});
  assert.throws(() => reviewHistory(['apply',project,envFile,db,manifestFile]));
  writeManifest({...manifest,groups:[manifest.groups[0],manifest.groups[0]]});
  assert.throws(() => reviewHistory(['apply',project,envFile,db,manifestFile]));
  writeManifest(manifest);
  sql(db,`UPDATE startrack.project_create SET project_background='Synthetic changed after review' WHERE id=${sourceIds[0]};`);
  assert.throws(() => reviewHistory(['apply',project,envFile,db,manifestFile]));
  sql(db,`UPDATE startrack.project_create SET project_background=NULL WHERE id=${sourceIds[0]};
    ALTER TABLE startrack.project_create ADD COLUMN synthetic_review_drift text;`);
  assert.throws(() => reviewHistory(['apply',project,envFile,db,manifestFile]));
  sql(db,'ALTER TABLE startrack.project_create DROP COLUMN synthetic_review_drift;');
  // Explicitly prove manual assignments cannot stand in for the approval audit.
  const unaudited = randomUUID();
  sql(db,`INSERT INTO startrack.project(id,created_at) VALUES('${unaudited}',CURRENT_TIMESTAMP);
    UPDATE startrack.project_create SET project_id='${unaudited}',version_number=id;`);
  assert.notEqual(flyway(db,['migrate'],{allowFailure:true}).status,0);
  sql(db,`UPDATE startrack.project_create SET project_id=NULL,version_number=NULL;
    DELETE FROM startrack.project WHERE id='${unaudited}';`);
  // Dropped columns retain attnum gaps: regenerate the reviewed fingerprint after
  // the deliberate schema mutation, retaining the reviewer-approved grouping.
  const refreshedFile = path.join(scratch,`${db}-refreshed-review.json`);
  reviewHistory(['prepare',project,envFile,db,refreshedFile]);
  manifest.sourceFingerprint = JSON.parse(readFileSync(refreshedFile,'utf8')).sourceFingerprint;
  writeManifest(manifest);
  reviewHistory(['apply',project,envFile,db,manifestFile]);
  assert.equal(value(db,'SELECT count(*) FROM startrack.project_history_review;'),'1');
  assert.equal(value(db,legacyRowsSql),originalRows,'Mapping must preserve all legacy project fields');
  assert.equal(value(db,`SELECT version_number FROM startrack.project_create WHERE id=${sourceIds[1]};`),'1');
  assert.equal(value(db,`SELECT version_number FROM startrack.project_create WHERE id=${sourceIds[0]};`),'2');
  assert.equal(value(db,'SELECT count(*) FROM startrack.project;'),'2');
  assert.equal(value(db,`SELECT created_by IS NULL FROM startrack.project_create WHERE id=${sourceIds[2]};`),'t');
  flyway(db,['migrate']); flyway(db,['validate']);
  assert.throws(() => reviewHistory(['apply',project,envFile,db,manifestFile]),'Finalized mapping cannot be reapplied');
  sql(db,`UPDATE startrack."user" SET email='renamed-legacy-owner@startrack.test'
    WHERE email='legacy-owner@startrack.test';`);
  assert.equal(value(db,`SELECT apply_user FROM startrack.project_create WHERE id=${sourceIds[0]};`),'legacy-owner@startrack.test');
  assert.equal(value(db,`SELECT count(*) FROM startrack.project_create p JOIN startrack."user" u ON u.id=p.created_by
    WHERE u.email='renamed-legacy-owner@startrack.test';`),'2');
  passed(`${db}: unapproved/incomplete/duplicate/stale/unaudited mapping refused; reviewed order and account attribution preserved`);
  verifySnapshotGuards(db,sourceIds[0]);
}

function verifySnapshotGuards(db,legacyId) {
  const fails = (query) => assert.notEqual(sql(db,query,true).status,0,'Immutable snapshot mutation must fail');
  fails(`UPDATE startrack.project_create SET project_name='Changed' WHERE id=${legacyId};`);
  fails(`DELETE FROM startrack.project_create WHERE id=${legacyId};`);
  fails(`UPDATE startrack.output_rows SET output='Changed' WHERE id IN
    (SELECT output_rows_id FROM startrack.project_create_output_rows WHERE project_create_id=${legacyId});`);
  fails(`DELETE FROM startrack.project_create_output_rows WHERE project_create_id=${legacyId};`);
  fails(`UPDATE startrack.project_create_output_rows SET project_create_id=project_create_id WHERE project_create_id=${legacyId};`);
  fails(`INSERT INTO startrack.snapshot_creation_ledger VALUES('project_create',${legacyId},pg_current_xact_id());`);
  const identity = randomUUID();
  sql(db,`BEGIN;
    INSERT INTO startrack.project(id,created_at) VALUES('${identity}',CURRENT_TIMESTAMP);
    INSERT INTO startrack.project_create(project_id,version_number,project_name)
      VALUES('${identity}',1,'Synthetic savepoint snapshot');
    SAVEPOINT child_insert;
    INSERT INTO startrack.output_rows(output) VALUES('Synthetic rolled-back child');
    ROLLBACK TO child_insert;
    INSERT INTO startrack.output_rows(output) VALUES('Synthetic savepoint child');
    INSERT INTO startrack.project_create_output_rows(project_create_id,output_rows_id)
      SELECT p.id,o.id FROM startrack.project_create p CROSS JOIN startrack.output_rows o
      WHERE p.project_id='${identity}' AND o.output='Synthetic savepoint child';
    COMMIT;`);
  assert.equal(value(db,'SELECT count(*) FROM startrack.snapshot_creation_ledger;'),'0',
    'Deferred cleanup must leave no durable transaction IDs after commit');
  const newId = value(db,`SELECT id FROM startrack.project_create WHERE project_id='${identity}';`);
  const before = contentFingerprint(db,false);
  fails(`BEGIN;
    INSERT INTO startrack.project_create(project_id,version_number,project_name)
      VALUES('${identity}',2,'Synthetic invalid reuse');
    INSERT INTO startrack.project_create_output_rows(project_create_id,output_rows_id)
      SELECT p.id,l.output_rows_id FROM startrack.project_create p CROSS JOIN startrack.project_create_output_rows l
      WHERE p.project_id='${identity}' AND p.version_number=2 AND l.project_create_id=${newId};
    COMMIT;`);
  assert.equal(contentFingerprint(db,false),before,'Rejected old-child reuse must roll back the new snapshot');
  fails(`BEGIN; INSERT INTO startrack.output_rows(output) VALUES('Synthetic late added child');
    INSERT INTO startrack.project_create_output_rows(project_create_id,output_rows_id)
      SELECT ${newId},id FROM startrack.output_rows WHERE output='Synthetic late added child'; COMMIT;`);
  assert.equal(contentFingerprint(db,false),before,'Rejected late link must roll back its child');
  passed(`${db}: immutable parent/child/links, protected transient ledger, savepoints and rollback verified`);
}

async function verifyVersionedApi(client,db) {
  const fixture = JSON.parse(readFileSync(path.join(root,'scripts/fixtures/project-with-children.json'),'utf8'));
  // Distinct rows may have equal content; collections must not collapse them.
  fixture.groupMemberRows.push({...fixture.groupMemberRows[0]});
  fixture.projectName = `Synthetic versioned ${randomUUID()}`;
  const send = async (route,options,status) => {
    const response = await client.rawRequest(route,options);
    assert.equal(response.status,status,route);
    const text = await response.text(); return text ? JSON.parse(text) : null;
  };
  const first = await send('/api/projects',{method:'POST',body:JSON.stringify(fixture)},201);
  assert.equal(first.versionNumber,1);
  assert.equal(first.groupMemberRows.length,2,'Equal-content child rows must both persist');
  const sameName = await send('/api/projects',{method:'POST',body:JSON.stringify(fixture)},201);
  assert.notEqual(first.projectId,sameName.projectId);
  await send('/projectCreate/allDataHistroy/'+encodeURIComponent(fixture.projectName),{},409);
  const originalHistory = await send(`/api/projects/${first.projectId}/versions`,{},200);
  const renamed = {...fixture,projectName:fixture.projectName+' renamed',expectedVersion:1};
  const racing = await Promise.all([client.rawRequest(`/api/projects/${first.projectId}/versions`,
    {method:'POST',body:JSON.stringify(renamed)}),client.rawRequest(`/api/projects/${first.projectId}/versions`,
    {method:'POST',body:JSON.stringify(renamed)})]);
  assert.deepEqual(racing.map((r) => r.status).sort(),[201,409]);
  const history = await send(`/api/projects/${first.projectId}/versions`,{},200);
  assert.deepEqual(history.map((v) => v.versionNumber),[2,1]);
  assert.deepEqual(history[1],originalHistory[0],'Rename/concurrent append must preserve old snapshot');
  const latest = history[0];
  await send(`/projectCreate/permUpdate/${latest.id}/ACCEPTED`,{method:'PUT'},200);
  const afterStatus = await send(`/api/projects/${first.projectId}/versions`,{},200);
  assert.deepEqual(afterStatus.map((v) => v.versionNumber),[3,2,1]);
  for (const version of afterStatus) {
    assert.equal(version.groupMemberRows.length,2,'Every version response must retain equal-content child rows');
  }
  assert.deepEqual(afterStatus.slice(1),history,'Status change must not mutate previous snapshots');
  const childTables = ['collaboration_rows','external_advisors_rows','funding_overview_rows','funding_rows',
    'group_member_rows','otr_rows','output_rows','ppi_rows','sub_contractors_rows'];
  for (const child of childTables) {
    assert.equal(value(db,`SELECT count(DISTINCT l.${child}_id) FROM startrack.project_create_${child} l
      JOIN startrack.project_create p ON p.id=l.project_create_id WHERE p.project_id='${first.projectId}';`),
    child==='group_member_rows' ? '6' : '3',
    'Every appended version must own fresh child snapshots');
  }
  await send(`/api/projects/${first.projectId}`,{method:'DELETE'},204);
  assert.deepEqual(await send(`/api/projects/${first.projectId}/versions`,{},200),
    afterStatus.map((version) => ({...version,archived:true})),
    'Archival may change root metadata but must preserve every saved snapshot');
  assert.equal((await send('/api/projects',{},200)).some((p) => p.projectId===first.projectId),false);
  await send(`/api/projects/${first.projectId}/versions`,{method:'POST',
    body:JSON.stringify({...renamed,expectedVersion:3})},409);
  assert.equal(value(db,'SELECT count(*) FROM startrack.snapshot_creation_ledger;'),'0');
  passed('API identity, rename, concurrent append conflict, status snapshots, cloned children and archival preserve history');
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
  await verifyLateProjectRollback(initial);
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
  const failed = alteredMigration('starTrack', 'rollback-test', 'V9000__deliberate_failure.sql',
    'CREATE TABLE startrack.failed_migration_probe (id integer);\nSELECT 1/0;\n', 'migrate');
  assert.notEqual(failed.status, 0);
  assert.match(failed.stdout + failed.stderr, /division by zero/i);
  assert.equal(value('starTrack', "SELECT to_regclass('startrack.failed_migration_probe') IS NULL;"), 't');
  assert.equal(value('starTrack', "SELECT count(*) FROM startrack.flyway_schema_history WHERE version='9000';"), '0');
  flyway('starTrack', ['validate']);
  assert.notEqual(flyway('starTrack', ['clean'], { allowFailure: true }).status, 0);
  passed('checksum tampering fails, transactional migration failure rolls back, and clean is disabled');

  // V1 is immutable. A newer ORM may generate different DDL even when it can
  // safely use V1, so verify validation and real writes without schema drift.
  createDatabase('phase3_generated');
  flyway('phase3_generated', ['migrate']);
  const beforeRuntime = schema('phase3_generated');
  requireMatchingSchema(beforeRuntime, reference);
  const generated = await temporaryBackend('phase3_generated', 'schema-validator');
  await projectRoundTrip(generated.url);
  removeContainer(generated.name);
  requireMatchingSchema(schema('phase3_generated'), beforeRuntime);
  passed('runtime validates migration baseline and writes nested records without schema drift');

  // Keep V1 adoption evidence on a genuine V1 fixture, not a latest-schema dump.
  createDatabase('phase3_legacy');
  flyway('phase3_legacy', ['-target=1','migrate']);
  const v1Reference = schema('phase3_legacy');
  sql('phase3_legacy', `DROP TABLE startrack.flyway_schema_history;
    INSERT INTO startrack."user"(email,enabled,"delete") VALUES('legacy-owner@startrack.test',true,false);
    INSERT INTO startrack.project_create(project_name,created_date,apply_user,modify_user) VALUES
      ('Synthetic same legacy name','2026-01-01','legacy-owner@startrack.test','legacy-owner@startrack.test'),
      ('Synthetic same legacy name','2026-01-02','legacy-owner@startrack.test',NULL),
      ('Synthetic same legacy name','2026-01-02',NULL,NULL);
    DO $$ DECLARE child text; child_id bigint; BEGIN
      FOREACH child IN ARRAY ARRAY['collaboration_rows','external_advisors_rows','funding_overview_rows',
        'funding_rows','group_member_rows','otr_rows','output_rows','ppi_rows','sub_contractors_rows'] LOOP
        EXECUTE format('INSERT INTO startrack.%I DEFAULT VALUES RETURNING id',child) INTO child_id;
        EXECUTE format('INSERT INTO startrack.%I(project_create_id,%I) SELECT id,$1 FROM startrack.project_create',
          'project_create_'||child,child||'_id') USING child_id;
      END LOOP;
    END; $$;`);
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
  assert.throws(() => requireMatchingSchema(schema('phase3_drift'), v1Reference), /adoption refused/);
  assert.equal(value('phase3_drift', "SELECT to_regclass('startrack.flyway_schema_history') IS NULL;"), 't');
  passed('unexpected schema drift is refused before baseline metadata is written');

  for (const db of ['phase3_legacy', 'phase3_restored']) {
    await adoptVerifiedBaseline({ schema: schema(db), reference: v1Reference,
      restoredSchema: schema('phase3_restored'), restoredDataMatches: contentFingerprint(db) === before,
      hasHistory: value(db, "SELECT to_regclass('startrack.flyway_schema_history') IS NOT NULL;") === 't',
      baseline: () => flyway(db, ['-baselineVersion=1', 'baseline']),
      validate: () => { flyway(db, ['-target=1','migrate']); flyway(db, ['-target=1','validate']); } });
    assert.equal(contentFingerprint(db), before);
  }
  passed('explicit V1 adoption preserves populated data and ID counters');

  await verifyReviewedUpgrade('phase3_legacy');
  await verifyReviewedUpgrade('phase3_restored');

  const recovered = await temporaryBackend('phase3_restored', 'recovered-app');
  const restoredProject = await projectRoundTrip(recovered.url);
  const legacyProjects = (await restoredProject.request('/projectCreate/allData'))
    .filter((row) => row.projectName === 'Synthetic same legacy name');
  assert.equal(legacyProjects.length, 3, 'Every migrated legacy version remains readable');
  for (const legacy of legacyProjects) {
    assert.equal(legacy.valueOverview, null, 'Unknown legacy funding must not become zero');
    for (const [route, field] of [['allFundingOverview', 'valueOverview'],
      ['allFunding', 'value'], ['allOutput', 'outputQuantity']]) {
      const rows = await restoredProject.request(`/projectCreate/${route}/${legacy.id}`);
      assert.equal(rows.length, 1);
      assert.equal(rows[0][field], null, `${route} preserves legacy unknown numeric values`);
    }
  }
  passed('restored legacy listing and numeric child details preserve NULL rather than inventing zero');
  const additional = JSON.parse(readFileSync(path.join(root, 'scripts/fixtures/project-with-children.json'), 'utf8'));
  additional.projectName += ' after recovery';
  await restoredProject.request('/projectCreate/addToProjectCreate/admin%40startrack.test', {
    method: 'POST', body: JSON.stringify(additional) });
  const newProject = (await restoredProject.request('/projectCreate/allData')).find((row) => row.projectName === additional.projectName);
  assert.ok(newProject.id > restoredProject.id, 'New records must advance restored ID counters');
  // Legacy timestamp/deletion quirks remain characterized in the immutable V1
  // native suite; the final application must now obey approved version semantics.
  await verifyVersionedApi(restoredProject,'phase3_restored');
  removeContainer(recovered.name);
  passed('restored application validates schema, logs in, reads nested records and inserts new IDs');

  createDatabase('phase4_final_restore');
  const finalBackup = dump('phase3_restored');
  const finalFingerprint = contentFingerprint('phase3_restored');
  restore('phase4_final_restore',finalBackup);
  assert.equal(contentFingerprint('phase4_final_restore'),finalFingerprint);
  requireMatchingSchema(schema('phase4_final_restore'),schema('phase3_restored'));
  const finalRecovered = await temporaryBackend('phase4_final_restore','final-recovered-app');
  const finalRecoveredClient = await projectRoundTrip(finalRecovered.url,restoredProject);
  await verifyVersionedApi(finalRecoveredClient,'phase4_final_restore');
  removeContainer(finalRecovered.name);
  passed('final versioned-schema backup restores all data, counters, constraints and application reads');

  completed = true;
} finally {
  cleaning = true;
  let failed = false;
  for (const name of transient) {
    if (!completed && /-(recovered-app|final-recovered-app|schema-validator)$/.test(name)) {
      try {
        const diagnostic = run(['logs', '--tail', '150', name], { allowFailure: true });
        // Emit only structured failure identifiers, never messages, SQL or data.
        const safeErrors = `${diagnostic.stdout}\n${diagnostic.stderr}`.match(
          /API failure requestId=[0-9a-f-]+ status=\d+ exceptionClass=[\w.$]+|SQL Error: \d+, SQLState: [\w]+/g) ?? [];
        for (const error of safeErrors) console.error(`Disposable backend: ${error}`);
      } catch { /* Diagnostics must not prevent cleanup. */ }
    }
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
