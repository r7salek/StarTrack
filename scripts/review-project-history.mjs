import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireVerificationProject } from './database-schema.mjs';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sqlLiteral = (text) => "'" + text.replaceAll("'", "''") + "'";

export function validateManifest(manifest, sourceIds, { requireApproval = true } = {}) {
  assert.equal(manifest.formatVersion, 1, 'Unsupported review manifest');
  if (requireApproval) {
    assert.equal(manifest.approved, true, 'Explicit reviewed approval is required');
    assert.ok(typeof manifest.reviewer === 'string' && manifest.reviewer.trim(), 'Named reviewer is required');
    assert.ok(typeof manifest.approvalReference === 'string' && manifest.approvalReference.trim(), 'Approval reference is required');
    assert.ok(typeof manifest.approvedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(manifest.approvedAt)
      && Number.isFinite(Date.parse(manifest.approvedAt)), 'Explicit ISO approval timestamp is required');
  }
  assert.match(manifest.sourceFingerprint ?? '', /^[a-f0-9]{64}$/, 'Invalid source fingerprint');
  assert.ok(Array.isArray(manifest.groups), 'Explicit project groups are required');
  const roots = new Set();
  const versions = [];
  for (const group of manifest.groups) {
    assert.match(group.projectId ?? '', UUID, 'Permanent project ID must be a UUID');
    assert.ok(!roots.has(group.projectId.toLowerCase()), 'Duplicate project ID');
    roots.add(group.projectId.toLowerCase());
    assert.ok(Array.isArray(group.versions) && group.versions.length > 0, 'Empty project group');
    for (const id of group.versions) {
      assert.ok(typeof id === 'string' && /^[1-9][0-9]*$/.test(id), 'Version IDs must be positive decimal strings');
      versions.push(id);
    }
  }
  assert.equal(new Set(versions).size, versions.length, 'Duplicate legacy version ID');
  assert.deepEqual([...versions].sort(), [...sourceIds].sort(), 'Every source version must be mapped exactly once');
  return manifest;
}

export function prepareManifest(snapshot, target) {
  return { formatVersion: 1, approved: false, reviewer: '', approvalReference: '', approvedAt: '', ...target,
    preparedAt: new Date().toISOString(), sourceFingerprint: snapshot.fingerprint,
    // Names and timestamps provide review context only; never infer a grouping.
    sourceVersions: snapshot.versions,
    groups: snapshot.versions.map((row) => ({ projectId: randomUUID(), versions: [row.id] })) };
}

