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

## Local-development rules

- Use only synthetic project and user data.
- Keep OAuth providers disabled unless separate development applications have
  been approved and configured.
- Do not supply the PID-dispatcher URL or token for baseline verification.
- Enable the bootstrap administrator only with synthetic credentials supplied
  through local environment variables.
- Keep `.env` files untracked and provide only non-operational examples.
- Run a secret scan before each phase is merged.
