# Baseline verification

Performed on 3 September 2026 against the imported public-source revisions.

| Check | Result | Notes |
| --- | --- | --- |
| Recursive source comparison | Passed | The supplied backend archive matched the public backend revision exactly. The supplied frontend archive matched the public frontend revision after excluding Git metadata. |
| `npm ci` | Passed | Installed exactly from `frontend/package-lock.json`. |
| `npm run build` | Passed | Angular production build completed successfully. It emitted CommonJS optimisation and stylesheet-budget warnings. |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Inconclusive | The initial compile failure was caused by stale test-only imports and the generated `AppComponent.title` assertion. Those defects were corrected, but the rerun stalled after initial bundle setup and was stopped after a bounded wait, without a test verdict. |
| Backend Maven build | Passed in Docker | The Java 11/Maven container completed the build. The inherited Maven configuration skips backend tests, so this is a compile/package result rather than a test verdict. |

## Docker baseline verification

Verified on 3 September 2026 using Docker Desktop on Apple Silicon:

- PostgreSQL 15 initialized an isolated `starTrack` database and `startrack`
  schema through a one-shot Compose service.
- The backend compiled in a Java 11/Maven image and started on loopback port
  8080. The Maven build still reports that backend tests are skipped.
- The Angular 16 frontend installed from the lockfile under Node 18, compiled
  successfully and served its HTML and main JavaScript bundle on loopback port
  4200.
- Public API, synthetic administrator login, authenticated user lookup, empty
  project listing and creation/listing of one synthetic project passed.
- Automated visual browser control could not load the loopback tab, so rendered
  visual inspection remains unverified even though the HTML and JavaScript
  bundle both returned HTTP 200.

Run the repeatable verification with `./scripts/smoke-local.sh`.

`npm ci` reported dependency vulnerabilities in the inherited lockfile. They are recorded as modernisation work; no broad or breaking `npm audit fix` was applied during the import.

Phase 2 should restore reliable frontend and backend test execution before any
large dependency or architecture upgrade.
