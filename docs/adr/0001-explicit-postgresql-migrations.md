# Run explicit PostgreSQL migrations outside the legacy application

Status: accepted 2026-09-08 after the local compatibility and recovery gates passed.

Use a pinned, standalone Flyway image with versioned SQL instead of adding a
migration library to Spring Boot 2.5.4. This separates the migration runner's
Java requirements from the application's retained Java 11 runtime. SQL is baked
into the image to avoid the observed Docker Desktop bind-mount problem.

V1 preserves the observed tables, sequences, constraints, email-based foreign
keys and project-history semantics. It is a structural baseline, not a redesign
or a data backup. Automatic baselining and Flyway clean remain disabled.

Existing databases must be backed up, restored and structurally compared with
the baseline before an explicit baseline operation. A Flyway checksum validates
the migration file history, not arbitrary live-schema drift; both checks are
needed. Hibernate changes to validation only after fresh initialization and
populated-copy recovery pass. Recovery uses a tested backup and matching
application version rather than assuming every migration has an automatic undo.
The verified runner is Flyway OSS 13.2.0, pinned by version and image digest,
against PostgreSQL 15.19. The 11-check migration/recovery rehearsal includes an
independent Hibernate-generated schema comparison and restored-application use.

Alternatives considered: an in-process Flyway dependency risks coupling this
phase to legacy Spring/Java compatibility; continued Hibernate automatic updates
do not provide a reviewed migration history. Neither addresses the recovery gate.

Primary references checked 2026-09-08:

- [Flyway Docker](https://documentation.red-gate.com/flyway/reference/usage/flyway-docker)
- [PostgreSQL driver and SQL compatibility](https://documentation.red-gate.com/flyway/reference/database-driver-reference/postgresql-database)
- [Automatic-baseline safety warning](https://documentation.red-gate.com/flyway/reference/configuration/flyway-namespace/flyway-baseline-on-migrate-setting)
- [Migration checksum validation](https://documentation.red-gate.com/flyway/reference/commands/validate)
