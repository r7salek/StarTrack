# API contracts — Phase 4 in progress

Recorded from the current controllers, DTOs, services and repository queries on
2026-09-08. This is a compatibility specification, **not a claim that the legacy
API is production-safe**. It complements [the route inventory](API_INVENTORY.md),
[authorization matrix](AUTHORIZATION_MATRIX.md) and [data model](DATA_MODEL.md).
Phase 3 established the original shapes. Phase 4 updates the failure contract
and validation rules below. Phase 4 adds permanent project IDs and version metadata;
legacy success statuses and numeric child routes remain compatible.
See [Phase 4 evidence](PHASE4_PROGRESS.md) for checkpoint status.

## Reading the contracts

- Routes are case-sensitive; preserve inherited spellings such as `sybeUser`,
  `allDatalatest`, `allDataHistroy`, `otherInforPI` and `output_description`.
- JSON requests use `Content-Type: application/json`. Protected routes require
  `Authorization: Bearer <token>`. Do not put tokens in query strings.
- `string`, `integer`, `boolean`, `date` and `T[]` below describe JSON values,
  not PostgreSQL column types. `date` responses are ISO timestamp strings with
  milliseconds and an offset; clients should send an explicit offset, for example
  `2026-01-02T03:04:05.123Z`. Java `Date` represents an instant but PostgreSQL
  stores the mapped columns without a time zone. Do not infer a business-local
  time zone, date-only semantics or sub-millisecond precision from these fields.
- Reference-valued DTO fields can be null unless a rule explicitly says otherwise.
  Missing fields normally deserialize as null; primitive integers/booleans default
  to `0`/`false`. Null response properties are included. These are binding rules,
  **not a promise that the service can safely process every null value**.
- Body-required routes reject an absent body. Signup, password changes and project
  snapshots run Bean Validation; nine project collections and their elements must
  be nonnull. Other business-field validation remains limited.
- Legacy successful mutations return `200`, except role update (`202`). “Empty” means
  no response bytes, not the JSON literal `null` and not a newly created object.
- URL-encode individual email, project-name and status path values. There is no
  pagination, version header or stable ordering unless explicitly stated.

## Retained legacy routes: 34 routes

Access: public needs no token; USER/ADMIN mean the exact `ROLE_USER`/`ROLE_ADMIN`
authority; own-ID applies even to administrators; own-email requires exact case.
The bootstrap administrator has both roles, but ADMIN alone does not imply USER.
All routes also have the shared failure behaviour described below.

