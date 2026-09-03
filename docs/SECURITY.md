# Security notes

StarTrack must not contain operational credentials or connect to live services
while the imported baseline is being verified.

## Known containment action

The original source and the first consolidated commit contained a legacy
PID-dispatcher API credential. The current source reads that value from
`STARTRACK_PID_API_TOKEN` and leaves remote PID lookup disabled unless
`STARTRACK_REMOTE_PIDS=true` is explicitly supplied.

The credential owner must revoke or rotate the exposed value. Replacing the
value in the working tree or removing it from Git history is not a substitute
for revocation. Do not test whether the old credential still works.

The imported automatic administrator account has also been removed from the
default startup path. Local bootstrap is opt-in and accepts only
environment-supplied synthetic credentials. OAuth-created accounts now receive
a random unusable local password, and user diagnostic output no longer includes
the password hash.

## Phase 2 account hardening

- The predictable administrator password-reset endpoint and frontend control
  have been removed. Authenticated users retain only their own password-change
  operation.
- Administrator account-management and role operations now require the
  administrator role. Profile, password and deletion-request operations enforce
  the authenticated account identity.
- Password hashes are excluded from JSON responses, state-changing `GET`
  variants have been removed, and CORS uses a central environment-backed
  allowlist.
- OAuth login routes are disabled by default for the bearer-token baseline;
  enabling and redesigning OAuth/SSO remains separately gated work.
- The enforced access rules are recorded in
  [the authorization matrix](AUTHORIZATION_MATRIX.md).

## Inherited risks not yet remediated

- CSRF remains disabled for the stateless bearer-token API. The dormant OAuth
  cookie flow requires a separate threat model before OAuth is enabled.
- Project-level ownership and authorisation rules still require product-owner
  decisions; the Phase 2 matrix covers account management only.
- Dependency and authentication-library upgrades remain future modernisation
  work and must preserve the restored automated test gate.

## Local-development rules

- Use only synthetic project and user data.
- Keep OAuth providers disabled unless separate development applications have
  been approved and configured.
- Do not supply the PID-dispatcher URL or token for baseline verification.
- Enable the bootstrap administrator only with synthetic credentials supplied
  through local environment variables.
- Keep `.env` files untracked and provide only non-operational examples.
- Run a secret scan before each phase is merged.
