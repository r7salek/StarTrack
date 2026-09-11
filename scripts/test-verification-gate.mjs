import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync,
  readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

// Exercise the real shell gate, but never invoke Docker or contact any service.
const gate = fileURLToPath(new URL('./test-local.sh', import.meta.url));
const fakeTool = `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const tool = path.basename(process.argv[1]);
const args = process.argv.slice(2);
const record = { tool, args };
const value = (flag) => args[args.indexOf(flag) + 1];
if (tool === 'rsync') {
  const destination = args.at(-1);
  fs.mkdirSync(destination, { recursive: true });
  for (const name of ['Dockerfile', 'Dockerfile.dev', 'pom.xml', 'package.json']) {
    fs.writeFileSync(path.join(destination, name), 'synthetic fixture');
  }
}
if (tool === 'docker' && args[0] === 'compose') {
  record.project = value('-p');
  record.envFile = value('--env-file');
  const contents = fs.readFileSync(record.envFile, 'utf8');
  record.privateEnv = !contents.includes('developer-secret') &&
    /STARTRACK_BOOTSTRAP_ADMIN_EMAIL=admin@startrack.test/.test(contents);
  record.envMode = fs.statSync(record.envFile).mode & 0o777;
}
if (tool === 'node' && !args.includes('--check') && !args.includes('--test')) {
  record.syntheticCredentials = process.env.STARTRACK_BOOTSTRAP_ADMIN_EMAIL === 'admin@startrack.test' &&
    /^[a-f0-9]{36}$/.test(process.env.STARTRACK_BOOTSTRAP_ADMIN_PASSWORD || '') &&
    /^[a-f0-9]{48}$/.test(process.env.STARTRACK_DB_PASSWORD || '');
  record.apiUrl = process.env.STARTRACK_API_URL;
  record.browserOrigin = process.env.STARTRACK_BROWSER_ORIGIN;
}
fs.appendFileSync(process.env.GATE_MOCK_LOG, JSON.stringify(record) + '\\n');
if (tool === 'node' && record.browserOrigin && process.env.GATE_FAIL === 'proxy') process.exit(24);
if (tool === 'docker') {
  if (args[0] === 'compose') {
    if (args.includes('ps') && args.includes('--services')) {
      if (process.env.GATE_FRONTEND_RUNNING !== 'false') process.stdout.write('frontend\\n');
    }
    if (args.includes('down') && process.env.GATE_FAIL === 'cleanup') process.exit(17);
    if (args.includes('start') && process.env.GATE_FAIL === 'restore') process.exit(18);
    if (args.includes('stop') && process.env.GATE_FAIL === 'stop') process.exit(19);
  }
  if (args[0] === 'run' && process.env.GATE_FAIL === 'test') process.exit(23);
  if (args[0] === 'run' && process.env.GATE_FAIL === 'signal') {
    process.kill(process.ppid, 'SIGTERM');
    process.exit(143);
  }
  if (args[0] === 'container' && args[1] === 'inspect') {
    process.exit(process.env.GATE_FAIL === 'signal' ? 0 : 1);
  }
}
`;

