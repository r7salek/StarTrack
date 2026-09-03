# Run readiness

## What is established

- The backend and frontend are consolidated in this repository and traceable to
  immutable public-source revisions.
- Runtime secrets are externalised. The legacy PID credential in the first
  consolidated commit still requires revocation by its owner; see
  [security notes](SECURITY.md).
- Remote PID lookup is opt-in and disabled by default.
- The backend specifies Java 11 and Spring Boot 2.5.4; the frontend specifies
  Angular 16.2 and uses its committed npm lockfile.
- The API expects PostgreSQL and the frontend's local development API base URL
  is `http://127.0.0.1:8080`.
- Backend and frontend tests now run in Docker, and one shared command exercises
  tests, builds and a fresh isolated runtime stack.
- Critical account operations have explicit administrator or self-only rules;
  see [the authorization matrix](AUTHORIZATION_MATRIX.md).

## What is not established

The Docker baseline has now been proven to start end-to-end using PostgreSQL
15, Java 11 and Node 18 images. Native Java, Maven and PostgreSQL installations
are not required. The services bind to loopback ports only and use generated
local credentials plus synthetic data.

The source now has a local Docker Compose definition and a GitHub Actions
workflow, but the remote workflow has not run because this branch is unpushed.
There is still no database migration tool or production-ready test coverage.
Project-level permission rules and dependency upgrades remain unresolved; do
not expose it publicly.

## Safe verification order

1. Generate local synthetic values with `./scripts/init-local-env.sh`.
2. Run `./scripts/test-local.sh`; it uses a separate Compose project and
   temporary PostgreSQL volume.
3. Review the test, build and smoke results before accepting a change.
4. Capture the API contract and schema before changing database behaviour.

Only after those steps should database migrations or runtime upgrades begin.
