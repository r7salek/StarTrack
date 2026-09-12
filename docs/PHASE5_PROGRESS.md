# Phase 5 — UI modernisation

Status: **complete locally**. Changes are uncommitted; no push, merge or deployment is included.

| Checkpoint | Acceptance | Status |
| --- | --- | --- |
| 1. Visual foundation and landing page | Cambridge theme, retained logos, verified attribution, responsive public entry and account guidance; frontend tests/build and browser review | Passed |
| 2. Shared project overview | Approved-user overview, latest-version status counts, search/filter/pagination, details/history and retained management visibility | Passed |
| 3. Existing workflows | Clearer project forms and account screens; validation, retained conflict drafts, unsaved-change protection and no payload changes | Passed |
| 4. Full verification | Complete local quality gate, responsive/keyboard browser checks and documentation | Passed |

## Boundaries

- Branch from merged main `3a44d0be787976bedf3d0da0087233fa703d5292`.
- Retain Angular 16/component libraries and locally bundled fonts.
- Cambridge palette: https://www.cam.ac.uk/brand-resources/guidelines/colour
- Preserve original and isolated-preview database volumes. No original database adoption.
- Project APIs remain shared among authenticated users. Administrator-only UI actions are not a backend permission boundary.
- SharePoint PI/project import, AI, framework upgrades, deployment and project ownership design are deferred.
- Public illustrative data must be labelled synthetic and never query project APIs.
- The upstream identifier `zaheer004` is verified; do not invent a full name or individual university affiliation.

## Execution notes

2026-09-12: persistent Phase 5 goal activated. Review the landing/workspace visual direction before restyling all forms. Original database remains untouched.

### Checkpoint 1 implementation

- Replaced the background-image landing page with Cambridge-themed introduction, clearly synthetic overview, first-use guidance and retained institutional logos.
- Verified `lmu.jpg` is the NIHR Cambridge Biomedical Research Centre logo and corrected its alternative text.
- Added a routed sign-in page and repaired routed registration's optional dialog dependency; registration retains the activation-pending confirmation.
- Removed the external sign-in avatar, prevented duplicate authentication requests, retained form errors on failed sign-in and added keyboard focus helpers.
- Independent read-only review identified main-content and invalid-field focus gaps; both addressed with regression tests.
- Four proxy/local-asset tests pass. Both the cold Docker Angular test run and the reduced-worker (`NG_BUILD_MAX_WORKERS=2`) rerun timed out at 300 seconds before browser tests executed. Mac memory-pressure inspection found approximately 12 GB swap in use. No test failures were reported, but no browser tests executed: this is not a passing checkpoint. Stop heavy retries until resource pressure is reduced; production build and browser review remain pending.
- Existing registration name-length and email-format restrictions remain unchanged; email aliases/long top-level domains need a separately reviewed validation change.
- The latest staged source passes TypeScript checking (`tsc -p tsconfig.spec.json --noEmit`) in a network-disabled, 1 GB Node-heap container. This checks application/spec types, not Angular template rendering or test assertions.
- All verification containers stopped and self-removed. Preview containers were not started. The staged source in `/private/tmp/startrack-phase5-ui.SvRhPpop` and test image `startrack-frontend-test:phase5` are retained for the next checkpoint attempt; they contain no environment secrets.

### Verification resumed

- Disabling test source maps (an installed Angular option, not a test exclusion) allowed **94/94 frontend tests to pass** inside the unchanged 300-second timeout with two compiler workers. Browser assertions and test coverage selection are unchanged. The permanent `test:ci` command now uses this setting, while ordinary `npm test` retains debugging source maps.
- New overview source includes a shared authenticated route, guarded legacy redirect, latest-version deduplication, status/search counts, sorting/pagination and existing dialog integration. Ordinary-user history is explicitly read-only; backend permission semantics remain unchanged. New regression tests await the refreshed image build.
- The refreshed staged image passes **114/114 Angular tests plus all four proxy/local-asset tests**, with network access disabled. This includes rendered overview filtering, pagination, loading/error handling and administrator visibility, plus archived-history regression tests. Production build and visual verification are the next gates; the complete phase is not yet finished.
- The first production build passed (4.45 MB raw initial bundle; existing CommonJS warnings and stylesheet warnings below the error limit). Browser review confirmed the landing page, sign-in, retained synthetic project and status filtering. Landing and overview both fit a 390 px viewport without document overflow. Route focus scrolling the header out of view was identified and corrected in source; this correction awaits the refreshed preview.
- Preview launch initially waited for compilation. A preview-only `ng serve --source-map=false` attempt was rejected by Angular and removed; this flag remains supported only on the test runner. The supported development command now uses two compiler workers. Preview login succeeded after readiness. No database reset or credential change was needed.
- The next staged snapshot passes **128/128 Angular tests plus four proxy/local-asset tests**, including draft-safety and history/status tests and the shared project-form layout compilation. Subsequent details/account polish and edit-loading protection require another verification run.

