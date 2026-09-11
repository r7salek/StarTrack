# Phase 3 — versioned database and API foundation

Implementation started 2026-09-08 on `codex/data-api-foundation`, retaining the
reviewed working-tree changes from `codex/foundation-review`. Nothing has been
pushed or merged. The normal developer database is not an implementation target.

## Achievable checkpoints

1. Preserve and review the existing foundation; save a local checkpoint commit.
2. Complete [API contracts](API_CONTRACTS.md), add isolated contract tests and
   characterize the existing PostgreSQL persistence behavior with synthetic data.
3. Verify the pinned migration runner and V1 structural baseline on an empty DB.
4. Prove explicit adoption on a populated disposable copy, reject schema drift,
   and rehearse backup/restore including application login and future inserts.
5. Only after those gates pass, switch default initialization to migrations plus
   Hibernate validation; run the shared quality gate and document recovery.

## Checkpoint status

| Goal | Status and evidence |
| --- | --- |
| Preserve foundation | Passed: reviewed foundation saved separately in signed local commit `6f1e8aa` (`Harden reviewed foundation and record data baseline`). 1Password signing succeeded after approval; no signing settings were changed. |
| API and PostgreSQL characterization | Passed: 25 backend tests (17 security + 8 contracts), 17 native PostgreSQL checks, complete 34-route field contracts and nine-child synthetic fixture. |
| Migration baseline | Passed: Flyway OSS 13.2.0, pinned by version/digest, initialized PostgreSQL 15.19; the schema matched an independently Hibernate-generated baseline. |
| Adoption and recovery | Passed: 11 checks covering nested API values, repeat migration, checksum rejection, transactional rollback, disabled clean, restore, unmanaged/drift refusal, explicit V1 adoption, history, deletion and new IDs. |
| Shared quality gate | Local and final clean CI-style gates passed: 58 frontend tests, production build, 25 backend tests, 8 schema guards, 9 gate regressions, 17 PostgreSQL checks, 11 recovery checks, account-security smoke and restart persistence. Both returned exit 0 after cleanup. |

Only after those local recovery checks passed was the migration service folded
into default Compose and Hibernate switched to `validate`. The temporary test
overlay was removed. The final `./scripts/test-local.sh --ci` run verified this
default configuration from a clean source copy without developer environment
files or Git metadata. The same structural fingerprint was reproduced.

The first local run ended successfully after removing its disposable resources
and restoring the developer frontend. The normal database/backend and existing
images were not replaced. Existing unmanaged volumes need a separately approved
adoption operation before they can use the new startup path.

The verified structural fingerprint (excluding Flyway history) was
`557c2b5754dbade2c6cf806fd761520175bf3b6734d23d83e22d7cc742066d72`.
Recovery backup fingerprints are printed for synthetic rehearsals; these private
temporary backups are removed after verification, not retained as user backups.

## Closure and boundaries

- The foundation checkpoint is signed and committed separately. Phase 3 is
  recorded in the signed local commit containing this completion record; nothing
  was pushed or merged.
- GitHub-hosted Actions has not run; a local CI-style run is not hosted CI.
- Inherited 4.44 MB bundle/CommonJS/style-budget warnings, project-level permission
  gaps and legacy error-response details remain documented for later phases.
- No framework upgrade, model redesign, real data, SSO/PID or AI integration.
- Docker pause and temporary registry DNS failure were resolved before runtime
  checks. Some cloud-managed source/Git reads remain slow; no source or Git
  objects were replaced to bypass storage behavior.

Phase 3's implementation and technical verification are complete. This completion
record closes the phase when saved in its signed local commit. See
[database operations](DATABASE_OPERATIONS.md) for the tested procedure and its
limits. No framework modernization has started.

## Completion refresh — 2026-09-08

A subsequent completion request found the implementation already saved in local
commit `a09cd4f` on `codex/data-api-foundation`, with a clean working tree before
this documentation refresh. The five checkpoints above were not reimplemented.

Fresh checks in this refresh passed:

- 8 schema/adoption guard tests and 9 verification-script regressions.
- 17 native PostgreSQL checks, including complete synthetic backup/restore,
  constraints, grants, sequence state and subsequent inserts. The disposable
  network-isolated container and temporary storage were removed successfully.

The full application/build/migration gate was not repeated for these
documentation-only changes; its results remain the implementation evidence
recorded above. The outdated readiness statement that migrations were absent
was corrected in [run readiness](RUN_READINESS.md), including the distinction
between isolated verification and separately approved existing-volume adoption.
No developer container was started or migrated during this refresh.
