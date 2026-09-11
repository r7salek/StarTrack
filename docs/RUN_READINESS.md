# Run readiness

## What is established

- The backend and frontend are consolidated in this repository and traceable to
  immutable public-source revisions.
- Runtime secrets are externalised. The legacy PID credential in the first
  consolidated commit still requires revocation by its owner; see
  [security notes](SECURITY.md).
- Remote PID lookup is opt-in and disabled by default.
- The backend specifies Java 21 and Spring Boot 4.1.1; the frontend specifies
  Angular 16.2 and uses its committed npm lockfile.
- The API expects PostgreSQL. Browser requests use the frontend's same-origin
  development proxy; its native backend target defaults to `http://127.0.0.1:8080`.
- Backend and frontend tests now run in Docker, and one shared command exercises
  tests, builds and a fresh isolated runtime stack.
- Critical account operations have explicit administrator or self-only rules;
  see [the authorization matrix](AUTHORIZATION_MATRIX.md).
- Phase 3 adds field-level [API contracts](API_CONTRACTS.md), a versioned
  PostgreSQL baseline and tested adoption/backup/restore procedures. Compose runs
  migrations before the backend; Hibernate now validates the schema rather than
  changing it automatically. See [Phase 3 evidence](PHASE3_PROGRESS.md).

## Local verification and remaining limits

The Docker baseline has now been proven to start end-to-end using PostgreSQL
15, Java 21 and Node 18 images. Native Java, Maven and PostgreSQL installations
are not required. The services bind to loopback ports only and use generated
local credentials plus synthetic data.

The source now has a local Docker Compose definition and a GitHub Actions
workflow, but the remote workflow has not run because this branch is unpushed.
The migration runner and synthetic recovery checks are implemented and verified
locally; this is not evidence of production readiness. Project-level permission
rules, frontend dependency upgrades and production backup/retention arrangements remain
unresolved. Do not expose it publicly.

The normal developer database has not been adopted into migration management.
Ordinary startup is expected to reject an existing unmanaged schema. Do not
delete its volume, enable automatic baselining or disable validation to bypass
that refusal. Adoption requires separate approval and the checks in
[database operations](DATABASE_OPERATIONS.md#existing-database-adoption-separate-approval-required).

## Safe verification order

1. Run `./scripts/test-local.sh`; it generates its own private synthetic values
   and uses a separate Compose project and temporary PostgreSQL volume. It does
   not require or replace the developer `.env`.
2. Review tests, builds, migration/recovery checks and restart persistence before
   accepting a change. Use `--ci` for CI-style isolation without pausing the
   developer frontend.
3. For a separately approved new developer installation, generate local values
   with `./scripts/init-local-env.sh` and follow [local setup](LOCAL_DEVELOPMENT.md).
   For an existing volume, follow the adoption procedure instead of treating it
   as a fresh installation.
4. Keep the API contracts and schema baseline current when approving later
   changes; never edit an already-applied migration.

Phase 4 backend runtime modernization, API safety and identity/history are
verified with the complete local gate, including recovery and restart. Browser
workflows and clean-checkout CI-style verification also passed. The tested
implementation is signed local commit `7b401db`; the remote workflow remains
unrun because nothing was pushed.
See [Phase 4 evidence](PHASE4_PROGRESS.md). No deployment,
existing-volume adoption or remote integration is implied by these results.
