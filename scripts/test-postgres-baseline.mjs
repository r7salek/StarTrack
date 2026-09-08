#!/usr/bin/env node
// Offline native PostgreSQL characterization. Never connects to the developer stack.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const container = `startrack_pg_contract_${randomBytes(8).toString('hex')}`;
const source = 'starTrack';
const restored = 'contract_restore';
const children = ['collaboration_rows', 'external_advisors_rows', 'funding_overview_rows',
  'funding_rows', 'group_member_rows', 'otr_rows', 'output_rows', 'ppi_rows', 'sub_contractors_rows'];
const baseline = fileURLToPath(new URL('../database/migrations/V1__legacy_baseline.sql', import.meta.url));
let started = false;
let interrupted = false;
let passed = 0;
let stage = 'reading baseline';

function command(args, input = undefined, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const child = execFile('docker', args, { timeout, maxBuffer: 16 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        // Only keep diagnostic details internally; callers print named synthetic-safe failures.
        error.diagnostic = stderr;
        reject(error);
      } else resolve(stdout.trim());
    });
    child.stdin.on('error', () => {});
    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
}

function sql(query, database = source) {
  return command(['exec', '-i', container, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', database], query);
}

async function check(name, action) {
  if (interrupted) throw new Error('Interrupted before next check');
  try {
    await action();
    passed++;
    console.log(`PASS ${passed}: ${name}`);
  } catch {
    throw new Error(`Failed check: ${name}`);
  }
}

async function rejectsSql(query, state) {
  await assert.rejects(sql(`\\set VERBOSITY verbose\n${query}`), error =>
    typeof error.diagnostic === 'string' && error.diagnostic.includes(state));
}

function identifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

async function snapshot(database) {
  const tables = (await sql("SELECT tablename FROM pg_tables WHERE schemaname='startrack' ORDER BY tablename", database)).split('\n');
  const sequences = (await sql("SELECT schemaname || '.' || sequencename FROM pg_sequences WHERE schemaname IN ('startrack','public') ORDER BY 1", database)).split('\n');
  const dataQueries = tables.map(table => `SELECT json_build_object('table', '${table}', 'rows',
    (SELECT coalesce(jsonb_agg(row_data ORDER BY row_data::text), '[]'::jsonb)
     FROM (SELECT to_jsonb(t) row_data FROM startrack.${identifier(table)} t) s))::text`);
  const sequenceQueries = sequences.map(sequence => {
    const qualified = sequence.split('.').map(identifier).join('.');
    return `SELECT json_build_object('sequence','${sequence}','last_value',last_value,'is_called',is_called)::text FROM ${qualified}`;
  });
  return {
    data: await sql(dataQueries.join(' UNION ALL '), database),
    sequences: await sql(sequenceQueries.join(' UNION ALL '), database),
    grants: await sql(`SELECT has_schema_privilege('contract_reader','startrack','USAGE'),
      has_table_privilege('contract_reader','startrack.project_create','SELECT'),
      has_sequence_privilege('contract_reader','startrack.project_create_id_seq','USAGE'),
      has_table_privilege('contract_reader','startrack.project_create','INSERT')`, database),
    constraints: await sql(`SELECT conrelid::regclass::text || ':' || conname || ':' || pg_get_constraintdef(oid)
      FROM pg_constraint WHERE connamespace='startrack'::regnamespace ORDER BY 1`, database)
  };
}

const signalHandler = () => { interrupted = true; };
process.on('SIGINT', signalHandler);
process.on('SIGTERM', signalHandler);

try {
  const migration = await readFile(baseline, 'utf8');
  // Local Unix socket only. No host port, bind mount, reusable volume or external network.
  started = true;
  stage = 'starting disposable container';
  await command(['run', '--detach', '--pull=never', '--name', container, '--network', 'none',
    '--tmpfs', '/var/lib/postgresql/data:rw', '--env', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:15-alpine']);
  let ready = false;
  stage = 'waiting for final PostgreSQL server';
  for (let attempt = 0; attempt < 60 && !interrupted; attempt++) {
    try {
      // The image initializes with a temporary Unix-socket-only server; wait for the final server.
      await command(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres'], undefined, 5000);
      ready = true;
      break;
    } catch { await new Promise(resolve => setTimeout(resolve, 500)); }
  }
  assert.ok(ready, 'Disposable PostgreSQL readiness deadline');
  stage = 'creating disposable database';
  await command(['exec', container, 'createdb', '-U', 'postgres', source]);
  stage = 'creating application schema';
  await sql('CREATE SCHEMA startrack;');
  stage = 'applying baseline SQL';
  await sql(migration);

  await check('baseline has exactly 22 application tables and 22 sequences', async () => {
    assert.equal(await sql("SELECT count(*) FROM pg_tables WHERE schemaname='startrack'"), '22');
    assert.equal(await sql("SELECT count(*) FROM pg_sequences WHERE schemaname IN ('startrack','public')"), '22');
  });
  await check('email uniqueness is case-sensitive and permits multiple nulls', async () => {
    await sql(`INSERT INTO startrack."user"(email,enabled,"delete") VALUES
      ('owner@startrack.test',true,false), ('OWNER@startrack.test',true,false), (NULL,false,false), (NULL,false,false);`);
    assert.equal(await sql('SELECT count(*) FROM startrack."user"'), '4');
    await rejectsSql(`INSERT INTO startrack."user"(email) VALUES ('owner@startrack.test');`, '23505');
    assert.equal(await sql('SELECT count(*) FROM startrack."user" WHERE email IS NULL'), '2');
  });
  await check('project creator and modifier email FKs restrict update and deletion', async () => {
    await sql(`INSERT INTO startrack.project_create(project_name,apply_user,modify_user)
      VALUES ('Synthetic project A','owner@startrack.test','owner@startrack.test'),
      ('Synthetic project B',NULL,NULL);`);
    await rejectsSql(`UPDATE startrack."user" SET email='changed@startrack.test' WHERE email='owner@startrack.test';`, '23503');
    await rejectsSql(`DELETE FROM startrack."user" WHERE email='owner@startrack.test';`, '23503');
    for (const column of ['apply_user', 'modify_user']) {
      await rejectsSql(`INSERT INTO startrack.project_create(${column}) VALUES ('absent@startrack.test');`, '23503');
    }
  });
  const projects = (await sql('SELECT id FROM startrack.project_create ORDER BY id')).split('\n').map(Number);
  const [projectA, projectB] = projects;
  for (const child of children) {
    await check(`${child}: two-column key, valid links and shared child without cascade`, async () => {
      const join = `project_create_${child}`;
      const foreign = `${child}_id`;
      assert.equal(await sql(`SELECT count(*) FROM information_schema.columns WHERE table_schema='startrack' AND table_name='${join}'`), '2');
      assert.equal(await sql(`SELECT cardinality(conkey) FROM pg_constraint WHERE conrelid='startrack.${join}'::regclass AND contype='p'`), '2');
      assert.equal(await sql(`SELECT count(*) FROM pg_constraint WHERE conrelid='startrack.${join}'::regclass AND contype='f' AND confdeltype='a' AND confupdtype='a'`), '2');
      const childId = Number(await sql(`INSERT INTO startrack.${child} DEFAULT VALUES RETURNING id`));
      await sql(`INSERT INTO startrack.${join}(project_create_id,${foreign}) VALUES (${projectA},${childId}),(${projectB},${childId});`);
      await rejectsSql(`INSERT INTO startrack.${join}(project_create_id,${foreign}) VALUES (${projectA},${childId});`, '23505');
      await rejectsSql(`INSERT INTO startrack.${join}(project_create_id,${foreign}) VALUES (${projectA},2147483647);`, '23503');
      await rejectsSql(`INSERT INTO startrack.${join}(project_create_id,${foreign}) VALUES (9223372036854775807,${childId});`, '23503');
      await rejectsSql(`DELETE FROM startrack.${child} WHERE id=${childId};`, '23503');
      await rejectsSql(`DELETE FROM startrack.project_create WHERE id=${projectA};`, '23503');
      await sql(`DELETE FROM startrack.${join} WHERE project_create_id=${projectB};`);
      assert.equal(await sql(`SELECT count(*) FROM startrack.${child} WHERE id=${childId}`), '1');
      assert.equal(await sql(`SELECT count(*) FROM startrack.${join} WHERE project_create_id=${projectA}`), '1');
      // Restore the second link so recovery exercises shared children, not just single ownership.
      await sql(`INSERT INTO startrack.${join}(project_create_id,${foreign}) VALUES (${projectB},${childId});`);
    });
  }
  await check('user-role links enforce distinct pairs and both foreign keys', async () => {
    await sql(`INSERT INTO startrack.roles(name) VALUES ('ROLE_USER');
      INSERT INTO startrack.user_roles(user_id,role_id)
      SELECT u.id,r.id FROM startrack."user" u CROSS JOIN startrack.roles r WHERE u.email='owner@startrack.test';`);
    await rejectsSql(`INSERT INTO startrack.user_roles SELECT user_id,role_id FROM startrack.user_roles;`, '23505');
    await rejectsSql(`INSERT INTO startrack.user_roles(user_id,role_id)
      SELECT 9223372036854775807,id FROM startrack.roles;`, '23503');
    await rejectsSql(`INSERT INTO startrack.user_roles(user_id,role_id)
      SELECT id,9223372036854775807 FROM startrack."user" WHERE email='OWNER@startrack.test';`, '23503');
    await rejectsSql(`DELETE FROM startrack.roles WHERE name='ROLE_USER';`, '23503');
  });
  await check('failed transaction rolls back records while sequences may have gaps', async () => {
    const count = await sql('SELECT count(*) FROM startrack.project_create');
    const sequenceBefore = Number(await sql('SELECT last_value FROM startrack.project_create_id_seq'));
    await rejectsSql(`BEGIN;
      INSERT INTO startrack.project_create(project_name) VALUES ('Synthetic rolled back row');
      INSERT INTO startrack.project_create(apply_user) VALUES ('absent@startrack.test'); COMMIT;`, '23503');
    assert.equal(await sql('SELECT count(*) FROM startrack.project_create'), count);
    assert.equal(await sql("SELECT count(*) FROM startrack.project_create WHERE project_name='Synthetic rolled back row'"), '0');
    assert.ok(Number(await sql('SELECT last_value FROM startrack.project_create_id_seq')) > sequenceBefore);
  });
  await check('all 22 sequences progress and preserve explicit called state', async () => {
    const sequences = (await sql("SELECT schemaname || '.' || sequencename FROM pg_sequences WHERE schemaname IN ('startrack','public') ORDER BY 1")).split('\n');
    for (const [index, sequence] of sequences.entries()) {
      const seed = 1000 + index * 10;
      assert.equal(await sql(`SELECT setval('${sequence}',${seed},false); SELECT nextval('${sequence}'); SELECT nextval('${sequence}');`), `${seed}\n${seed}\n${seed + 1}`);
    }
    // Retain at least one never-called state to prove the restore preserves both variants.
    await sql("SELECT setval('public.seq_name_generated_in_db',5000,false);");
  });
  let before;
  await check('custom backup restores every row, constraint, grant and sequence state', async () => {
    await sql(`CREATE ROLE contract_reader NOLOGIN;
      GRANT USAGE ON SCHEMA startrack TO contract_reader;
      GRANT SELECT ON startrack.project_create TO contract_reader;
      GRANT USAGE ON SEQUENCE startrack.project_create_id_seq TO contract_reader;`);
    before = await snapshot(source);
    assert.equal(before.grants, 't|t|t|f');
    await command(['exec', container, 'pg_dump', '-U', 'postgres', '-Fc', '--file=/tmp/contract.dump', source]);
    await command(['exec', container, 'createdb', '-U', 'postgres', restored]);
    // Roles are cluster-global and already exist here; pg_dump preserves grants, not role creation.
    await command(['exec', container, 'pg_restore', '-U', 'postgres', '--exit-on-error', '--single-transaction',
      '--dbname', restored, '/tmp/contract.dump']);
    assert.deepEqual(await snapshot(restored), before);
  });
  await check('restored IDs continue beyond stored records and reader remains read-only', async () => {
    const maxId = Number(await sql('SELECT max(id) FROM startrack.project_create', restored));
    const nextId = Number(await sql("INSERT INTO startrack.project_create(project_name) VALUES ('Synthetic post-restore row') RETURNING id", restored));
    assert.ok(nextId > maxId);
    assert.equal(await sql('SET ROLE contract_reader; SELECT count(*) > 0 FROM startrack.project_create;', restored), 't');
    await assert.rejects(sql("\\set VERBOSITY verbose\nSET ROLE contract_reader; INSERT INTO startrack.project_create DEFAULT VALUES;", restored),
      error => typeof error.diagnostic === 'string' && error.diagnostic.includes('42501'));
    assert.equal(await sql("SELECT nextval('public.seq_name_generated_in_db')", restored), '5000');
  });
  if (interrupted) throw new Error('Interrupted');
} catch (error) {
  console.error(error.message?.startsWith('Failed check:') ? error.message : `PostgreSQL characterization failed during ${stage}; no private diagnostics printed.`);
  process.exitCode = 1;
} finally {
  if (started) {
    try {
      await command(['rm', '--force', '--volumes', container]);
      console.log('Disposable PostgreSQL container and temporary storage removed.');
    } catch {
      console.error(`Cleanup failed for disposable container ${container}; manual inspection required.`);
      process.exitCode = 1;
    }
  }
  process.removeListener('SIGINT', signalHandler);
  process.removeListener('SIGTERM', signalHandler);
  if (interrupted) process.exitCode = 1;
  if (!process.exitCode) console.log(`PostgreSQL baseline characterization passed: ${passed} checks. Native SQL only; JPA/API semantics are verified separately.`);
}
