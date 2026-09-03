# Baseline verification

Performed on 3 September 2026 against the imported public-source revisions.

| Check | Result | Notes |
| --- | --- | --- |
| Recursive source comparison | Passed | The supplied backend archive matched the public backend revision exactly. The supplied frontend archive matched the public frontend revision after excluding Git metadata. |
| `npm ci` | Passed | Installed exactly from `frontend/package-lock.json`. |
| `npm run build` | Passed | Angular production build completed successfully. It emitted CommonJS optimisation and stylesheet-budget warnings. |
| `npm run test:ci` | Passed in Docker | Node 18 and headless Chromium executed 32 tests with zero failures. |
| Backend Maven tests and build | Passed in Docker | Java 11/Maven executed 16 tests with zero failures or skips, then packaged the application. |

## Docker baseline verification

Verified on 3 September 2026 using Docker Desktop on Apple Silicon:

- PostgreSQL 15 initialized an isolated `starTrack` database and `startrack`
  schema through a one-shot Compose service.
- The backend compiled, ran its security tests and started on loopback port
  8080.
- The Angular 16 frontend installed from the lockfile under Node 18, compiled
  successfully and served its HTML and main JavaScript bundle on loopback port
  4200.
- Public API, synthetic administrator login, authenticated user lookup, empty
  project listing and creation/listing of one synthetic project passed.
- Automated browser control loaded `http://127.0.0.1:4200/#/home` and confirmed
  the existing StarTrack header, signup/login controls, project-tracker content
  and imagery rendered without changing the inherited visual design.

Run the API-only check with `./scripts/smoke-local.sh`, or the complete isolated
test/build/runtime gate with `./scripts/test-local.sh`.

`npm ci` reported dependency vulnerabilities in the inherited lockfile. They are recorded as modernisation work; no broad or breaking `npm audit fix` was applied during the import.

The local Phase 2 gate passed on 3 September 2026. The matching GitHub Actions
workflow has not run remotely because this branch has not been pushed.
