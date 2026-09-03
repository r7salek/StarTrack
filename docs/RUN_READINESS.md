# Run readiness

## What is established

- The backend and frontend are consolidated in this repository and traceable to
  immutable public-source revisions.
- Historic secrets have been removed from the imported configuration.
- The backend specifies Java 11 and Spring Boot 2.5.4; the frontend specifies
  Angular 16.2 and uses its committed npm lockfile.
- The API expects PostgreSQL and the frontend's local development API base URL
  is `http://127.0.0.1:8080`.

## What is not established

This baseline has not yet been proven to start end-to-end. At the initial
inspection, the local machine had Node.js and npm but no Java runtime, Maven,
or Docker. No runtime or container dependency has been installed as part of
the import.

The source has no container definition, CI workflow, database migration tool,
or production-ready test suite. Its backend test configuration explicitly skips
the Maven test phase. It also includes legacy state-changing endpoints that
accept `GET`; do not expose it publicly before security remediation.

## Safe verification order

1. Install a supported JDK and use an isolated PostgreSQL instance with an
   empty database. Do not point it at the hosted application or its data.
2. Provide distinct local values for `STARTRACK_DB_PASSWORD` and
   `STARTRACK_TOKEN_SECRET`. Configure any OAuth provider only with a separate
   development application.
3. Run the backend's Maven wrapper and record compilation and test results.
4. Run `npm ci`, then build and test the frontend using the lockfile.
5. Bring up both services locally and exercise an explicit, non-sensitive smoke
   dataset through the core project, user, and role flows.
6. Capture the resulting API contract and schema before changing behaviour.

Only after those steps should a modern runtime, a CI pipeline, containers, or
a deployment environment be selected.