| Method and complete path | Access | Input | Success | Specific failures / quirks |
| --- | --- | --- | --- | --- |
| POST `/api/auth/signin` | Public | Login | `200` Token | Invalid credentials/disabled account: authentication failure; blank fields: `400` Validation |
| POST `/api/auth/signup` | Public | Signup | `200` ApiResponse | Existing exact email or supplied existing `userID`: `409` Conflict; validation failures: `400` |
| GET `/api/all` | Public | None | `200` text `Public content goes here` | Public readiness/content route, not a database health check |
| GET `/api/user/me` | USER | None | `200` UserInfo | ADMIN without USER receives `403` |
| GET `/api/user` | USER | None | `200` text `User content goes here` | No account payload |
| GET `/api/admin` | ADMIN | None | `200` text `Admin content goes here` | No account payload |
| GET `/sybeUser/all` | ADMIN | None | `200` User[] | No role relationships or password fields |
| GET `/sybeUser/userData` | ADMIN | None | `200` UserManagement[] | Role names merged per user; output order not guaranteed |
| GET `/sybeUser/{id}` | Own-ID | Integer account ID | `200` User | Cross-account `403`; missing authorized ID: `404` |
| DELETE `/sybeUser/delete/{email}` | ADMIN | Exact email | `200` Empty | Deactivates (enabled=false, delete=true); retains identity/roles/history; missing email `404` |
| PUT `/sybeUser/activate/{email}` | ADMIN | Exact email | `200` User | Sets enabled=true; not a toggle. Missing email `404` |
| PUT `/sybeUser/roleUpdate/{email}/{role}` | ADMIN | Exact email; comma-separated role names | `200` User | Replaces role set; missing email `404`; unknown/absent roles `400` before mutation |
| POST `/sybeUser/profileUpdate/{id}` | Own-ID | UserManagement; only firstName/lastName/email copied | `200` User | Omitted copied fields can overwrite with null; uniqueness/FK conflicts `409`; authority fields ignored |
| POST `/sybeUser/passwordUpdate/{id}` | Own-ID | PasswordChange | `200` User | Does not require old password; nonblank and minimum six characters; invalid `400` |
| PUT `/sybeUser/deleteRequest/{email}` | Own exact email | Exact authenticated email | `200` User | Sets delete=true; updates authenticated immutable account ID; other email/case variant `403` |
| GET `/role/all` | ADMIN | None | `200` RoleName[] | `description`, not `name`, holds each role name |
| GET `/role/details/{id}` | ADMIN | Integer role ID | `200` Role | Missing role `404` |
| PUT `/role/update/{id}` | ADMIN | Role; only name copied | `202` text | Missing role `422`; failed post-save lookup `400`; see exact text below |
| DELETE `/role/delete/{id}` | ADMIN | Integer role ID | `200` text | Missing or assigned role `422`; see exact text below |
| GET `/projectCreate/allData` | Authenticated | None | `200` ProjectList[] | Creation date descending |
| GET `/projectCreate/allDatalatest` | Authenticated | None | `200` ProjectList[] | Latest version per permanent project ID, excluding archived projects |
| GET `/projectCreate/allDataHistroy/{data1}` | Authenticated | Exact project name | `200` ProjectList[] | Resolves one project and returns older versions; ambiguous independent projects `409`; missing name `[]` |
| POST `/projectCreate/addToProjectCreate/{email}` | Authenticated | ProjectInput; nine nonnull arrays with nonnull members | `200` Empty | No ID creates a new project; existing numeric ID appends only if current (`409` stale); actor comes from authentication, not URL email |
| DELETE `/projectCreate/delete/{id}` | Authenticated | Integer version-row ID | `200` Empty | Archives the continuing project, retains every row; missing version `404` |
| PUT `/projectCreate/permUpdate/{id}/{applyValue}` | Authenticated | Current version-row ID and status | `200` Empty | Appends copied snapshot; status SUBMITTED/ACCEPTED/REJECTED/CLOSED only (`400` otherwise); stale/archived `409`, missing `404` |
| GET `/projectCreate/allGroupMember/{id}` | Authenticated | Project-row ID | `200` GroupMember[] | Returned `id` is the project ID, not member ID |
| GET `/projectCreate/allOutput/{id}` | Authenticated | Project-row ID | `200` Output[] | Child IDs in response |
| GET `/projectCreate/allCollaboration/{id}` | Authenticated | Project-row ID | `200` Collaboration[] | Child IDs in response |
| GET `/projectCreate/allExternalAdvisor/{id}` | Authenticated | Project-row ID | `200` ExternalAdvisor[] | Child IDs in response |
| GET `/projectCreate/allSubcontractor/{id}` | Authenticated | Project-row ID | `200` Subcontractor[] | Child IDs in response |
| GET `/projectCreate/allPPI/{id}` | Authenticated | Project-row ID | `200` PPI[] | Child IDs in response |
| GET `/projectCreate/allOTR/{id}` | Authenticated | Project-row ID | `200` OTR[] | Child IDs in response |
| GET `/projectCreate/allFunding/{id}` | Authenticated | Project-row ID | `200` FundingOutput[] | Funding selection is a string, unlike input |
| GET `/projectCreate/allFundingOverview/{id}` | Authenticated | Project-row ID | `200` FundingOverviewOutput[] | Overview selection is a string, unlike input |

