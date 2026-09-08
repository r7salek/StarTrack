# Observed PostgreSQL model — Phase 3 checkpoint 1

Later checkpoint (2026-09-08): the migration baseline and recovery rehearsal are
implemented; see [Phase 3 evidence](PHASE3_PROGRESS.md). The 22 application tables
and 22 sequences are retained; managed databases add Flyway's separate history
table. Actual JPA deletion was characterized: it removes a project and its join
rows but retains the child records, including shared children. Project deletion
is therefore not full removal of associated records. This behavior is preserved,
not redesigned, by the baseline.

Recorded 2026-09-07 from the running local synthetic baseline and current Java
entities. The read-only catalog inspection found **22 tables and 22 sequences**.
The accompanying [schema-only snapshot](database/observed-schema.sql) records
column types, defaults, sequence definitions, primary/foreign/unique keys.
It contains no application rows, credential values or sequence positions.

This is evidence for a migration baseline, **not an approved migration or data
backup**. No migration runner has been introduced; `ddl-auto=update` remains
unchanged until fresh-database and backup/restore rehearsals pass.

## Database and initialization

- Database/catalog name: `starTrack` (case-sensitive spelling).
- Application schema: `startrack`; PostgreSQL observed version: 15.19.
- Compose starts PostgreSQL, then `db-init` creates the schema if absent, then
  Hibernate creates/updates tables and opt-in bootstrap creates synthetic roles
  and administrator. Neither a remote PID dispatcher nor SSO is required.
- All 22 tables live in `startrack`. The extra
  `public.seq_name_generated_in_db` sequence means a snapshot limited only to
  `startrack` would miss an observed object associated with inherited mappings.
- Java class/annotation names are not always physical names: `projectCreate`
  becomes `project_create`; PI acronyms create names such as `emailpi`.
- The schema is explicitly PostgreSQL-specific. H2 is not an interchangeable
  test substitute. The database volume must be preserved during verification.

## Entities and relationships

| Entity / table | Purpose and important relationships |
| --- | --- |
| `User` / `user` | Account identity, credentials, activation/deletion-request flags, timestamps, optional provider fields |
| `Role` / `roles` | Role names; many-to-many with accounts through `user_roles` |
| `ProjectCreate` / `project_create` | One recorded project submission/version, PI/contact metadata, descriptions and status |
| `GroupMemberRows` / `group_member_rows` | Group-member identity, position, department, email, CRSID, notes |
| `OutputRows` / `output_rows` | Output kind, quantity (`bigint`), description (`text`), confirmation |
| `CollaborationRows` / `collaboration_rows` | Collaborator kind/name/email/location/notes |
| `ExternalAdvisorsRows` / `external_advisors_rows` | Advisor, organization, expertise, meeting time, outcome |
| `SubContractorsRows` / `sub_contractors_rows` | Subcontractor identity, organization, expertise, notes |
| `PpiRows` / `ppi_rows` | PPI group/contact, meeting time, outcome |
| `OtrRows` / `otr_rows` | OTR team member, role, funding, date, notes |
| `FundingRows` / `funding_rows` | Funding sources, schemes, integer value, dates, aims, grant/Worktribe references |
| `FundingOverviewRows` / `funding_overview_rows` | Separately stored funding-overview equivalents; not a database view |

Each of the nine child tables is connected to `project_create` by its own
`project_create_<child_table>` join table. The Java relationships are sets and
many-to-many, not database-enforced one-to-many ownership. Every join table has
a two-column composite primary key and two foreign keys. `user_roles` is the
tenth join table. There is no dedicated project-to-user permissions table.

Account, role and project IDs are `bigint`; child IDs are `integer`. All are
generated. The snapshot also contains inherited defaults/sequences on the
child-ID columns of project join tables; preserve and investigate these instead
of quietly simplifying them in the first migration.

## Integrity and ownership findings

1. `user.email` is unique, nullable and case-sensitive in the observed schema.
   Application lookup also uses exact equality. It is not a case-folded identity.
   The foundation review therefore makes deletion requests check the exact
   authenticated email and update the authenticated user's permanent ID.
2. `project_create.apply_user` and `modify_user` reference **user.email**, not
   user.id. The foreign keys have no cascading update/delete clauses. Existing
   linked projects can therefore prevent email changes or account deletion.
   Changing email normalization or account keys requires a dedicated data review.
3. Creator/modifier relationships are metadata, not authorization. Their
   presence is not evidence that every write records an owner or checks one.
   The current create service accepts but does not use its URL email.
4. History is inferred from repeated `project_name` and `created_date`, without
   a stable project-family ID or version number. Identically named independent
   projects can be grouped together; tied timestamps can return multiple latest
   records. Null names/timestamps and rename behaviour need characterization.
5. Most business fields are nullable; status is a string without a database
   enumeration/check constraint. Funding values are integers with no explicit
   currency column. Timestamps are without time zone. These are observed facts,
   not validated product requirements.
6. Multi-select values are stored as stringified Java lists, not normalized
   rows or JSON. Their current encoding must be preserved during baselining.
7. Join-table keys prevent duplicate pairs but permit shared child rows. JPA
   cascade behaviour and orphan handling require real PostgreSQL tests before
   project deletion or persistence mappings are changed.

## Snapshot provenance and limits

Capture command (read-only):

```sh
docker compose exec -T db pg_dump -U postgres -d starTrack \
  --schema-only --schema=startrack --schema=public --no-owner --no-acl --no-comments
```

The captured dump's random `\restrict`/`\unrestrict` wrapper lines were omitted
from the evidence file to avoid irrelevant differences. No SQL definitions were
redesigned. The snapshot includes `CREATE SCHEMA public`, so it is deliberately
not wired into startup or presented as a safe script to apply to an existing DB.
Ownership, grants, data, sequence counters and server configuration are excluded;
a real recovery backup must address those separately.

Next Phase 3 checkpoint: characterize PostgreSQL persistence and formal API
fields, reconcile a freshly generated disposable schema with this snapshot,
then select a migration runner compatible with the retained Java/Spring stack.
Only after empty-database and existing-data-copy migration/recovery tests pass
should Hibernate switch from automatic updates to validation. No live data,
framework upgrades, project-permission redesign, UI redesign or AI connection is
part of this checkpoint.
