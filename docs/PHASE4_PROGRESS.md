# Phase 4 — backend modernization and reliable history

Approved implementation started 2026-09-08 from `d349ca9` on
`codex/backend-modernization`. The persistent Phase 4 goal is active. No push,
merge, developer-volume adoption or production operation is authorized.

## Checkpoints

| Goal | Status | Acceptance |
| --- | --- | --- |
| 1. Baseline and upgrade regressions | Passed | 37 backend tests, 8 schema guards, 14 gate tests, 17 PostgreSQL and 11 recovery checks; restart and cleanup passed |
| 2. Supported backend runtime | Passed | Java 21/Boot 4.1.1; 44 backend tests, full PostgreSQL/recovery/restart gate, unchanged V1 |
| 3. API safety | Passed | 107 backend tests; safe errors/input guards; real late-failure rollback; 12 recovery checks and restart |
| 4. Identity and history | Passed | 187 backend tests; 18 real migration/recovery checks; identity, concurrent append, status snapshots, archive, restore and restart passed |
| 5. UI wiring and final verification | Active | Combined local gate and rebuilt browser workflows passed; clean-checkout CI-style gate and signed commits remain |

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

### Boot 2.7 / Java 11 checkpoint

The first run passed the 8 schema and 14 gate tests, then executed all 37 backend
tests. Seven production-security tests failed during context initialization:
the legacy security configuration has a circular bean dependency that newer
Spring rejects by default. No runtime database checks ran. Correct the bean
dependency rather than enabling circular references, then repeat the gate.

Build cleanup removes the unused endorsed Java EE copy step, unused javatuples
and javax.json dependencies, unused custom repositories and the mismatched
Tomcat version override. Java remains 11 for this first framework checkpoint.

The repeated backend-only gate passed: 37 backend tests, 8 schema guards,
14 gate tests, 17 native PostgreSQL checks and all 11 migration/recovery checks.
Restart persistence and cleanup passed, with the original schema fingerprint
unchanged. The fix moves authentication setup to its framework lifecycle hook
and makes independent encoder/cookie-repository factories static; circular
references remain disabled. Boot 2.7 is an intermediate checkpoint only.

### Java 21 and Boot 3 preparation

The Boot 2.7 checkpoint was committed locally as `6f77efb` after 1Password was
unlocked. The commit contains an SSH signature; signing was never bypassed.
Subsequent runtime, history and frontend changes remain outside that checkpoint.

The first Java 21 run passed all 37 unit/security/contract tests and packaged
the WAR. Runtime startup then failed because nine entity classes extend
`HashSet`, causing Spring Data to reflect into private JDK collection fields.
This is not a passing Java 21 runtime checkpoint. Remove that inappropriate
inheritance, retain every mapped field/relationship, and repeat in an isolated
copy of the staged Boot 2.7 source. Do not add JVM module-opening bypasses.

Boot 3 preparation replaces Java EE imports with Jakarta, moves security to
`SecurityFilterChain`, and updates removed servlet/OAuth/exception-handler APIs.
JJWT moves to 0.13 API/implementation/Gson modules; compatibility tests must
preserve HS512 and the old Base64 key decoding while rejecting other algorithms.
No V1 migration or developer database changes are part of these adaptations.

The corrected Java 21 / Boot 2.7 checkpoint passed in an isolated copy of the
staged source plus pinned Java 21 images and the nine entity-superclass fixes:
37 backend tests, 8 schema guards, 14 gate tests, 17 PostgreSQL checks and
11 migration/recovery checks, restart persistence and cleanup. The schema
fingerprint is unchanged. This independently verifies the Java change before
the Boot 3.5 runtime check. The temporary copy contains no developer credentials.

### Boot 3.5 closure

Boot 3.5.16 / Java 21 passed the complete backend-only gate: 42 backend tests
(including 9 JWT tests and an entity-shape regression), 8 schema guards,
14 gate regressions, 17 PostgreSQL checks and 11 migration/recovery checks.
Authentication, authorization, nested records, restart persistence and cleanup
passed. V1 and the database fingerprint are unchanged. This is a verified
migration bridge, not the supported final runtime target.

### Boot 4.0 compatibility findings