All nine child queries return `[]` for a nonexistent project or a project with no
matching children. They do not distinguish those cases and have no explicit order.
Phase 4 archives the permanent project without deleting versions, joins or children.
**Project endpoints have authentication but no ownership/administrator restriction.**
Frontend menus are not a security boundary; project-permission redesign is deferred.

## Permanent-ID project API: six additional routes

All six routes require authentication. Attribution is not an ownership permission.
Numeric `id`/`versionId` identify saved rows; `projectId` is the continuing UUID.

| Method and path | Success | Contract |
| --- | --- | --- |
| GET `/api/projects` | `200` ProjectList[] | Latest active version for each project |
| POST `/api/projects` | `201` ProjectVersion | Full ProjectInput; omit id/expectedVersion; new UUID and version 1 |
| GET `/api/projects/{projectId}` | `200` ProjectVersion | Latest complete snapshot; archived projects remain readable |
| GET `/api/projects/{projectId}/versions` | `200` ProjectVersion[] | Every version, newest version number first |
| POST `/api/projects/{projectId}/versions` | `201` ProjectVersion | Full ProjectInput plus positive expectedVersion; stale/archived `409` |
| DELETE `/api/projects/{projectId}` | `204` Empty | Idempotent archive, preserving history |

Unknown UUIDs return `404`; malformed UUIDs and missing expectedVersion return
`400`. Saves serialize through a database lock on the continuing project. Two
saves based on the same version cannot both succeed. A rename does not change
project identity. A same-name new project is independent.

ProjectVersion includes ProjectList fields and all nine child arrays. Funding,
modality and expertise selection output retains legacy string formatting; clients
must convert selection strings back to arrays for input. Child IDs are ignored
when saving, so each version owns freshly copied child snapshots. A status-only
save also copies all children. Archive changes root metadata, not a historical
snapshot. These Goal 4 contracts passed the complete backend/database gate,
including restore and restart, on 2026-09-09. Goal 5 browser and final combined
verification remain in progress; see PHASE4_PROGRESS.md.

## Authentication and account shapes

| Shape | Property | Type | Meaning / input rule |
| --- | --- | --- | --- |
| Login | email | string | Required, not blank; no email-format validator |
| Login | password | string | Required, not blank; credentials are never echoed in Token |
| Signup | firstName, lastName, email | string each | Required, nonempty; whitespace-only values are not rejected by `@NotEmpty` |
| Signup | password | string | Required, nonblank, minimum six characters; comparison is null-safe |
| Signup | matchingPassword | string | Required, nonempty and equal to password |
| Signup | userID | integer | Optional legacy field; if an account with this ID exists registration is rejected; not an ID-allocation request |
| Signup | providerUserId | string | Optional, ignored by local account construction |
| Signup | socialProvider | string enum | Optional legacy enum: FACEBOOK, TWITTER, LINKEDIN, GOOGLE, GITHUB, LOCAL; ignored by local account construction |
| Token | accessToken | string | Bearer token; there is no `tokenType`, refresh token or expiry field |
| Token | user | UserInfo object | Authenticated account description |
| UserInfo | id | string | Decimal account ID; deliberately different from numeric User.id |
| UserInfo | firstName, lastName, email | string each | Current names and email |
| UserInfo | roles | string[] | Authority names; do not assume list order |
| ApiResponse | success | boolean | Success/failure flag |
| ApiResponse | message | string | Human-readable result, not a stable error code |
| User | id | integer | Server-assigned account ID |
| User | firstName, lastName, email | string each | Stored names/email; email uniqueness is case-sensitive |
| User | createdDate, modifiedDate | date each | Creation/modification instants |
| User | enabled, delete | boolean each | Login-enabled and deletion-request flags |
| User | provider, providerUserId | string each | Legacy provider fields; local signup does not populate them |
| UserManagement | id | integer | Account ID |
| UserManagement | firstName, lastName, email | string each | Only these three fields are copied by profileUpdate |
| UserManagement | createdDate, modifiedDate | date each | Output metadata; ignored by profileUpdate |
| UserManagement | enabled, delete | boolean each | Output flags; ignored by profileUpdate |
| UserManagement | role_id | integer | ID from one joined role row; not an array or complete representation of a multi-role account |
| UserManagement | role | string | Role names joined with `, `; ordering is not defined |
| PasswordChange | password | string | Required, nonblank, minimum six characters; no old-password field |
| RoleName | description | string | Role name; DTO's inherited Java name is `TimeSlotData` |
| Role | id | integer | Role ID; ignored in update body in favour of path ID |
| Role | name | string | Role name; only this field is copied by update |
| Role | users | User[] | Related accounts on entity response; ignored in update body |

