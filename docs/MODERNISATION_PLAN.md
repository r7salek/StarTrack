# Modernisation plan

## Phase 0 — establish a reproducible baseline

**Outcome:** a local, isolated build with a documented schema and smoke test.

- Add a repeatable local-service definition and configuration examples with no
  secrets.
- Replace automatic schema mutation (`ddl-auto=update`) with versioned,
  reviewed database migrations.
- Enable meaningful backend tests; add frontend and API smoke tests around the
  current behaviour before refactoring it.
- Generate an API and data-model inventory from the working baseline.

## Phase 1 — security and operational hardening

**Outcome:** an application that can be assessed for controlled internal use.

- Eliminate state-changing `GET` routes and add method-level authorisation.
- Review role boundaries, registration, password-reset and account-lifecycle
  flows; add audit logging for significant data changes.
- Externalise every secret and environment-specific setting; add dependency
  scanning, a CI build, test gates and software-bill-of-material generation.
- Define backup, retention, access, incident and support ownership before any
  deployment decision.

## Phase 2 — framework and code-quality upgrade

**Outcome:** supported runtimes without losing verified business behaviour.

- Upgrade the Java/Spring stack incrementally to a supported LTS runtime and a
  supported Spring line, addressing the Jakarta migration as a separately
  tested change.
- Update the Angular stack in compatible increments, remove unused packages,
  tighten TypeScript checks and address accessibility and responsive behaviour.
- Simplify the frontend-to-API contract, centralise errors and validation, and
  add observability that excludes sensitive project content.

## Phase 3 — product improvements

**Outcome:** high-value workflow changes based on observed user needs.

- Improve project updates, history, reporting/export, ownership and structured
  validation only after a prioritised requirements review.
- Build a clear data dictionary and permissions model before adding new fields
  or reporting calculations.
- Pilot changes using synthetic or suitably approved data, with acceptance
  criteria and rollback capability.

## Phase 4 — AI-assisted interface (future, gated)

**Outcome:** assistive search and drafting that never silently changes records.

- Begin with permission-filtered retrieval over approved records, returning
  citations/links to the underlying entries.
- Treat suggested new or amended entries as drafts requiring authenticated human
  review, validation and explicit submission.
- Log model, prompt class, sources, output and reviewer decision; do not send
  project data to an external model provider without an approved data-flow and
  supplier assessment.
- Measure usefulness, error rate, access-boundary adherence and operational
  impact before expanding scope.

## Current decision gates

No deployment, production-data migration, or AI connection is authorised by
this code import. The immediate next gate is a successful isolated baseline
build plus an agreed data, access and operational ownership model.