The first Boot 4.0.8 build passed 42 tests but real registration failed:
Jackson 3 could not instantiate `SignUpRequest`. Added its missing no-argument
constructor and an input-deserialization contract test; registration and the
account-security smoke then passed with 43 tests.

The full nested-record save subsequently failed because child entities marked
their database-generated IDs `@NotNull` before insertion. The Hibernate 7
constraint-violation diagnostics identified the `CollaborationRows.id` rule.
Removed that premature Java validation on the nine generated IDs, not database
constraints or input validation. Added a real Bean Validation regression for
all nine new entities. Synthetic failure logs retain a bounded 400-line tail
so the root cause is not lost behind newer framework stack frames.

Boot 4 uses its modular MVC/security/Jackson test starters, Jackson 3 with
compatible JSON defaults, current Mockito bean overrides, and the supported
RestClient OAuth token client. OAuth remains disabled. The full gate must pass
before accepting these changes.

After these corrections, Boot 4.0.8 passed all 44 backend tests, 8 schema guards,
14 gate tests, 17 native PostgreSQL checks, 11 migration/recovery checks and
restart persistence. Cleanup passed and the schema fingerprint is unchanged.
The final runtime checkpoint is Boot 4.1.1 on the same pinned Java 21 images.

### Goal 2 closure

Boot 4.1.1 / Java 21 passed `./scripts/test-local.sh --backend-only`: 44 backend
tests, 8 schema guards, 14 gate tests, 17 PostgreSQL checks and 11
migration/recovery checks. Login, account isolation, CORS, every nested record
type, restore and restart persistence passed. Cleanup passed. V1 and the schema
fingerprint remain unchanged. Frontend/full-stack quality gates remain Goal 5;
this is not a production deployment or existing-volume adoption.

### Goal 3 closure

The red-first API safety run exposed 36 failures and 3 errors across 88 tests.
After safe error responses, request IDs, actual-controller input validation,
typed lookups and transactional regression coverage, the backend-only gate
passed 107 backend tests, 8 schema guards, 14 gate tests, 17 PostgreSQL checks
and 12 migration/recovery checks. A deferred PostgreSQL trigger deliberately
failed after all nine child associations were inserted: the API returned safe
409, all application rows remained unchanged, and a subsequent save succeeded.
Restore, restart and synthetic cleanup passed. No developer volume was used.

### Goal 4 underway

Account deletion now deactivates while retaining account identity and roles.
Focused tests went from 14 tests with 2 expected failures to 14 passing tests,
including disabled-token rejection and the retained empty success response.
Permanent project identity, append-only versions and reviewed legacy mapping
are being implemented; their database and complete application gates have not
yet passed. These are not ready for adoption into an existing database.

The expanded backend suite passes 123 tests. Snapshot-copy review found two
duplicate-row risks: value-equality sets before IDs were assigned and a DISTINCT
group-member projection using the parent ID. Fresh rows now use identity-backed
sets and the projection preserves separate equal-content members. Unit and
real-database regression assertions cover this distinction.

The first V3 backend rehearsal passed fresh initialization, nested writes,
late-failure rollback, V1 backup/adoption and nine recovery checks, then stopped
in the review fingerprint query. A PL/pgSQL local variable shadowed a catalog
alias. Renaming it passed focused PostgreSQL fingerprint, mapping, finalization,
savepoint and ledger-cleanup checks. A subsequent run was invalidated by edits
to its executing shell script and is not accepted as a complete gate result.
Final runs require frozen runner source; cleanup now fails closed if the
completion marker was never reached.

Frontend preparation connects UUID history/archive and expected-version saves,
retains drafts on conflicts, and preserves the existing layout. Development
requests now use a same-origin proxy so isolated verification cannot contact
the normal backend on port 8080. The full gate also checks synthetic login and
project access through that proxy with the browser Origin header.

The frontend suite passed all 77 Angular tests and three proxy tests, including
a repeat inside the full gate. The production Angular build passed in about
80 seconds, retaining existing CommonJS optimization and stylesheet-budget
warnings. The full gate also passed eight schema guards, 18 manifest-review
tests and 18 runner regressions, followed by all 123 backend tests with zero
failures, errors or skips. Runtime image building is underway; reviewed
upgrade/recovery and rendered-browser verification remain pending for the final
combined state.