`User.password` and `User.roles` are excluded from serialization, including User
objects nested under Role.users. Role uses Jackson object identities; repeated
entity references within one object graph may serialize as IDs after the first
object. Do not treat role details as a stable paginated user-management API.
Local signup sets USER, enabled=false, delete=false and creation/modification
timestamps. An administrator must activate the account before normal sign-in.

Exact role-operation text:

| Operation/outcome | Status | Body |
| --- | --- | --- |
| Update success | 202 | `Role saved successfully` |
| Update missing | 422 | Safe error envelope |
| Update post-save lookup failed | 400 | Safe error envelope |
| Delete success | 200 | `Successfully deleted specified record` |
| Delete missing | 422 | Safe error envelope |
| Delete assigned role | 422 | Safe error envelope |
| Delete post-delete lookup still present | 422 | Safe error envelope |

## ProjectInput and ProjectList

These field groups enumerate every property. Each comma-separated name is a
separate property with the specified type, not a combined JSON key.

| Properties | ProjectInput type/use | ProjectList type/use |
| --- | --- | --- |
| id | Optional integer version-row ID for legacy append; forbidden on new-project API | integer, version-row ID |
| expectedVersion | Positive integer required by permanent-ID append | Not included |
| projectId, versionId, versionNumber | Server allocated, not trusted input | UUID string, numeric version-row ID, positive version number |
| createdBy, modifiedBy, archived | Server controlled | Numeric snapshot author IDs (nullable unknown legacy authorship); root archive boolean |
| projectName | string, copied | string; not an identity/grouping key |
| lastNamePI, firstNamePI, emailPI, departmentPI, crsidPI, otherInforPI | string each, copied | string each |
| ttoContractName, ttoContractEmail, ttoContractOtherInfo | string each, copied | string each; spelling is `Contract` |
| modality, areaOfExpertise | string[] each, converted using Java list-to-string | string each, e.g. `[Synthetic modality]`, **not JSON arrays** |
| modalityOther, areaOfExpertiseOther | string each, copied | string each |
| readiness, projectBackground, briefDescription | string each, copied | string each |
| groupMemberRows | GroupMember[], required non-null for safe use | Not included; separate detail route |
| outputRows | Output[], required non-null for safe use | Not included |
| collaborationRows | Collaboration[], required non-null for safe use | Not included |
| externalAdvisorsRows | ExternalAdvisor[], required non-null for safe use | Not included |
| subContractorsRows | Subcontractor[], required non-null for safe use | Not included |
| ppiRows | PPI[], required non-null for safe use | Not included |
| otrRows | OTR[], required non-null for safe use | Not included |
| fundingRows | FundingInput[], required non-null for safe use | Not included |
| fundingOverviewRows | FundingOverviewInput[], required non-null for safe use | Not included |
| funding | string[], legacy field ignored | Not included |
| fundingOther, duration, grantNumber, value, fundingNIHR, fundingNIHROther, fundingUKRIMRC, fundingUKRIMRCOther, fundingWellcomeTrust, fundingWellcomeTrustOther | string each, legacy fields ignored; top-level value is a string | Not included |
| fundingOverview, fundingOverviewOther, schemeOverview, grantNumberOverview, worktribeNumberOverview | Not accepted as active top-level create properties | string each, from the first returned overview child |
| valueOverview | Not an active top-level create property | nullable integer, from overview child; null means unknown or no overview |
| fundingOverviewStartDate, fundingOverviewEndDate | Not active top-level create properties | date each, from overview child |
| createdEmail, modifyEmail | Not active create properties | Historical email snapshots; new writes use the authenticated account, email edits do not rewrite them |
| createdDate | Not an active create property | date, assigned by server |
| applyValue | Optional allowed status; new default SUBMITTED, omitted append preserves current status | SUBMITTED/ACCEPTED/REJECTED/CLOSED; legacy imported values preserved until explicitly updated |

