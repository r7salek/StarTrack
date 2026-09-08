# Current API inventory — Phase 3 checkpoint 1

Recorded 2026-09-07 from the Phase 2 source plus the foundation-review fixes.
This describes inherited behaviour, not a redesigned API. It inventories all
34 application-controller routes. Framework error handling and dormant OAuth
routes are not application contracts. No framework or API version was changed.

The authoritative implementation is in
[resources](../backend/src/main/java/com/star_track/star_track/starTrack/resource/),
[authentication controllers](../backend/src/main/java/com/star_track/star_track/starTrack/registration/controller/),
[DTOs](../backend/src/main/java/com/star_track/star_track/starTrack/dto/) and
[authentication DTOs](../backend/src/main/java/com/star_track/star_track/starTrack/registration/dto/).

## Client base URLs and verification boundary

The development frontend is compiled with API base `http://127.0.0.1:8080`.
The production build uses `/backend`, which would require an appropriately
configured reverse proxy; this local baseline does not provide a production
deployment. The isolated quality gate probes frontend readiness and sends its
synthetic API requests directly to the isolated backend port. It does **not**
exercise login/project creation by clicking through that temporary frontend.
Do not use the temporary frontend as a browser end-to-end environment until
its API base is configured to target the same isolated stack.

## Authentication and account routes

Use `Authorization: Bearer <token>` on protected requests and
`Content-Type: application/json` for JSON bodies. `USER` and `ADMIN` below mean
`ROLE_USER` and `ROLE_ADMIN`. Administrator does not implicitly mean every
other role: the bootstrap administrator has both roles.

| Method and route | Access | Input / successful response |
| --- | --- | --- |
| POST `/api/auth/signin` | Public | `{email,password}` → `JwtAuthenticationResponse` with `accessToken` and `user` |
| POST `/api/auth/signup` | Public | `SignUpRequest` → `{success,message}`; account starts disabled with USER role |
| GET `/api/all` | Public | Public text readiness response |
| GET `/api/user/me` | USER | `UserInfo` for the authenticated account |
| GET `/api/user` | USER | User-content text response |
| GET `/api/admin` | ADMIN | Administrator-content text response |
| GET `/sybeUser/all` | ADMIN | `User[]`, excluding passwords and roles |
| GET `/sybeUser/userData` | ADMIN | `UserManagementResponse[]`, with role names merged per user |
| GET `/sybeUser/{id}` | Own ID, including administrators | `User`, excluding passwords and roles |
| DELETE `/sybeUser/delete/{email}` | ADMIN | Exact email lookup; 200 with empty body after deletion |
| PUT `/sybeUser/activate/{email}` | ADMIN | Exact email lookup; updated `User` |
| PUT `/sybeUser/roleUpdate/{email}/{role}` | ADMIN | Role-name path list (for example `ROLE_USER,ROLE_ADMIN`); updated `User` |
| POST `/sybeUser/profileUpdate/{id}` | Own ID | `UserManagementResponse`; only `firstName`, `lastName`, `email` are copied; updated `User` |
| POST `/sybeUser/passwordUpdate/{id}` | Own ID | `{password}`; updated `User` with no password property |
| PUT `/sybeUser/deleteRequest/{email}` | Own exact email | Marks a request, not a deletion; update targets authenticated account ID; updated `User` |

Successful account operations currently use HTTP 200. `UserInfo` contains
`id` (a string), `firstName`, `lastName`, `email`, `roles` (string array).
`User` exposes the numeric ID, names, email, timestamps, `enabled`, `delete`,
`provider` and `providerUserId`; password and relationship fields are omitted.

Registration expects `firstName`, `lastName`, `email`, `password` and
`matchingPassword`. Nonempty names/email/matchingPassword, a minimum six-character
password and matching passwords are checked by the inherited validators.
Optional legacy DTO fields include `userID`, `providerUserId`, `socialProvider`;
these are not authority to choose an administrator role. Duplicate-email
registration returns 400. This is not yet a comprehensive validation/error schema.

Anonymous protected requests return 401, forbidden account operations 403.
Legacy state-changing GET variants return 405 for authenticated requests.
The old GET and PUT `/sybeUser/resetPassword/{email}` routes are absent (404
after authentication). OAuth is disabled and must not redirect to providers.
CORS is governed centrally by the explicit origin allowlist. See
[authorization matrix](AUTHORIZATION_MATRIX.md).

