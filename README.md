# StarTrack

> Maintenance and modernisation baseline — **not yet operationally validated**.

StarTrack is an OTR project and impact tracker associated with the Cambridge–LMU
STAR-Track collaboration. This repository places the verified public backend
and frontend in one maintainable codebase, with source attribution and no
copied operational data. Runtime credentials must be supplied outside Git.

## Repository layout

| Path | Contents | Baseline stack |
| --- | --- | --- |
| `backend/` | API, user management and project-tracking persistence | Java 21, Spring Boot 4.1.1, JPA, PostgreSQL |
| `frontend/` | Browser interface | Angular 16.2, TypeScript, Angular Material and DevExtreme |
| `docs/` | Provenance, run readiness and staged modernisation plan | — |

## Current state

Phase 4 is in progress on `codex/backend-modernization`: the backend now uses
Java 21/Spring Boot 4.1.1, with safe API failures and versioned project history.
See [Phase 4 checkpoints](docs/PHASE4_PROGRESS.md) for measured test results and
remaining verification. Existing populated databases require an explicitly
reviewed identity mapping; **do not point ordinary startup at your retained
database to bypass that review**. No production deployment or push is included.

The imported code has been matched to the public upstream revisions documented
in [the provenance record](docs/UPSTREAM_PROVENANCE.md). It now runs locally
against an isolated PostgreSQL database using synthetic credentials and data;
it has **not** been deployed or tested against the live StarTrack service. The
current source replaces historic database passwords and token material with
environment-variable references. The initial consolidated commit retained a
legacy PID-dispatcher credential from the upstream source; it must be treated as
exposed and revoked by its owner. Removing it from the current tree does not
make the old credential safe.

Start with [run readiness](docs/RUN_READINESS.md), then work through the
[modernisation plan](docs/MODERNISATION_PLAN.md) and the
[baseline verification record](docs/BASELINE_VERIFICATION.md). Do not use a production
database, user directory, or OAuth application during baseline verification.

## Local Docker baseline

The isolated baseline is run through Docker Compose with generated local-only
credentials and synthetic data. Follow [local Docker development](docs/LOCAL_DEVELOPMENT.md)
for the build, start, smoke-test and stop commands.

Run the complete test, build and isolated runtime gate with
`./scripts/test-local.sh`. Account-management permissions are documented in the
[authorization matrix](docs/AUTHORIZATION_MATRIX.md).

Phase 3 builds on the [API inventory](docs/API_INVENTORY.md) and
[observed PostgreSQL model](docs/DATA_MODEL.md) with versioned migrations and
schema validation. Fresh initialization and populated-copy recovery have passed
locally. Existing unmanaged volumes require explicit, reviewed adoption;
verification does not change the normal developer database.

The Phase 3 implementation now has [field-level API contracts](docs/API_CONTRACTS.md),
a [database operations runbook](docs/DATABASE_OPERATIONS.md), and an explicit
[checkpoint and verification record](docs/PHASE3_PROGRESS.md). Consult that record
for what has actually passed before using migrations on any existing database.

## Licence and attribution

The imported code is under the [MIT licence](LICENSE), with CPC-M bioArchive
Munich attribution. The upstream source repositories are
[backend](https://github.com/SchubertLab/star-track) and
[frontend](https://github.com/SchubertLab/star-track-webfrontend). Full import
provenance is retained in [NOTICE](NOTICE).