Use `[]` for absent child collections, not null. Child elements must be non-null.
Child input IDs are ignored; new child objects are built for every create. There
is no nested PATCH/update-by-child-ID contract. Null modality/expertise/funding
selection lists stringify to the literal string `null`; an empty list becomes
`[]`. Neither should be interpreted as normalized JSON storage.

Funding summary selection has no ordering clause and uses the first returned
overview; multiple overview children therefore do not define a stable summary.
Listing currently performs one additional overview query per project. Optimizing
this must preserve or intentionally redesign the ambiguity, not accidentally
change which record is shown. Latest/history selection uses permanent UUID and
version number rather than names or timestamps. Existing rows require a reviewed
mapping before the final schema accepts application writes.

## Child object shapes

Except funding selection types noted below, each child has the same input/output
field names. Every `id` is an integer and ignored on input; output IDs normally
identify the child, **except GroupMember.id, which is the project ID**. All string
and date properties are nullable in the DTO and lack business validation.

| Shape | String properties | Date properties | Other properties |
| --- | --- | --- | --- |
| GroupMember | lastNamePostDoc, firstNamePostDoc, emailPostDoc, departmentPostDoc, positionPostDoc, crsidPostDoc, otherInforPostDoc | None | id: integer |
| Output | output, confirmation, output_description | None | id: integer; outputQuantity: nullable integer (Java Long) |
| Collaboration | collaboration, collaborationName, collaborationEmail, collaborationLocation, collaborationOtherInfo | None | id: integer |
| ExternalAdvisor | externalAdvisorsOrganisation, externalAdvisorsName, externalAdvisorsEmail, externalAdvisorsOutcome, externalAdvisorsExpertise | externalAdvisorsMeeting | id: integer |
| Subcontractor | subContractorsName, subContractorsEmail, subContractorsExpertise, subContractorsOrganisation, subContractorsOtherInfo | None | id: integer |
| PPI | ppiContact, ppiGroup, ppiOutcome | ppiMeeting | id: integer |
| OTR | otrTeamMember, otrRole, otrFunding, otrOtherInfo | otrDate | id: integer |

### FundingInput / FundingOutput

| Properties | Type / meaning |
| --- | --- |
| id | integer; ignored on input, child ID on output |
| funding | string[] on input; Java-list-formatted string on output |
| fundingOther, fundingNIHR, fundingNIHROther, fundingUKRIMRC, fundingUKRIMRCOther, fundingWellcomeTrust, fundingWellcomeTrustOther | string each, copied without enum validation |
| scheme, schemeOther | string each |
| value | nullable integer, Java signed 32-bit; null means unknown, distinct from explicit zero; no currency or nonnegative rule |
| fundingStartDate, fundingEndDate | date each; no start-before-end validation |
| aims, grantNumber, worktribeNumber | string each |

### FundingOverviewInput / FundingOverviewOutput

| Properties | Type / meaning |
| --- | --- |
| id | integer; ignored on input, child ID on output |
| fundingOverview | string[] on input; Java-list-formatted string on output |
| fundingOverviewOther, fundingOverviewNIHR, fundingOverviewNIHROther, fundingOverviewUKRIMRC, fundingOverviewUKRIMRCOther, fundingOverviewWellcomeTrust, fundingOverviewWellcomeTrustOther | string each, copied without enum validation |
| schemeOverview, schemeOverviewOther | string each |
| valueOverview | nullable integer, Java signed 32-bit; null means unknown, distinct from explicit zero; no currency or nonnegative rule |
| fundingOverviewStartDate, fundingOverviewEndDate | date each; no start-before-end validation |
| aimsOverview, grantNumberOverview, worktribeNumberOverview | string each |