## Role routes

All four require ADMIN. `TimeSlotData` is an inherited name: its JSON here is
`{description: roleName}`, not a scheduling object.

| Method and route | Input / response |
| --- | --- |
| GET `/role/all` | `TimeSlotData[]` |
| GET `/role/details/{id}` | `Role` entity (may include related users; their password is ignored), or empty body if missing |
| PUT `/role/update/{id}` | `Role` request; service copies `name`; 202 with success text, 422 if missing, 400 on failed update |
| DELETE `/role/delete/{id}` | 200 with success text; 422 if missing, still assigned to users, or deletion fails |

## Project routes

All require authentication, but **none currently enforce project ownership or
administrator-only access on the backend**. Administrator-only frontend menus
do not change this. Project permission redesign remains explicitly deferred;
these routes must not be exposed to untrusted users or real project data.

All routes below start with `/projectCreate` and return 200 on success.

| Method and suffix | Request / response |
| --- | --- |
| GET `/allData` | `ProjectDataResponse[]`, newest creation timestamp first |
| GET `/allDatalatest` | Same DTO; maximum creation timestamp per project name |
| GET `/allDataHistroy/{data1}` | Same DTO; `data1` is the exact project name; excludes the latest timestamp; spelling is intentional compatibility |
| POST `/addToProjectCreate/{email}` | `ProjectCreateDTO`; inserts a new row and related collections; empty response body, despite declared entity return type |
| DELETE `/delete/{id}` | Deletes one project row; empty response body |
| PUT `/permUpdate/{id}/{applyValue}` | Updates the stored status string; not an enforced permission policy |
| GET `/allGroupMember/{id}` | `GroupMemberRowsResponse[]` |
| GET `/allOutput/{id}` | `OutputRowsResponse[]` |
| GET `/allCollaboration/{id}` | `CollaborationRowsResponse[]` |
| GET `/allExternalAdvisor/{id}` | `ExternalAdvisorsRowsResponse[]` |
| GET `/allSubcontractor/{id}` | `SubContractorsRowsResponse[]` |
| GET `/allPPI/{id}` | `PpiRowsResponse[]` |
| GET `/allOTR/{id}` | `otrRowsResponse[]` |
| GET `/allFunding/{id}` | `FundingRowsByID[]` |
| GET `/allFundingOverview/{id}` | `FundingOverviewRowsByID[]` |

The nine detail routes take a **project row ID**, not a child-row ID.
The group-member query also projects that project ID into its response `id`;
do not assume all detail-response IDs identify child records consistently.

`ProjectCreateDTO` groups project name; PI/contact fields; TTO contact fields;
`modality` and `areaOfExpertise` string arrays plus their `Other` fields;
`readiness`, `projectBackground`, `briefDescription`; and nine collection fields:
`groupMemberRows`, `outputRows`, `collaborationRows`, `externalAdvisorsRows`,
`subContractorsRows`, `ppiRows`, `otrRows`, `fundingRows`, `fundingOverviewRows`.
Supply all nine collections, using `[]` when empty: the service iterates them
without null checks. The existing [synthetic request](../scripts/smoke-local.mjs)
is a runnable example. DTO `id` is not used to update an existing project.

The create service currently ignores the URL email, returns no created entity,
and stores list-valued modality/expertise/funding selections as stringified
lists. Extra legacy top-level funding fields exist in the DTO but the service
persists the nested funding collections. Preserve these distinctions when
defining formal request schemas; do not assume DTO field presence proves use.

`ProjectDataResponse` contains the main project/contact fields, creator/modifier
emails, creation time, status and selected fields from the first returned funding
overview. That overview query has no explicit ordering. A new funding query is
performed for each listed project (a potential N+1 performance cost).

## Remaining contract work

This checkpoint records routes and current DTO boundaries. Formal per-field
JSON schemas, timestamp representation, missing-record/error cases, all child
round trips and database-backed history/ownership behaviour are still to be
characterized. Do that before removing legacy fields, optimizing queries or
renaming routes. This document does not mark Phase 3 complete.