function runGate({ mode = '--ci', backendOnly = false, failure = '', running = true, existingEnv = true, prematureExit = false } = {}) {
  const fixture = mkdtempSync(path.join(tmpdir(), 'startrack-gate-regression-'));
  const project = path.join(fixture, 'project with spaces');
  const bin = path.join(fixture, 'bin');
  const scratch = path.join(fixture, 'scratch');
  const unrelated = path.join(fixture, 'unrelated');
  const log = path.join(fixture, 'commands.jsonl');
  const developerEnv = path.join(project, '.env');
  const originalEnv = 'STARTRACK_DB_PASSWORD=developer-secret\n' +
    'STARTRACK_BOOTSTRAP_ADMIN_PASSWORD=developer-secret\n' +
    'STARTRACK_BOOTSTRAP_ADMIN_EMAIL=developer@example.invalid\n' +
    'exit 99 # This file must never be sourced by verification.\n';
  for (const directory of [bin, scratch, unrelated, path.join(project, 'scripts'),
    path.join(project, 'backend'), path.join(project, 'frontend')]) {
    mkdirSync(directory, { recursive: true });
  }
  copyFileSync(gate, path.join(project, 'scripts/test-local.sh'));
  if (prematureExit) {
    const source = readFileSync(gate, 'utf8');
    assert.ok(source.includes('verification_completed=true'));
    writeFileSync(path.join(project, 'scripts/test-local.sh'), source.replace('verification_completed=true', 'exit 0'));
  }
  writeFileSync(path.join(project, 'compose.yaml'), 'name: startrack\nservices: {}\n');
  for (const name of ['init-local-env.sh', 'smoke-local.sh']) {
    const file = path.join(project, 'scripts', name);
    writeFileSync(file, '#!/bin/sh\nexit 98 # The gate must not invoke this wrapper.\n');
    chmodSync(file, 0o755);
  }
  const build = path.join(project, 'scripts/build-local-images.sh');
  copyFileSync(fileURLToPath(new URL('./build-local-images.sh', import.meta.url)), build);
  chmodSync(build, 0o755);
  for (const name of ['docker', 'node', 'rsync', 'curl', 'sleep']) {
    const file = path.join(bin, name);
    writeFileSync(file, fakeTool);
    chmodSync(file, 0o755);
  }
  if (existingEnv) writeFileSync(developerEnv, originalEnv, { mode: 0o600 });

  try {
    const result = spawnSync('/bin/sh', [path.join(project, 'scripts/test-local.sh'), mode,
      ...(backendOnly ? ['--backend-only'] : [])], {
      cwd: unrelated,
      env: {
        ...process.env,
        PATH: `${bin}${path.delimiter}${process.env.PATH}`,
        TMPDIR: scratch,
        GATE_MOCK_LOG: log,
        GATE_FAIL: failure,
        GATE_FRONTEND_RUNNING: String(running),
        // None of these inherited values may choose what the gate deletes or authenticates with.
        STARTRACK_VERIFY_PROJECT: 'startrack',
        COMPOSE_PROJECT_NAME: 'startrack',
        COMPOSE_FILE: path.join(unrelated, 'hostile-compose.yaml'),
        COMPOSE_ENV_FILES: developerEnv,
        GITHUB_RUN_ID: 'not-a-number;startrack',
        STARTRACK_DB_PASSWORD: 'developer-secret',
        STARTRACK_TOKEN_SECRET: 'developer-secret',
        STARTRACK_BOOTSTRAP_ADMIN_EMAIL: 'developer@example.invalid',
        STARTRACK_BOOTSTRAP_ADMIN_PASSWORD: 'developer-secret',
        STARTRACK_BROWSER_ORIGIN: 'https://developer-origin.invalid',
        STARTRACK_BUILD_BACKEND_CONTEXT: path.join(unrelated, 'hostile-backend'),
        STARTRACK_BUILD_FRONTEND_CONTEXT: path.join(unrelated, 'hostile-frontend'),
      },
      encoding: 'utf8',
      timeout: 20_000,
    });
    assert.ifError(result.error);
    const records = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse);
    const compose = records.filter((record) => record.tool === 'docker' && record.args[0] === 'compose');
    assert.ok(compose.length > 0);
    assert.ok(records.some((record) => record.tool === 'node' && record.args.includes('--test') &&
      record.args.some((arg) => arg.endsWith('/test-project-history-review.mjs'))),
    'Every gate mode must run reviewed history mapping regressions');
    assert.ok(records.some((record) => record.tool === 'node' && record.args.includes('--test') &&
      record.args.some((arg) => arg.endsWith('/test-rehearsal-http.mjs'))),
    'Every gate mode must run rehearsal transport regressions');
    for (const record of compose) {
      assert.ok(record.privateEnv, 'Compose must receive fresh synthetic credentials');
      assert.equal(record.envMode, 0o600);
      assert.notEqual(record.envFile, developerEnv);
      assert.equal(existsSync(record.envFile), false, 'Private env must be removed');
      assert.equal(record.args[record.args.indexOf('-f') + 1], path.join(project, 'compose.yaml'));
      assert.equal(record.args[record.args.indexOf('--project-directory') + 1], project);
      if (record.project === 'startrack') {
        assert.ok(record.args.includes('ps') || record.args.includes('stop') || record.args.includes('start'),
          'Developer project must only be inspected, paused or restored');
        assert.equal(mode, 'local', 'CI must never touch the developer project');
        assert.equal(backendOnly, false, 'Backend-only must never touch the developer project');
      } else {
        assert.match(record.project, /^startrack_verify_[a-f0-9]{16}$/);
      }
      if (record.args.includes('down')) assert.notEqual(record.project, 'startrack');
    }
    for (const record of records.filter((record) => record.tool === 'docker' && record.args[0] === 'run')) {
      assert.match(record.args[record.args.indexOf('--name') + 1], /^startrack_verify_[a-f0-9]{16}-(frontend-test|frontend-build|backend-test)$/);
    }
    for (const record of records.filter((record) => record.tool === 'node' && !record.args.includes('--check') && !record.args.includes('--test'))) {
      assert.ok(record.syntheticCredentials, 'Smoke tests must use synthetic credentials, not developer .env');
      if (!record.args[0].endsWith('test-postgres-baseline.mjs')) {
        assert.match(record.apiUrl, /^http:\/\/127\.0\.0\.1:\d+$/);
      }
      assert.ok(record.args[0].endsWith('.mjs'));
    }
    assert.equal(existsSync(developerEnv), existingEnv, 'Do not create/delete the developer .env');
    if (existingEnv) assert.equal(readFileSync(developerEnv, 'utf8'), originalEnv);
    assert.doesNotMatch(result.stdout + result.stderr, /developer-secret/);
    return { ...result, records, compose };
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

test('CI ignores hostile project/env/cwd overrides and uses fresh synthetic credentials', () => {
  const result = runGate();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Local verification and cleanup passed/);
  const productionBuild = result.records.find((record) => record.tool === 'docker' &&
    record.args[0] === 'run' && record.args.some((arg) => arg.endsWith('-frontend-build')));
  assert.ok(productionBuild, 'Full gate must execute the production frontend build');
  assert.equal(productionBuild.args[productionBuild.args.indexOf('--network') + 1], 'none',
    'Production frontend build must run offline, without fetching remote assets');
  assert.equal(result.compose.filter((record) => record.args.includes('down')).length, 1);
  assert.equal(result.records.filter((record) => record.tool === 'node' && !record.args.includes('--check') && !record.args.includes('--test')).length, 6);
});