Independent review identified a recovery-test comparison between IDs from
different databases. Correct it to compare IDs within the restored database
after the current frozen-source run finishes, then verify the corrected test.

The combined run passed direct/proxied login and project smoke, account-security
smoke, all 17 native PostgreSQL checks and 13 migration/recovery checks. It then
failed with HTTP 500 when listing the upgraded restored legacy dataset. Both
legacy and restored-copy mapping/immutability checks had passed; the full gate
is therefore still incomplete. Synthetic containers/volume were removed, and
the normal developer volume remains present and untouched.

The legacy fixture contains nullable funding amounts supported by V1. Seven
Java model/projection/response fields incorrectly use primitive `int`.
Ten focused regressions all failed before changes, including null-unboxing in
the JPQL constructor. The repair preserves unknown values as null, not zero,
without changing V1. The recovery ID comparison is now within the same restored
database, and the rehearsal explicitly checks legacy null numeric API values.
All ten focused regressions then passed after the seven fields changed to
`Integer`. The isolated backend/database gate is being repeated against the
complete current source; the focused result alone does not close Goal 4.

The subsequent full backend suite ran 133 tests: the ten new regressions passed,
but two historical contract tests still required an omitted funding amount to
be zero. Those assertions and the API documentation now explicitly preserve
null for unknown funding amounts; numeric zero remains a separate valid value.
The backend/recovery gate is being repeated with this documented correction.

That repeat passed all 133 backend tests and 14 recovery checks, including
restored legacy listing and numeric child details with null values preserved.
The next real API check exposed `ConcurrentModificationException` when a status
change copied a persisted snapshot. Association traversal by generated entity
equality/hash/string methods is under investigation; no history-goal closure is
claimed. The disposable stack and volume were removed successfully.

Fifty-four focused cases (18 relationship fields across equality, hashing and
string conversion) all failed against the unchanged entity classes when lazy
associations were guarded against traversal. The scoped repair excludes only
those associations from generated object methods; mappings and stored fields
remain unchanged. Real PostgreSQL status-version copying must still pass after
the focused checks turn green.
All 54 cases subsequently passed with relationship exclusions on the 18 fields.
The backend/database gate is being repeated against the complete source; no
database-operation success is inferred from the focused object-method tests.

### Goal 4 closure

On 2026-09-09 (local time), the complete backend-only CI-style gate passed:
187 backend tests with zero failures/errors/skips, eight schema guards,
18 mapping-review tests, 18 runner regressions, 17 native PostgreSQL checks and
18 migration/recovery checks. Real API checks covered reviewed identity/order,
unknown attribution, legacy null numeric values, rename, simultaneous append
conflicts, status snapshots, distinct cloned children and archive retention.
These operations passed again after restoring the final versioned-schema backup.
Backend restart, login/current-user/project persistence and cleanup passed.
The final schema fingerprint is
`78c9db34fca012f9ae804c9431ad01933997c00e3c03df0b1ba519a8b72efd73`.
This run deliberately excluded frontend checks and did not touch the developer
volume. Goal 5 remains active until browser and combined final gates pass and
the implementation is committed locally with a clean worktree.

### Goal 5 browser checkpoint

The disposable browser stack on 127.0.0.1:62003 verified administrator login,
complete project creation (including blank optional OTR and numeric funding
values), persisted latest-list display, a status change to ACCEPTED and history
containing both ACCEPTED and the original SUBMITTED snapshot. Browser error
logs were empty. The earlier OTR advance problem did not reproduce with keyboard
activation; no speculative OTR logic change was made.

Independent review found that the Done header could bypass successful saving.
Browser editing also exposed the legacy readonly project-name restriction.
The create/update overview now gates completion on server success, and project
name is editable while append requests retain UUID and expected version.
Three regressions were added. The staged offline frontend image passed all 80
Angular tests and three proxy tests; rebuilt-browser verification is pending.
All 36 mapping-review and verification-runner tests also passed. The existing
design is unchanged; the narrow browser panel exposes
legacy horizontal overflow, while the desktop history view renders correctly.

