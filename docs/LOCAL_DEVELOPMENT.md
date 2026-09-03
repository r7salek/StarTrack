# Local Docker development

This baseline runs only on loopback and uses synthetic credentials and data.
It does not require a native Java, Maven or PostgreSQL installation.

## Start

```sh
./scripts/init-local-env.sh
./scripts/build-local-images.sh
docker compose up -d --no-build
docker compose ps
./scripts/smoke-local.sh
```

Open `http://127.0.0.1:4200`. The backend API is available at
`http://127.0.0.1:8080`.

The image-build script stages clean build contexts in a temporary directory.
This avoids a Docker Desktop file-sharing deadlock observed when BuildKit read
the existing `frontend/node_modules` tree from this Documents workspace.

## Complete verification

```sh
./scripts/test-local.sh
```

This runs backend and frontend tests, a production frontend build and a fresh
end-to-end Docker smoke test. It uses an isolated Compose project on alternate
loopback ports and removes its temporary database afterward. On memory-limited
local machines it temporarily pauses a running developer frontend and restores
it during cleanup; the developer backend and persistent database are not
stopped or replaced. CI runs the same command with `./scripts/test-local.sh
--ci`.

## Inspect and stop

```sh
docker compose logs --follow backend frontend
docker compose down
```

The PostgreSQL data remains in the `startrack_startrack-postgres` Docker volume.
Removing that volume deletes the local synthetic database and is intentionally
not part of the normal stop command.

## Safety boundaries

- `.env` is generated locally, permission-restricted and ignored by Git.
- Published ports bind to `127.0.0.1` only.
- The PID-dispatcher integration is disabled and has no URL or token locally.
- OAuth is disabled in the baseline and its authorization route is checked by
  the security smoke test.
- Use no hosted StarTrack credentials, database dumps or real project data.
- Account permissions are recorded in [the authorization matrix](AUTHORIZATION_MATRIX.md).