test('full gate checks the frontend proxy with its browser origin and isolated credentials', () => {
  const result = runGate();
  assert.equal(result.status, 0, result.stderr);
  const calls = result.records.filter((record) => record.tool === 'node' &&
    record.args[0]?.endsWith('/smoke-local.mjs'));
  assert.equal(calls.length, 3);
  assert.equal(calls[0].browserOrigin, undefined);
  assert.equal(calls[1].browserOrigin, calls[1].apiUrl);
  assert.notEqual(calls[1].apiUrl, calls[0].apiUrl);
  assert.equal(calls[1].syntheticCredentials, true);
  assert.equal(calls[2].browserOrigin, undefined);
  assert.equal(calls[2].apiUrl, calls[0].apiUrl);
});

test('frontend proxy failure fails the gate and cleans the isolated stack', () => {
  const result = runGate({ failure: 'proxy' });
  assert.notEqual(result.status, 0);
  assert.ok(result.compose.some((record) => record.args.includes('down')));
  assert.doesNotMatch(result.stdout, /verification and cleanup passed/);
});

test('runtime images reuse the exact source contexts used for tests', () => {
  const result = runGate();
  assert.equal(result.status, 0, result.stderr);
  const builds = result.records.filter((record) => record.tool === 'docker' && record.args[0] === 'build');
  for (const component of ['backend', 'frontend']) {
    const componentBuilds = builds.filter((record) => record.args.at(-1).endsWith('/' + component));
    assert.equal(componentBuilds.length, 2);
    assert.equal(componentBuilds[0].args.at(-1), componentBuilds[1].args.at(-1));
    assert.equal(result.records.filter((record) => record.tool === 'rsync' &&
      record.args.at(-1).endsWith('/' + component + '/')).length, 1);
  }
});

test('an early exit zero cannot report a completed verification', () => {
  const result = runGate({ prematureExit: true });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /before all required checks completed/);
  assert.ok(result.compose.some((record) => record.args.includes('down')));
  assert.doesNotMatch(result.stdout, /verification and cleanup passed/);
});