The synthetic browser project `startrack_verify_c9b2686c73ce9f9e` is temporarily
stopped for frontend testing, with its disposable data retained for continuation.
The normal developer volume remains untouched. Goal 5 is not complete.

An explicitly network-disabled production build generated application bundles
but failed during index generation because the legacy index fetched Google
Fonts. Both Roboto and Material Icons were already bundled in angular.json.
The duplicate external links are removed without changing those local font
styles or dependencies. A local-assets regression now guards this arrangement,
and the production-build step of the shared gate runs with network disabled.
The updated frontend must pass a new staged build and browser check.

The revised image passed all 80 Angular tests and four proxy/local-asset tests
offline. All 18 mocked runner regressions passed again, now including an explicit
assertion that production building is network-disabled. The offline production
build then passed in 109 seconds, with unchanged CommonJS and stylesheet-budget
warnings. Git worktree comparisons are slowly progressing through cloud-backed
file reads; they are not yet evidence of a clean worktree.

### Rebuilt browser verification

The final frontend image (`065bccf84010a5902aface4c38ce6447b541f3e35eb6319d2affadab5a91c08c`)
passed real-browser creation, persisted latest-list display, editable rename,
successful append, and two-tab stale-save rejection with the explicit conflict
message and draft retained. History contained exactly the original, status and
rename snapshots; rejected stale saves added none. Archive removed the project
from the active list while retaining all three historical rows; selected archived
rows disabled edit, status and archive controls. A fresh create on this image
kept Done disabled before saving and advanced to Done after the API succeeded.

Anonymous profile/admin access was denied. A separately provisioned synthetic
ROLE_USER account could create a project draft and view its own populated
profile, saw no admin navigation, and could not reach either administrator route
by direct URL. The retained desktop design rendered without an application error
overlay. The old tab logged development-server reconnection events during the
intentional restart; the fresh second session reported no console errors.
At a 390px viewport the profile body remained 620px wide: legacy horizontal
overflow is recorded, not claimed fixed or mobile-ready in this backend phase.

Browser tabs were closed and viewport overrides reset. The disposable browser
containers and synthetic database volume were removed. No developer database
operation occurred. Both earlier Git whitespace checks eventually completed with
exit zero after cloud-file hydration; this is not a clean-worktree claim because
the implementation still awaits local commits. The full local gate is next.

### Combined local gate checkpoint

The combined local run passed 187 backend tests, 80 Angular tests, four
proxy/local-assets tests, the offline production build, direct and proxied
application smoke tests, account-security checks and 17 native PostgreSQL checks.
It then failed on a closed HTTP socket during the first recovery fixture POST;
the full gate is not passed. The rehearsal mixes synchronous filesystem/Docker
work with pooled HTTP connections, and cloud-backed file reads can block for
long periods. Transport handling is under investigation without retrying writes.
Failure cleanup removed the synthetic stack and volume; the normal developer
database remained stopped and preserved.

An independent worker-server regression reproduced the stale pooled socket
failure on five consecutive runs while the client event loop was synchronously
blocked. Recovery HTTP requests now explicitly close connections, avoiding idle
socket reuse without retrying ambiguous writes. This is rehearsal-only; the
application transport and API contracts are unchanged. Permanent regressions
cover preserved request options, writes after a synchronous pause, no retry
after a dropped write and cancellation. Every gate mode runs these tests.
The full combined gate must pass again before Goal 5 can close.

The repeated complete `./scripts/test-local.sh` passed on 2026-09-09 with
187 backend, 80 Angular, four proxy/local-assets, eight schema, 18 mapping-review,
four transport and 18 runner tests; the offline production build passed in
74 seconds. Direct/proxied smoke tests, account security, 17 native PostgreSQL
checks, all 18 migration/recovery checks, backend restart and retained project
data passed. The command exited zero with `Local verification and cleanup passed.`
The disposable project was `startrack_verify_8b451845ec5635e3`; no developer
database operation occurred. Staged whitespace and scope checks passed; a
limited common-credential-pattern scan found no matches, not a whole-history
security certification. Signed implementation commit and clean-checkout CI-style
verification are the remaining Goal 5 steps.
