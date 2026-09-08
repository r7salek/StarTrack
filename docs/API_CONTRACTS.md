# Existing API contracts — Phase 3

Recorded from the current controllers, DTOs, services and repository queries on
2026-09-08. This is a compatibility specification, **not a claim that the legacy
API is production-safe**. It complements [the route inventory](API_INVENTORY.md),
[authorization matrix](AUTHORIZATION_MATRIX.md) and [data model](DATA_MODEL.md).
No endpoint or production behaviour was changed to produce this document.

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
- Body-required routes reject an absent body; most legacy mutation DTOs do not
  have `@Valid`. “Required for safe use” below is therefore stricter than the
  server's incomplete input validation.
- Successful mutations return `200`, except role update (`202`). “Empty” means
  no response bytes, not the JSON literal `null` and not a newly created object.
- URL-encode individual email, project-name and status path values. There is no
  pagination, version header or stable ordering unless explicitly stated.

## Route-to-shape map: all 34 routes

Access: public needs no token; USER/ADMIN mean the exact `ROLE_USER`/`ROLE_ADMIN`
authority; own-ID applies even to administrators; own-email requires exact case.
The bootstrap administrator has both roles, but ADMIN alone does not imply USER.
All routes also have the shared failure behaviour described below.

| Method and complete path | Access | Input | Success | Specific failures / quirks |
| --- | --- | --- | --- | --- |
| POST `/api/auth/signin` | Public | Login | `200` Token | Invalid credentials/disabled account: authentication failure; blank fields: `400` Validation |
| POST `/api/auth/signup` | Public | Signup | `200` ApiResponse | Existing exact email or supplied existing `userID`: `400` ApiResponse; validation failures: `400` Validation |
| GET `/api/all` | Public | None | `200` text `Public content goes here` | Public readiness/content route, not a database health check |
| GET `/api/user/me` | USER | None | `200` UserInfo | ADMIN without USER receives `403` |
| GET `/api/user` | USER | None | `200` text `User content goes here` | No account payload |
| GET `/api/admin` | ADMIN | None | `200` text `Admin content goes here` | No account payload |
| GET `/sybeUser/all` | ADMIN | None | `200` User[] | No role relationships or password fields |
| GET `/sybeUser/userData` | ADMIN | None | `200` UserManagement[] | Role names merged per user; output order not guaranteed |
| GET `/sybeUser/{id}` | Own-ID | Integer account ID | `200` User | Cross-account `403`; missing authorized ID: `400` LegacyApiError |
| DELETE `/sybeUser/delete/{email}` | ADMIN | Exact email | `200` Empty | Missing email dereferences null; referenced account can fail a database constraint; neither is a deliberate `404` |
| PUT `/sybeUser/activate/{email}` | ADMIN | Exact email | `200` User | Sets enabled=true; not a toggle. Missing email dereferences null |
| PUT `/sybeUser/roleUpdate/{email}/{role}` | ADMIN | Exact email; comma-separated role names | `200` User | Replaces role set, does not append. Missing email: `400` LegacyApiError; unknown role names are not cleanly validated |
| POST `/sybeUser/profileUpdate/{id}` | Own-ID | UserManagement; only firstName/lastName/email copied | `200` User | Omitted copied fields can overwrite with null; uniqueness/FK conflicts can become server errors |
| POST `/sybeUser/passwordUpdate/{id}` | Own-ID | PasswordChange | `200` User | Does not require old password; no minimum-length validator here; null password fails encoding |
| PUT `/sybeUser/deleteRequest/{email}` | Own exact email | Exact authenticated email | `200` User | Sets delete=true; updates authenticated immutable account ID; other email/case variant `403` |
| GET `/role/all` | ADMIN | None | `200` RoleName[] | `description`, not `name`, holds each role name |
| GET `/role/details/{id}` | ADMIN | Integer role ID | `200` Role or Empty | Missing role returns empty `200`, not `404` |
| PUT `/role/update/{id}` | ADMIN | Role; only name copied | `202` text | Missing role `422`; failed post-save lookup `400`; see exact text below |
| DELETE `/role/delete/{id}` | ADMIN | Integer role ID | `200` text | Missing or assigned role `422`; see exact text below |
| GET `/projectCreate/allData` | Authenticated | None | `200` ProjectList[] | Creation date descending |
| GET `/projectCreate/allDatalatest` | Authenticated | None | `200` ProjectList[] | Maximum creation date per exact project name, descending; ties may return multiple rows |
| GET `/projectCreate/allDataHistroy/{data1}` | Authenticated | Exact project name | `200` ProjectList[] | Same-name rows excluding maximum timestamp; missing name yields `[]` |
| POST `/projectCreate/addToProjectCreate/{email}` | Authenticated | ProjectInput; nine arrays required for safe use | `200` Empty | URL email and DTO ID do not choose owner/update target; always inserts; null collections can cause server errors |
| DELETE `/projectCreate/delete/{id}` | Authenticated | Integer project-row ID | `200` Empty | No ownership check; missing row is not deliberately mapped to `404` |
| PUT `/projectCreate/permUpdate/{id}/{applyValue}` | Authenticated | Project-row ID and status string | `200` Empty | Stores the string; neither role permission nor status enum is enforced; missing row fails entity lookup |
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
The Phase 3 runtime rehearsal confirms that project deletion removes its join
rows but retains child records, including shared children; it is not complete
erasure of the associated data.
**Project endpoints have authentication but no ownership/administrator restriction.**
Frontend menus are not a security boundary; project-permission redesign is deferred.

## Authentication and account shapes