### Checkpoint 3 implementation

- Shared responsive project-form layout replaces fixed tile geometry and removes leaking white input-text styles. Field bindings and save payloads are retained.
- In-memory unsaved-change protection covers create/edit navigation, explicit editor close, browser unload and sign-out. Pending saves block departure; no drafts are stored in browser storage.
- History now identifies stored versions and account attribution; status updates have clearer language and pending/error feedback.
- The isolated preview frontend is temporarily stopped during heavier test runs. Both persistent database volumes are retained; the normal developer stack remains stopped.
- The integrated snapshot passes **137/137 Angular tests and four proxy/local-asset tests**. This includes the account changes and edit-loading gate. A protected API 401 now clears expired credentials without forcing a reload after a cancelled unsaved-draft guard; Cancel/Discard regression paths are covered.
- A later full-repository `git diff --check` stalled during cloud-backed file reads and was safely terminated after six minutes. Subagent scoped diff checks passed, but the full diff check must be retried before handoff. No files were reverted or removed by terminating that read-only process.

### Integrated browser verification

- A scoped `git -c core.fsmonitor=false diff --check -- frontend docs` subsequently passed.
- Docker preview now uses the supported Angular `local-preview` configuration without source maps and with two compiler workers. Native development retains source maps; production settings are unchanged.
- Browser checks caught and fixed legacy grid-wrapper/padding conflicts, a false-positive unsaved warning on an untouched create form, and missing form controls on five stepper sections. All six create/edit sections now use their own validity; invalid Next focuses the missing field without advancing.
- Verified pristine navigation, dirty Cancel/Discard, required-field focus, loading the complete edit record, and a saved synthetic project's create → details → edit → two-version history → status change → archive journey. Status counts refreshed correctly. The archived test record remains read-only and retains its history.
- Only `Phase 5 UI Review - Synthetic` was added and modified in the isolated preview. `Synthetic Local Baseline` remains unchanged and active. Neither persistent volume was reset or removed.
- Profile loading/edit-dialog cancellation and administrator pending/active account views were checked without changing credentials or permissions. Ordinary-user/admin route and control differences are covered by automated tests; an ordinary-user browser login has not been performed.
- Mobile editor at 390 px and tablet at 768 px showed no document overflow. Landing and overview were previously checked at 390 px. Desktop editor/details and keyboard validation focus were checked at 1280 px.
- Required collaborator/output choices now explain validation errors; entered-character counters use the accurate label `Characters used`. An archived-table accessibility caption is corrected.
- Full `scripts/test-local.sh` gate is running with isolated synthetic resources. Preview frontend/backend are paused to reduce memory pressure and will be restored afterwards. Final integrated counts/build/gate outcome remain pending.
- The gate's intermediate snapshot passed **138 Angular tests and six Node proxy/asset contracts**, followed by a production build (4.48 MB raw initial bundle, 841.26 kB estimated transfer). Existing CommonJS warnings and two component stylesheet warning budgets remain below error limits.
- That gate was deliberately cancelled during stalled cloud-backed backend source staging (exit 143, cleanup completed, no verification database had started). Its frontend results remain valid for that snapshot, but this was not a completed full gate. Final verification is being staged from merged `HEAD` plus the current frontend into a local temporary directory, excluding private environment files, to avoid repeated cloud-file hydration waits.
- Independent final review found two save-lifecycle paths needing protection: pending saves allowed new edits, and returning to Review by its header could reuse stale assembled values. Both editors now become inert during a save with an accessible external status, rebuild current values on review entry and submission, validate all six forms, and retain cleared optional values accurately. Delayed-response/current-form regressions were added; independent read-only re-review found no new defects. This later snapshot still requires the final test/build run.

### Final quality gate — passed