// Use one server-side canonical JSONB snapshot algorithm for prepare and apply.
// Data covers every application table, including historical child/join/account
// rows and review history. Schema covers both application namespaces, columns,
// defaults, constraints, indexes, triggers, routines, sequences and privileges.
// Sequence *positions* are not mapping input: nextval is nontransactional and
// IDs are taken from existing rows. Sequence definitions remain fingerprinted.
export const snapshotFunctionSql = `
CREATE FUNCTION pg_temp.history_snapshot() RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE source_table record; data jsonb := '{}'::jsonb; rows jsonb; definitions jsonb; versions jsonb;
BEGIN
  FOR source_table IN SELECT tablename FROM pg_tables WHERE schemaname='startrack'
      AND tablename <> 'flyway_schema_history' ORDER BY tablename LOOP
    EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),''[]''::jsonb) FROM startrack.%I t', source_table.tablename)
      INTO rows;
    data := data || jsonb_build_object(source_table.tablename, rows);
  END LOOP;
  SELECT jsonb_build_object(
    'namespaces', (SELECT jsonb_agg(jsonb_build_array(n.nspname,pg_get_userbyid(n.nspowner),n.nspacl) ORDER BY n.nspname)
      FROM pg_namespace n WHERE n.nspname IN ('startrack','public')),
    'relations', (SELECT jsonb_agg(jsonb_build_array(n.nspname,c.relname,c.relkind,pg_get_userbyid(c.relowner),
      c.relpersistence,c.relrowsecurity,c.relforcerowsecurity,c.reloptions,c.relacl) ORDER BY n.nspname,c.relname)
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('startrack','public')),
    'columns', (SELECT jsonb_agg(jsonb_build_array(n.nspname,c.relname,a.attnum,a.attname,
      format_type(a.atttypid,a.atttypmod),a.attnotnull,a.attidentity,a.attgenerated,a.attcollation::regcollation::text,
      pg_get_expr(d.adbin,d.adrelid),a.attacl) ORDER BY n.nspname,c.relname,a.attnum)
      FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace
      LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
      WHERE n.nspname IN ('startrack','public') AND a.attnum>0 AND NOT a.attisdropped),
    'constraints', (SELECT jsonb_agg(jsonb_build_array(n.nspname,c.conrelid::regclass::text,c.conname,
      pg_get_constraintdef(c.oid,true),c.convalidated) ORDER BY n.nspname,c.conrelid::regclass::text,c.conname)
      FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname IN ('startrack','public')),
    'indexes', (SELECT jsonb_agg(to_jsonb(i) ORDER BY schemaname,tablename,indexname) FROM pg_indexes i
      WHERE schemaname IN ('startrack','public')),
    'triggers', (SELECT jsonb_agg(jsonb_build_array(n.nspname,c.relname,t.tgname,t.tgenabled,pg_get_triggerdef(t.oid,true))
      ORDER BY n.nspname,c.relname,t.tgname) FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
      JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname IN ('startrack','public') AND NOT t.tgisinternal),
    'routines', (SELECT jsonb_agg(jsonb_build_array(n.nspname,p.proname,pg_get_function_identity_arguments(p.oid),
      pg_get_functiondef(p.oid),pg_get_userbyid(p.proowner),p.proacl) ORDER BY n.nspname,p.proname,pg_get_function_identity_arguments(p.oid))
      FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname IN ('startrack','public') AND p.prokind IN ('f','p')),
    'sequences', (SELECT jsonb_agg(to_jsonb(s)-'last_value' ORDER BY schemaname,sequencename)
      FROM pg_sequences s WHERE schemaname IN ('startrack','public')),
    'policies', (SELECT jsonb_agg(to_jsonb(p) ORDER BY schemaname,tablename,policyname)
      FROM pg_policies p WHERE schemaname IN ('startrack','public')),
    'views', (SELECT jsonb_agg(to_jsonb(v) ORDER BY schemaname,viewname)
      FROM pg_views v WHERE schemaname IN ('startrack','public')),
    'materializedViews', (SELECT jsonb_agg(to_jsonb(v)-'ispopulated' ORDER BY schemaname,matviewname)
      FROM pg_matviews v WHERE schemaname IN ('startrack','public')),
    'rules', (SELECT jsonb_agg(to_jsonb(r) ORDER BY schemaname,tablename,rulename)
      FROM pg_rules r WHERE schemaname IN ('startrack','public')),
    'types', (SELECT jsonb_agg(jsonb_build_array(n.nspname,t.typname,t.typtype,
      pg_get_userbyid(t.typowner),t.typnotnull,t.typdefault,format_type(t.typbasetype,t.typtypmod),t.typacl,
      (SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder) FROM pg_enum e WHERE e.enumtypid=t.oid))
      ORDER BY n.nspname,t.typname) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
      WHERE n.nspname IN ('startrack','public')),
    'defaultPrivileges', (SELECT jsonb_agg(jsonb_build_array(n.nspname,pg_get_userbyid(d.defaclrole),
      d.defaclobjtype,d.defaclacl) ORDER BY n.nspname,d.defaclrole,d.defaclobjtype)
      FROM pg_default_acl d JOIN pg_namespace n ON n.oid=d.defaclnamespace WHERE n.nspname IN ('startrack','public'))
  ) INTO definitions;
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id::text,'name',project_name,
    'createdAt',created_date,'creatorId',created_by::text) ORDER BY id),'[]'::jsonb)
    INTO versions FROM startrack.project_create;
  RETURN jsonb_build_object('fingerprint',encode(sha256(convert_to(
    jsonb_build_object('schema',definitions,'data',data)::text,'UTF8')),'hex'),'versions',versions);
END;
$$;
`;

export const lockSourceSql = `
DO $$ DECLARE t record; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='startrack' ORDER BY tablename LOOP
    EXECUTE format('LOCK TABLE startrack.%I IN ACCESS EXCLUSIVE MODE',t.tablename);
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM startrack.flyway_schema_history WHERE version='2' AND success)
      OR EXISTS (SELECT 1 FROM startrack.flyway_schema_history WHERE version='3' AND success) THEN
    RAISE EXCEPTION 'Review tooling requires expanded V2 schema before V3 finalization';
  END IF;
  IF EXISTS (SELECT 1 FROM startrack.project_create WHERE project_id IS NOT NULL OR version_number IS NOT NULL)
      OR EXISTS (SELECT 1 FROM startrack.project) THEN
    RAISE EXCEPTION 'Review requires an entirely unmapped legacy dataset';
  END IF;
END; $$;
`;