for (const mode of ['local', '--ci']) {
  test(`${mode} backend-only skips every frontend step but retains backend, recovery and persistence checks`, () => {
    const result = runGate({ mode, backendOnly: true });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Backend-only verification and cleanup passed; frontend checks were not run/);
    assert.doesNotMatch(result.stdout, /Local verification and cleanup passed/);
    assert.equal(result.compose.some((record) => record.project === 'startrack'), false);
    assert.equal(result.records.some((record) => record.args.some((arg) => arg.includes('frontend'))), false,
      'No frontend staging, build, test, inspection, cleanup or service operation');
    const builds = result.records.filter((record) => record.tool === 'docker' && record.args[0] === 'build');
    assert.equal(builds.length, 3, 'Build only backend tests, migrations and backend runtime');
    const runs = result.records.filter((record) => record.tool === 'docker' && record.args[0] === 'run');
    assert.equal(runs.length, 1);
    assert.match(runs[0].args.join(' '), /backend-test/);
    const up = result.compose.find((record) => record.args.includes('up'));
    assert.deepEqual(up.args.slice(up.args.indexOf('up')), ['up', '-d', '--no-build', 'backend']);
    const checks = result.records.filter((record) => record.tool === 'node' &&
      !record.args.includes('--check') && !record.args.includes('--test'));
    assert.deepEqual(checks.map((record) => path.basename(record.args[0])), [
      'smoke-local.mjs', 'security-smoke-local.mjs', 'test-postgres-baseline.mjs',
      'test-database-local.mjs', 'smoke-local.mjs',
    ]);
    assert.ok(checks.every((record) => record.browserOrigin === undefined),
      'Backend-only does not inherit caller origins or execute frontend proxy requests');
    const restart = result.records.findIndex((record) => record.args.includes('restart'));
    const smokeRuns = result.records.map((record, index) => ({ record, index }))
      .filter(({ record }) => record.tool === 'node' && path.basename(record.args[0]) === 'smoke-local.mjs');
    assert.ok(smokeRuns[0].index < restart && smokeRuns[1].index > restart);
    const curls = result.records.filter((record) => record.tool === 'curl');
    assert.equal(curls.length, 2);
    assert.ok(curls.every((record) => record.args.at(-1).endsWith('/api/all')));
    assert.equal(result.compose.filter((record) => record.args.includes('down')).length, 1);
  });
}

for (const failure of ['test', 'cleanup', 'signal']) {
  test(`backend-only ${failure} failure cleans up without touching the developer stack`, () => {
    const result = runGate({ mode: 'local', backendOnly: true, failure });
    assert.notEqual(result.status, 0);
    assert.ok(result.compose.some((record) => record.args.includes('down')));
    assert.equal(result.compose.some((record) => record.project === 'startrack'), false);
    assert.equal(result.records.some((record) => record.args.some((arg) => arg.includes('frontend'))), false);
    assert.doesNotMatch(result.stdout, /verification and cleanup passed/);
    if (failure === 'signal') {
      assert.equal(result.records.filter((record) => record.tool === 'docker' &&
        record.args[0] === 'container' && record.args[1] === 'rm').length, 1);
    }
  });
}

test('CI does not create a developer .env and generates unique projects for successive runs', () => {
  const first = runGate({ existingEnv: false });
  const second = runGate({ existingEnv: false });
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.notEqual(first.compose[0].project, second.compose[0].project);
});

test('local mode restores an originally running frontend only after isolated cleanup', () => {
  const result = runGate({ mode: 'local' });
  assert.equal(result.status, 0, result.stderr);
  const stop = result.compose.findIndex((record) => record.args.includes('stop'));
  const down = result.compose.findIndex((record) => record.args.includes('down'));
  const start = result.compose.findIndex((record) => record.args.includes('start'));
  assert.ok(stop >= 0 && down > stop && start > down);
  assert.ok(result.stdout.indexOf('Restoring the developer frontend') < result.stdout.indexOf('Local verification and cleanup passed'));
});

test('local mode leaves a previously stopped developer frontend stopped', () => {
  const result = runGate({ mode: 'local', running: false });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.compose.some((record) => record.args.includes('stop') || record.args.includes('start')), false);
});

for (const failure of ['test', 'cleanup', 'restore', 'stop']) {
  test(`${failure} failure returns nonzero, attempts cleanup and restoration, and never claims success`, () => {
    const result = runGate({ mode: 'local', failure });
    assert.notEqual(result.status, 0);
    assert.ok(result.compose.some((record) => record.args.includes('down')));
    assert.ok(result.compose.some((record) => record.args.includes('start')));
    assert.doesNotMatch(result.stdout, /Local verification and cleanup passed/);
  });
}

test('interruption returns nonzero and removes named test containers before restoring frontend', () => {
  const result = runGate({ mode: 'local', failure: 'signal' });
  assert.notEqual(result.status, 0);
  assert.equal(result.records.filter((record) => record.tool === 'docker' && record.args[0] === 'container' && record.args[1] === 'rm').length, 3);
  assert.ok(result.compose.some((record) => record.args.includes('down')));
  assert.ok(result.compose.some((record) => record.args.includes('start')));
  assert.doesNotMatch(result.stdout, /Local verification and cleanup passed/);
});
