# Modernisation plan

StarTrack is being stabilised in evidence-based phases. A phase is complete
only when its documented checks pass; local success is not a production or
security approval.

## Phase 0 — provenance and credential containment (complete)

**Outcome:** both public upstream repositories are consolidated with traceable
revisions, operational credentials removed from the current source, and remote
PID lookup disabled by default.

The legacy PID-dispatcher credential remains exposed in earlier Git history and
still requires owner-side revocation or rotation.

## Phase 1 — reproducible local baseline (complete)

**Outcome:** the inherited application starts locally through Docker Compose
with PostgreSQL, loopback-only ports, generated synthetic credentials and a
repeatable API smoke test. Restart persistence has been demonstrated without
using live Cambridge, Munich, OAuth or PID services.

## Phase 2 — test and account-security foundation (complete locally)

**Outcome:** backend and frontend tests, production compilation, isolated
runtime verification and critical account authorization share one repeatable
quality gate.

- Maven executes focused MockMvc/security tests and fails if no tests run.
- Angular tests execute once in staged Node 18/headless-Chromium containers.
- Administrator and self-only account boundaries are enforced server-side;
  password hashes are not serialized; the predictable reset operation and
  state-changing `GET` routes are removed; CORS uses a local allowlist.
- `./scripts/test-local.sh` validates tests, builds, an isolated PostgreSQL
  stack, synthetic account rules, project creation and restart persistence.
- GitHub Actions runs the same command with read-only repository permission.

The local gate has passed. The remote workflow remains unverified until this
branch is deliberately pushed.

## Phase 3 — versioned data model and API inventory (verified locally)

**Outcome:** database changes become explicit and reviewable before runtime
framework upgrades.

The inventory checkpoint has been extended with [field contracts](API_CONTRACTS.md),
PostgreSQL characterization, pinned Flyway migrations and a tested recovery path.
The local gate passed before automatic Hibernate updates were replaced with
schema validation. Final clean CI-style verification also passed. The foundation
checkpoint and Phase 3 are recorded separately in local signed commits. Exact
results are in [Phase 3 progress](PHASE3_PROGRESS.md);
no push, merge or migration of the normal developer database is implied.

- Document the current API routes, request/response contracts, entities,
  relationships, PostgreSQL catalog/schema assumptions and data ownership.
- Capture the current generated schema from a synthetic database and establish
  a reviewed migration baseline.
- Introduce a versioned PostgreSQL migration tool and replace automatic
  `ddl-auto=update` only after a migration/recovery rehearsal passes.
- Add database-level integration tests where unit/MockMvc tests cannot validate
  PostgreSQL-specific behaviour.

## Phase 4 — supported runtimes and code quality

**Outcome:** supported Java/Spring and Angular versions without losing verified
business behaviour.

- Upgrade Java and Spring incrementally, treating the Jakarta transition as a
  separate tested change.
- Upgrade Angular in supported increments, remove unused packages, tighten
  TypeScript checks and address accessibility, bundle and stylesheet warnings.
- Centralise frontend/API errors and validation, and add observability that
  excludes sensitive project content.

## Phase 5 — product improvements

**Outcome:** prioritised workflow improvements grounded in user needs.

- Define project ownership and permission rules before expanding collaboration.
- Improve search, project updates, history, reporting/export and structured
  validation against agreed acceptance criteria.
- Pilot changes with synthetic or suitably approved data and a rollback path.

## Phase 6 — AI-assisted interface (future, gated)

**Outcome:** assistive search and drafting that never silently changes records.

- Start with permission-filtered retrieval over approved records and return
  citations or links to underlying entries.
- Treat suggested entries or amendments as drafts requiring authenticated human
  review, validation and explicit submission.
- Log the model, prompt class, sources, output and reviewer decision; do not send
  project data to an external model provider without an approved data flow and
  supplier assessment.
- Measure usefulness, error rate, access-boundary adherence and operational
  impact before expanding scope.

## Current decision gates

No deployment, production-data migration, OAuth/SSO connection, remote PID
connection or AI connection is authorised by these local results. Phase 3 must
establish the data/API baseline before framework modernisation begins.