export function applySql(manifest) {
  // Structural validation is also repeated against source IDs under SQL locks.
  const ids = manifest.groups.flatMap((group) => group.versions);
  validateManifest(manifest, ids);
  const serialized = JSON.stringify(manifest);
  // Reviewed context can contain arbitrary names, including dollar-quote text.
  let delimiter;
  do { delimiter = `$history_${randomUUID().replaceAll('-','')}$`; } while (serialized.includes(delimiter));
  return `BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='60s';
SET LOCAL standard_conforming_strings=on;
${lockSourceSql}
${snapshotFunctionSql}
DO ${delimiter}
DECLARE m jsonb := ${sqlLiteral(serialized)}::jsonb; mapped_group jsonb; version_id text; version_ordinal integer;
BEGIN
  IF pg_temp.history_snapshot()->>'fingerprint' <> m->>'sourceFingerprint' THEN
    RAISE EXCEPTION 'Source data or schema changed after review; apply refused';
  END IF;
  IF (SELECT count(*) FROM startrack.project_create) <>
      (SELECT count(*) FROM jsonb_array_elements(m->'groups') g CROSS JOIN LATERAL jsonb_array_elements_text(g->'versions') v)
      OR EXISTS (SELECT 1 FROM startrack.project_create p WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(m->'groups') g CROSS JOIN LATERAL jsonb_array_elements_text(g->'versions') v
        WHERE v.value=p.id::text)) THEN
    RAISE EXCEPTION 'Reviewed mapping must include every source version exactly once';
  END IF;
  FOR mapped_group IN SELECT value FROM jsonb_array_elements(m->'groups') LOOP
    INSERT INTO startrack.project(id,created_by,created_at)
      SELECT (mapped_group->>'projectId')::uuid,
        (SELECT created_by FROM startrack.project_create WHERE id=(mapped_group->'versions'->>0)::bigint),
        coalesce(min(created_date),CURRENT_TIMESTAMP)
      FROM startrack.project_create WHERE id IN (SELECT value::bigint FROM jsonb_array_elements_text(mapped_group->'versions'));
    version_ordinal := 0;
    FOR version_id IN SELECT value FROM jsonb_array_elements_text(mapped_group->'versions') LOOP
      version_ordinal := version_ordinal+1;
      UPDATE startrack.project_create SET project_id=(mapped_group->>'projectId')::uuid,version_number=version_ordinal
        WHERE id=version_id::bigint;
    END LOOP;
  END LOOP;
  INSERT INTO startrack.project_history_review(source_fingerprint,approved_manifest)
    VALUES(m->>'sourceFingerprint',m);
END; ${delimiter};
COMMIT;`;
}

function command(args, input) {
  const result = spawnSync('docker', args, { input, encoding: 'utf8', timeout: 90_000,
    maxBuffer: 32 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error('Synthetic history review command failed; no database output is printed.');
  return result.stdout.trim();
}

export function main(args) {
  const [action, project, envFile, database, manifestFile] = args;
  assert.ok(args.length === 5 && ['prepare','apply'].includes(action),
    'Usage: node scripts/review-project-history.mjs prepare|apply PROJECT ENV_FILE DATABASE MANIFEST');
  requireVerificationProject(project);
  assert.ok(envFile && manifestFile);
  assert.match(database, /^(starTrack|phase[34]_[a-z0-9_]+)$/);
  const root = fileURLToPath(new URL('../', import.meta.url));
  const id = command(['compose','--project-directory',root,'--env-file',path.resolve(envFile),
    '-f',path.join(root,'compose.yaml'),'-p',project,'ps','-q','db']);
  assert.ok(id);
  const labels = JSON.parse(command(['inspect','--format','{{json .Config.Labels}}',id]));
  assert.equal(labels['com.docker.compose.project'], project);
  assert.equal(labels['com.docker.compose.service'], 'db');
  const psql = ['exec','-i',id,'psql','-X','-qAt','-U','postgres','-d',database,'-v','ON_ERROR_STOP=1'];
  if (action === 'prepare') {
    const snapshot = JSON.parse(command(psql, `BEGIN; SET LOCAL lock_timeout='10s';
      ${lockSourceSql}\n${snapshotFunctionSql}\nSELECT pg_temp.history_snapshot(); COMMIT;`));
    const manifest = prepareManifest(snapshot, { project, database });
    writeFileSync(manifestFile, JSON.stringify(manifest,null,2)+'\n', { mode: 0o600, flag: 'wx' });
    console.log('Unapproved synthetic mapping prepared; review explicit grouping and version order before approval.');
  } else {
    const manifest = JSON.parse(readFileSync(manifestFile,'utf8'));
    assert.equal(manifest.project, project, 'Review belongs to a different isolated project');
    assert.equal(manifest.database, database, 'Review belongs to a different database');
    command(psql, applySql(manifest));
    console.log('Approved synthetic mapping applied atomically; V3 finalization is a separate step.');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) {
    // Assertions contain no SQL result rows or credentials; avoid dumping objects.
    console.error(error instanceof assert.AssertionError ? error.message.split('\n')[0] : error.message);
    process.exitCode = 1;
  }
}