| Shape | Property | Type | Meaning / input rule |
| --- | --- | --- | --- |
| Login | email | string | Required, not blank; no email-format validator |
| Login | password | string | Required, not blank; credentials are never echoed in Token |
| Signup | firstName, lastName, email | string each | Required, nonempty; whitespace-only values are not rejected by `@NotEmpty` |
| Signup | password | string | Supply non-null, minimum six characters; null is unsafe in the matching validator |
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
| PasswordChange | password | string | New password; required for safe use; no old-password field |
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
| Update missing | 422 | `Specified Role not found` |
| Update post-save lookup failed | 400 | `Failed to update Role` |
| Delete success | 200 | `Successfully deleted specified record` |
| Delete missing | 422 | `No Records Found` |
| Delete assigned role | 422 | `Failed to delete, Please delete the users associated with this role` |
| Delete post-delete lookup still present | 422 | `Failed to delete the specified record` |

## ProjectInput and ProjectList

These field groups enumerate every property. Each comma-separated name is a
separate property with the specified type, not a combined JSON key.

| Properties | ProjectInput type/use | ProjectList type/use |
| --- | --- | --- |
| id | integer, ignored; every create inserts a new row | integer, project-row ID |
| projectName | string, copied | string; also the inherited history grouping key |
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
| valueOverview | Not an active top-level create property | integer, from overview child; defaults to 0 if none |
| fundingOverviewStartDate, fundingOverviewEndDate | Not active top-level create properties | date each, from overview child |
| createdEmail, modifyEmail | Not active create properties | string each from linked User.email; create service does not assign either relationship |
| createdDate | Not an active create property | date, assigned by server |
| applyValue | Not an active create property | string, create initializes `SUBMITTED`; permUpdate accepts arbitrary strings |

Use `[]` for absent child collections, not null. Child elements must be non-null.
Child input IDs are ignored; new child objects are built for every create. There
is no nested PATCH/update-by-child-ID contract. Null modality/expertise/funding
selection lists stringify to the literal string `null`; an empty list becomes
`[]`. Neither should be interpreted as normalized JSON storage.

Funding summary selection has no ordering clause and uses the first returned
overview; multiple overview children therefore do not define a stable summary.
Listing currently performs one additional overview query per project. Optimizing
this must preserve or intentionally redesign the ambiguity, not accidentally
change which record is shown. Same-name projects share a history group; equal
maximum timestamps may produce several “latest” rows. No independent project
family ID or version counter exists.

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
| value | integer, Java signed 32-bit; defaults to 0; no currency or nonnegative rule |
| fundingStartDate, fundingEndDate | date each; no start-before-end validation |
| aims, grantNumber, worktribeNumber | string each |

### FundingOverviewInput / FundingOverviewOutput

| Properties | Type / meaning |
| --- | --- |
| id | integer; ignored on input, child ID on output |
| fundingOverview | string[] on input; Java-list-formatted string on output |
| fundingOverviewOther, fundingOverviewNIHR, fundingOverviewNIHROther, fundingOverviewUKRIMRC, fundingOverviewUKRIMRCOther, fundingOverviewWellcomeTrust, fundingOverviewWellcomeTrustOther | string each, copied without enum validation |
| schemeOverview, schemeOverviewOther | string each |
| valueOverview | integer, Java signed 32-bit; defaults to 0; no currency or nonnegative rule |
| fundingOverviewStartDate, fundingOverviewEndDate | date each; no start-before-end validation |
| aimsOverview, grantNumberOverview, worktribeNumberOverview | string each |

## Failure contracts and limitations

| Failure | Status / body contract |
| --- | --- |
| Unauthenticated protected request | `401`; do not depend on an exact framework error body |
| Authenticated user fails method authority / own-account rule | `403`; security tests pin status, not framework body |
| Validated signin/signup fields invalid | `400` ApiResponse with success=false; message joins field/object validation messages and is not a stable code |
| Duplicate signup | `400` ApiResponse: success=false, message=`Email Address already in use!` (also used for supplied existing userID) |
| Malformed JSON, incompatible scalar type, missing required request body, nonnumeric ID | Normally `400` from Spring binding; framework-generated body is not normalized |
| Unsupported HTTP method | `405` after authentication when a retained path matches; legacy state-changing GETs are not supported |
| Removed GET/PUT `/sybeUser/resetPassword/{email}` | `404` after authentication; unauthenticated requests can be rejected earlier with `401` |
| Missing user ID / role-update email explicitly throws ApiRequestException | `400` LegacyApiError, not `404` |
| Uncaught null dereference, missing entity proxy, FK/uniqueness/persistence failure | Server failure, generally `500`; not normalized to field errors/404/409 |
| Unapproved CORS origin | No allow-origin permission; browser cross-origin use is denied; CORS is not authentication |

`LegacyApiError` is the inherited `ApiException extends Throwable` serialization:
`message` string, `httpStatus` enum string (`BAD_REQUEST`), `timestamp` UTC zoned
timestamp, `throwable` nested exception and inherited Throwable properties such
as `stackTrace`, `cause`, `suppressed` and `localizedMessage`. This shape can expose
implementation details. **Do not build new clients against it, show it to users,
or print it in synthetic-safe diagnostics.** Replace it with a small structured
error DTO in a separately reviewed hardening change; documenting it does not
endorse retaining exception internals as a public contract.

Several invalid-input paths are source-characterized rather than exhaustively
HTTP-tested. For example, a null signup password dereferences in the custom
matching validator instead of yielding an ordinary validation message. This
phase does not silently repair such cases or pretend all errors share one schema.
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

This document specifies current shapes and explicitly known shortcomings. It does
not introduce API versioning, promise stable error payloads, fix email foreign
keys, normalize list storage, redesign history, add ownership rules or modernize
the frontend/frameworks.