- The final reviewed snapshot passed **141/141 Angular tests** and **6/6 Node proxy/asset contracts**, both standalone and again in the full gate. The Angular runner retained its 300-second limit and network-disabled container.
- `scripts/test-local.sh` completed with exit 0 from the local staging copy, project `startrack_verify_9ac5e5c57eb52db5`. Staging used merged HEAD plus the current frontend; `git diff --name-only HEAD -- backend scripts compose.yaml database` subsequently confirmed those non-frontend inputs are unchanged.
- Final production build passed: **4.48 MB raw initial bundle / 841.41 kB estimated transfer**, build hash `c5545f3b21491fdf`. Existing CommonJS warnings and the landing/overview component stylesheet warnings remain below error limits; no budget was relaxed.
- Backend: **187 tests, zero failures/errors/skips**. Shell/Node gate checks passed (8 schema, 18 history-mapping, 4 HTTP rehearsal, 18 isolation/cleanup tests). Runtime login, current-user lookup and project create/list passed directly and through the frontend proxy. Security smoke checks passed.
- PostgreSQL characterization: **17 checks passed**. Migration/recovery/history rehearsal: **18 checks passed**. Backend restart, login and project persistence passed. The gate reported `Local verification and cleanup passed`; its disposable stack/volume were removed.
- Final `git diff --check -- frontend docs README.md` passed after slow cloud-backed reads. No backend, schema, dependency-version or API-contract changes were made in this phase.
- Final preview image is `startrack-frontend:preview-phase5` (`4f2226258c4a25a4af171b16aa32c730ea9eac225ef77d5acb5ac5cad1500212`), identical to the gate's runtime frontend image. No live-container source overlay is required. No commits or pushes have been made.
- Preview restored at http://127.0.0.1:4201/#/home with the retained Phase 4 backend. Final browser checks verified the landing/overview, archived synthetic history with all three versions after restart, required-field focus and pristine navigation. Final landing at 390 px has no document overflow; temporary viewport override was reset. No new console errors were recorded during this final pass.
- Docker inspection confirmed only the original `startrack_startrack-postgres` and preview `startrack_preview_startrack-postgres` retained volumes remain for StarTrack; the final gate's containers/volume are gone. Preview frontend/backend/database are intentionally left running for review. Normal developer stack remains stopped.
- All subagent work and verification sessions are finished. Final repository status contains only Phase 5 frontend, README and documentation changes on `codex/ui-modernisation`. This is local verification, not a GitHub Actions run or deployment.

### Post-phase acceptance fix — rejected account requests

- User acceptance testing exposed a pending-list filter defect: rejected accounts were disabled but still matched the disabled-only filter. Pending accounts now require both `enabled === false` and `delete === false`; rejected records are retained without being offered for approval again.
- Rejection has explicit confirmation/success/error wording and refreshes the list after a successful response instead of reloading the page. The existing backend endpoint and stored account state are unchanged.
- Five regression tests cover pending filtering, confirmed rejection and refresh, response timing, and failure handling. The complete network-disabled frontend suite passed **146/146 Angular tests and 6/6 Node contracts**.
- Production build passed (hash `0555dad170407db8`, 4.48 MB initial bundle, 841.52 kB estimated transfer). An initial concurrent build was killed with exit 137; rerunning with the preview paused and two workers passed. Existing warning budgets were not changed.
- Preview frontend rebuilt as `startrack-frontend:preview-phase5` (`5ab9e0c01ea7a7756baf7f0272071285990911023adb45f723ca713216282c07`). Backend/database code and both retained database volumes are unchanged. No full backend/database gate rerun is claimed for this frontend-only fix; no commits or pushes were made.
- Browser verification reproduced the reported test account before the update, then confirmed “No accounts are awaiting approval” and `0 of 0` after reloading the rebuilt preview. A read-only database check confirmed the same record remains disabled/rejected (`enabled=false`, `delete=true`). Preview frontend/backend/database are restored and intentionally running for review.

### Release review — 13 September 2026

- The user reported that the remaining account acceptance checks all passed: requesting and approving an account, ordinary-user access without administrator controls, and deactivation blocking access. This is user-reported acceptance evidence, separate from the automated results above.
- Release review covered routing/session expiry, pending-account filtering, project overview aggregation, editor loading/save guards and retained history semantics. No additional blocking issue was identified in the reviewed changes.
- The requested release workflow is a local signed commit, push of `codex/ui-modernisation`, and a pull request targeting `main`. Merge and production deployment require separate approval. Earlier checkpoint statements about uncommitted changes describe their state at the time.
