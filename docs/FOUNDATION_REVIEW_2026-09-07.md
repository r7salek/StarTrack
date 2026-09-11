# Foundation review and Phase 3 starting checkpoint

Reviewed 2026-09-07, starting from Phase 2 commit `974d07b` on
`codex/test-security-foundation`. Improvements are on `codex/foundation-review`.
No commits, push, merge, deployment or framework upgrade were performed in this
review. The existing developer Docker images and database were preserved;
changed application code was verified in disposable containers.

## Decision

Phase 2 was a useful local foundation, but the review found three concrete
improvements worth making before building on it. Those fixes are implemented
and tested. Phase 3 has now **started with its inventory checkpoint**, not
completed. Database initialization is intentionally unchanged.

## Improvements made

| Finding | Change |
| --- | --- |
| Deletion-request authorization ignored email case while the database distinguished it | Require the exact authenticated email and update by the authenticated account ID. A real-PostgreSQL regression proves a separately registered case-variant account remains untouched. |
| Valid JSON could still represent an invalid session; storage reads could throw; root/header/login consumers assumed a token implied a valid user | Validate identity/roles and handle storage read failures. Require token plus validated user in those consumers, keeping the login form available for invalid sessions. Invalid login responses cannot trigger navigation or a success message. |
| Verification accepted a project-name override that could select the developer volume, reused developer credentials and swallowed cleanup failures | Generate private synthetic credentials and unique project/image/container names; use explicit Compose paths; ignore the unsafe project override; clean named test containers on interruption; fail on stack-cleanup/restoration errors; print success only after cleanup. |

Frontend tests also have a five-minute process deadline and run without network
access. Existing component specs were retained and expanded. The Uncodixfy
guidance was used to preserve the existing markup, styling and visual design;
this review did not redesign the interface.

An independent subagent implemented/tested the verification-script changes,
then reviewed the account/session changes and fixed the related UI consumers.
Primary-agent review and Docker verification followed.

## Verification evidence

| Check | Observed result |
| --- | --- |
| Verification-script failure/isolation regressions | 9 passed, including malicious overrides, arbitrary caller directory, cleanup failures and interrupted runs |
| Backend tests | 17 passed; zero failures, errors or skips |
| Final frontend tests | 58 passed; zero failures |
| Final Angular production build | Passed; 4.44 MB initial bundle; inherited CommonJS and stylesheet-budget warnings remain |
| Runtime account-security checks | Passed: OAuth disabled, administrator boundaries, cross-account isolation, case-variant deletion isolation, password omission, removed routes, CORS |
| Runtime application checks | Passed: login, current-user lookup, project creation/listing and persistence after backend restart |
| Isolated stack cleanup and developer frontend restoration | Shared gate returned success after cleanup/restoration |
| Targeted whitespace/syntax checks | Passed for the changed code/scripts; unrelated cloud-only files were not rewritten |

The full `./scripts/test-local.sh` run passed with the first 37-test frontend
snapshot and the 17 backend tests. The subsequent review added 21 component
regressions; the final frontend snapshot was separately rerun through all 58
tests and a production build. The unchanged backend/database checks were not
repeated afterward. The existing GitHub Actions configuration was inspected
(read-only repository permission, 30-minute job, PR/main/codex triggers), but no
GitHub-hosted run was performed.

This is API-level integration verification, not a browser click-through of
every workflow. The temporary frontend's API-target limitation is explicitly
recorded in [the API inventory](API_INVENTORY.md#client-base-urls-and-verification-boundary).

## Phase 3 checkpoint delivered

- [API inventory](API_INVENTORY.md): all 34 controller routes, access rules,
  request/response boundaries and inherited compatibility quirks.
- [Data model](DATA_MODEL.md): 22 tables, 22 sequences, account/project links,
  history behaviour, nullability and data-ownership limitations.
- [Schema evidence](database/observed-schema.sql): schema-only PostgreSQL
  snapshot; no application records or credential values. Not a migration or
  recovery backup, and never automatically applied.

The inventory exposes why the next change should be cautious: projects link
to mutable account emails, history is grouped by project name, and list views
perform a separate funding query per project. These are recorded for
characterization before changing behaviour or optimizing queries.

## Still outstanding

Phase 3 still needs formal per-field/error contracts, PostgreSQL integration
tests, migration-tool selection/integration, and empty-database plus existing-
data-copy migration/recovery rehearsals. Only then should `ddl-auto=update`
be replaced with schema validation.

Framework/dependency upgrades, project-level permissions, UI modernization and
AI features remain in their agreed later phases. Owner-side revocation of the
historically exposed PID credential is still an external action, not something
these local checks establish. No live Cambridge/Munich/PID/OAuth service was
contacted.

Some source files and Git objects were marked cloud-only (`dataless`) during
inspection. Broad read-only Git checks stalled on them and were stopped;
targeted checks on the changed files passed. No source files, Git objects or
developer data were replaced to work around that storage behaviour.
