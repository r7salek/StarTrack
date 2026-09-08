# Phase 4 — backend modernization and reliable history

Approved implementation started 2026-09-08 from `d349ca9` on
`codex/backend-modernization`. The persistent Phase 4 goal is active. No push,
merge, developer-volume adoption or production operation is authorized.

## Checkpoints

| Goal | Status | Acceptance |
| --- | --- | --- |
| 1. Baseline and upgrade regressions | Passed | 37 backend tests, 8 schema guards, 14 gate tests, 17 PostgreSQL and 11 recovery checks; restart and cleanup passed |
| 2. Supported backend runtime | Active | Java 21/Boot 4.1 through verified intermediate checkpoints, unchanged V1 and success contracts |
| 3. API safety | Pending | Safe errors, validated input, atomic writes, deactivated-token denial |
| 4. Identity and history | Pending | Reviewed mapping, versioned migrations, append-only snapshots, archive/deactivate and concurrency tests |
| 5. UI wiring and final verification | Pending | Existing UI connected, local/CI-style and browser gates, recovery, cleanup and local commits |

One checkpoint is active at a time. Small prerequisite fixes may be made when a
new regression proves a blocker, but do not imply that a later goal is complete.

## Boundaries and execution

- Preserve existing tests; record changed assertions only for approved contracts.
- Never rewrite V1 or relax strict schema checks to accommodate a newer ORM.
- Synthetic isolated databases only. Old-record grouping requires a reviewed
  manifest, never an automatic name-based merge.
- Security/API subagent owns focused regressions; primary owns runtime and
  shared configuration. Data and UI work start after their prerequisites pass.
- Keep heavy Docker checks sequential on this 8 GB Mac.
- Finalize with signed local checkpoint commits; never bypass signing or push.
- Angular upgrades, UI redesign, AI, SSO/PID and project permission redesign
  remain excluded. Backend modernization alone is not production readiness.

## Evidence

Initial checkout was clean. Docker was available with no running containers;
the existing developer volume is not a verification target. No Phase 4 test
result or runtime-upgrade success has been claimed yet.

### Goal 1 regression evidence

- Eight schema/adoption guard tests passed.
- Baseline Boot 2.5.4 / Java 11 Maven run executed 37 tests, with two failures:
  deactivated bearer authentication incorrectly returned 200 instead of 401;
  the new production-chain CORS preflight test returned 403 instead of 200.
  The remaining 35 tests passed, including five fixed legacy JWT cases.
- The first network-disabled attempt stopped before tests because the legacy
  Java EE endorsed artifact was absent from the dependency cache. The measured
  37-test run allowed Maven downloads; all service dependencies were mocked.
- Account-state enforcement is being corrected after observing the failing
  test. CORS test setup versus production behavior is under investigation.

The subsequent run passed the deactivation test (36/37 passing). CORS diagnostics
proved that the slice lacked placeholder resolution: it injected the literal
`${startrack.cors.allowed-origins:...}` even though its Environment contained the
correct origin. The test context is being aligned with production placeholder
configuration; the production CORS policy is unchanged.

The backend-only verification mode and its 14 mocked shell regressions are
implemented. It explicitly skips frontend work and never operates on developer
services; it is not a substitute for the final full local/CI-style gate.

### Goal 1 closure

`./scripts/test-local.sh --backend-only` passed end to end on the original
Boot 2.5.4 / Java 11 runtime: 37 backend tests, 8 schema guards, 14 gate
regressions, 17 native PostgreSQL checks and 11 migration/recovery checks. Login,
account-security smoke, nested records and backend-restart persistence passed.
The disposable stack and volume were removed successfully. No frontend checks
were run, and no developer service was started or database adopted.

The production account-status fix and the test-slice placeholder correction
resolved the observed failures without changing the CORS allowlist. The schema
fingerprint remains `557c2b5754dbade2c6cf806fd761520175bf3b6734d23d83e22d7cc742066d72`.

### Goal 2 target

Use Boot 2.7.18 (Java 11), then Java 21, Boot 3.5.16, Boot 4.0.8 and Boot 4.1.1
as separate verification checkpoints. Intermediate unsupported Boot lines are
migration steps, not completed modernization. Target versions were verified
against [Spring's current requirements](https://docs.spring.io/spring-boot/system-requirements.html)
and [migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)
on 2026-09-08. No schema redesign begins until this runtime gate passes.
