# Baseline verification

Performed on 3 September 2026 against the imported public-source revisions.

| Check | Result | Notes |
| --- | --- | --- |
| Recursive source comparison | Passed | The supplied backend archive matched the public backend revision exactly. The supplied frontend archive matched the public frontend revision after excluding Git metadata. |
| `npm ci` | Passed | Installed exactly from `frontend/package-lock.json`. |
| `npm run build` | Passed | Angular production build completed successfully. It emitted CommonJS optimisation and stylesheet-budget warnings. |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Inconclusive | The initial compile failure was caused by stale test-only imports and the generated `AppComponent.title` assertion. Those defects were corrected, but the rerun stalled after initial bundle setup and was stopped after a bounded wait, without a test verdict. |
| Backend Maven build and tests | Blocked | The local machine has no Java runtime or Maven. The project includes a Maven wrapper, so a compatible JDK is the next prerequisite. |

`npm ci` reported dependency vulnerabilities in the inherited lockfile. They are recorded as modernisation work; no broad or breaking `npm audit fix` was applied during the import.

The next verification run should use a suitably provisioned development
environment, complete the frontend test suite, and then run the backend Maven
wrapper against an isolated PostgreSQL instance.
