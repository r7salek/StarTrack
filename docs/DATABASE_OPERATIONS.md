# Versioned PostgreSQL initialization and recovery

Implementation status and execution evidence are recorded in
[Phase 3 progress](PHASE3_PROGRESS.md). Do not infer completion from this runbook.

## What the baseline means

`database/migrations/V1__legacy_baseline.sql` preserves the existing 22 tables,
22 sequences, types, defaults and constraints. It does not fix history grouping,
case-fold emails, change foreign keys or remove inherited child-ID defaults.
The `public` schema's generated-ID sequence is included intentionally.

The standalone Flyway image contains the versioned SQL. Its own Java runtime is
separate from StarTrack's Java 11/Spring Boot 2.5.4 runtime. The application does
not gain a new Maven production dependency. See the
[migration decision](adr/0001-explicit-postgresql-migrations.md).

Flyway's `startrack.flyway_schema_history` records applied versions and checksums.
Never edit an applied V1 file: later approved structure changes require new
numbered migration files. `clean` and `baselineOnMigrate` are disabled. Migration
checksums do not detect arbitrary live-schema changes; schema comparison and
application validation are separate checks.

## Verification, without touching the developer database

```sh
./scripts/test-local.sh
```

The same gate runs in CI with `--ci`. It uses private synthetic credentials and a
fresh random Compose project/volume. Local mode preserves the normal database
and backend, temporarily pausing/restoring only the developer frontend to limit
memory use. No real records or external identity/PID services are needed.

The native characterization can also run independently:

```sh
node scripts/test-postgres-baseline.mjs
```

It requires the cached `postgres:15-alpine` image and creates one uniquely named,
network-disconnected PostgreSQL container with temporary in-memory storage. It
never reads the developer `.env`. Its SQL checks are not substitutes for the
shared gate's real JPA/API, history and application-recovery checks.

`scripts/test-database-local.mjs` is an internal gate entry point, not a developer
database adoption command. It requires a gate-generated project, checks container
labels and derives the API address from that project's backend. It creates only
disposable rehearsal databases and restores the isolated backend after testing.

## Fresh databases

The intended startup order is PostgreSQL health → schema initialization → Flyway
migration → backend schema validation. A migration failure must prevent backend
startup. Repeated migration runs must not recreate tables or seed duplicate data.
Account bootstrap remains separately opt-in and environment configured.

After the local recovery gate passed, the migration service was incorporated
into default Compose and Hibernate switched to `validate`. The temporary test
overlay was removed. This changes future startup configuration; it does not
migrate or recreate the already-running developer stack.

## Existing database adoption: separate approval required

An existing unmanaged database is expected to be rejected by ordinary migration
startup. Do not turn on automatic baselining, disable validation, delete the
volume or rerun V1 directly to make that error disappear.

The approved adoption workflow must have all of the following evidence:

1. Identify the exact database/catalog, schema, volume and application version.
   Stop all writers during the maintenance window. Retain the previous images
   and source commit; a schema-only snapshot is not a recovery backup.
2. Take a consistent full custom-format `pg_dump` backup, retain it in a private
   location, record its checksum, and preserve required role/ownership/grant
   definitions separately. `pg_dump` does not back up cluster-global roles.
3. Restore into a separate disposable database using `pg_restore --exit-on-error
   --single-transaction`. Required roles must exist before restoring grants.
   Compare every table, relationship and sequence's `last_value`/`is_called`,
   plus explicit privileges. Do not print records or credential hashes.
4. Produce schema-only dumps from the candidate and a freshly migration-created
   reference using the same PostgreSQL tool version, `--no-owner --no-acl
   --no-comments`, excluding `startrack.flyway_schema_history`. Compare the
   complete application/public object definitions:

   ```sh
   node scripts/compare-database-schema.mjs reference.sql candidate.sql
   ```

5. Only a matching, successfully restored copy can receive an explicit V1
   baseline. Run Flyway baseline at version 1, then migrate and validate. The
   baseline marks the existing structure; it does not execute V1 over live tables.
6. Start the matching application with schema validation. Prove login, current
   user, all nine nested record types, new inserts and restart persistence on the
   adopted copy. Only then consider the separately approved target operation.

The automated rehearsal follows these checks on synthetic copies. It is not
authorization or evidence for migrating Cambridge, Munich, production data, or
the developer's normal volume.

The adoption rehearsal currently targets the legacy V1 baseline. When adding V2
or later, add a populated pre-upgrade V1 fixture and test that exact upgrade path;
do not assume the existing V1-only adoption test proves every future migration.

## Failure and recovery

- Unknown schema or modified migration checksum: stop and investigate. Never
  silently repair metadata or baseline a mismatch.
- Failed transactional migration: verify that both its SQL changes and its new
  history row rolled back. Not every future migration can be transactional;
  review that property per migration before approving it.
- Failed deployment needing recovery: stop writers, restore the tested backup
  into a separate target, validate counts/links/counters/privileges, and start the
  matching previously retained application version. Do not assume reversing SQL
  can recover discarded data.
- Cleanup/restoration failure: the gate must return nonzero and identify the
  disposable resource needing inspection. Never use broad Docker pruning or
  delete the normal `startrack_startrack-postgres` volume as a recovery shortcut.

This phase does not add a production backup scheduler, off-site retention,
encryption/key management, point-in-time recovery or a production release process.
Those require deployment and data-governance decisions.