## Failure contracts and limitations

| Failure | Status / body contract |
| --- | --- |
| Unauthenticated protected request | `401`, code `UNAUTHORIZED` |
| Authenticated user fails method authority / own-account rule | `403`, code `FORBIDDEN` |
| Invalid validated input, malformed JSON, incompatible scalar type, missing body, nonnumeric ID | `400`, code `BAD_REQUEST`; safe field errors where available |
| Duplicate signup, including unique-constraint race | `409`, code `CONFLICT` |
| Unsupported HTTP method | `405` after authentication when a retained path matches; legacy state-changing GETs are not supported |
| Removed GET/PUT `/sybeUser/resetPassword/{email}` | `404` after authentication; unauthenticated requests can be rejected earlier with `401` |
| Missing requested account, project write target or role detail | `404`, code `NOT_FOUND` |
| Database integrity conflict | `409`, code `CONFLICT`; failed transaction rolls back |
| Unexpected failure | `500`, code `INTERNAL_ERROR`; no exception details |
| Unapproved CORS origin | No allow-origin permission; browser cross-origin use is denied; CORS is not authentication |

Controller and authentication/authorization failures use exactly `success:false`,
`code`, `message`, `fieldErrors` (field-name to safe-message object), and
`requestId`. The server generates the UUID and returns it in `X-Request-ID`;
caller-supplied IDs are ignored. Messages never include rejected values, SQL,
passwords, tokens, causes or stack traces. The former Throwable-shaped response
has been removed. Framework method failures preserve the `Allow` header.
CORS rejection remains a browser-origin policy response, not authentication.
Authentication filters may reject a request before controller path/method rules
run. OAuth is disabled; no provider redirect or PID/network integration is part
of this contract.

## Verification and reusable fixture

- [ApiContractTests](../backend/src/test/java/com/star_track/star_track/ApiContractTests.java)
  checks the exact 34 method/path mappings, all exposed DTO field sets, account-ID
  type distinction, omitted password/role relationships, null/default values,
  input/output funding-selection type difference and Boot/Jackson timestamp
  serialization. It starts only the JSON slice, not the app, database or OAuth.
- Existing AccountSecurityTests and the isolated security smoke check verify the
  authorization boundaries and removed reset routes. Route reflection and JSON
  tests are not substitutes for those HTTP/security checks.
- [project-with-children.json](../scripts/fixtures/project-with-children.json)
  is a synthetic payload with every persisted scalar and one record in each of
  the nine collections. It contains no production records, credentials or tokens.
  Override its projectName for independent test runs. Submit it only to an
  explicitly isolated disposable verification backend, not an arbitrary URL.
- Real PostgreSQL round-trip and recovery tests must additionally verify generated
  IDs, all nine child links, timestamp values, history queries and relationship
  constraints. The migration/recovery gate records that evidence separately.
- [test-postgres-baseline.mjs](../scripts/test-postgres-baseline.mjs) provides 17
  native PostgreSQL checks against a randomly named, network-isolated disposable
  container. It verifies the 22-table/22-sequence baseline, email case/null and FK
  behaviour, nine shared-child joins, user-role constraints, transaction rollback,
  sequence gaps/progression and custom-format backup/restoration of all records,
  constraints, sequence state and explicit grants. All 17 passed offline on
  2026-09-08, and the disposable container was removed. Its grant rehearsal uses a
  pre-existing cluster-global role; it does not claim database dumps create roles
  or that native SQL tests exercise JPA cascading, API history or HTTP behavior.

This document specifies current shapes and explicitly known shortcomings. The
runtime is now Java 21/Boot 4.1.1. UUID identity, append-only history and retained
account-ID attribution are implemented and database-verified as documented above.
Legacy list storage and shared project-level permissions remain unchanged.
Frontend modernization is not included.
