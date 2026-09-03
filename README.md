# StarTrack

> Maintenance and modernisation baseline — **not yet operationally validated**.

StarTrack is an OTR project and impact tracker associated with the Cambridge–LMU
STAR-Track collaboration. This repository places the verified public backend
and frontend in one maintainable codebase, with source attribution, no copied
operational data, and no live credentials.

## Repository layout

| Path | Contents | Baseline stack |
| --- | --- | --- |
| `backend/` | API, user management and project-tracking persistence | Java 11, Spring Boot 2.5.4, JPA, PostgreSQL |
| `frontend/` | Browser interface | Angular 16.2, TypeScript, Angular Material and DevExtreme |
| `docs/` | Provenance, run readiness and staged modernisation plan | — |

## Current state

The imported code has been matched to the public upstream revisions documented
in [the provenance record](docs/UPSTREAM_PROVENANCE.md). It has **not** been
connected to a database, deployed, or tested against the live StarTrack
service. The initial import replaces historic database passwords and token
material with environment-variable references before the code enters this
repository.

Start with [run readiness](docs/RUN_READINESS.md), then work through the
[modernisation plan](docs/MODERNISATION_PLAN.md) and the
[baseline verification record](docs/BASELINE_VERIFICATION.md). Do not use a production
database, user directory, or OAuth application during baseline verification.

## Licence and attribution

The imported code is under the [MIT licence](LICENSE), with CPC-M bioArchive
Munich attribution. The upstream source repositories are
[backend](https://github.com/SchubertLab/star-track) and
[frontend](https://github.com/SchubertLab/star-track-webfrontend). Full import
provenance is retained in [NOTICE](NOTICE).
