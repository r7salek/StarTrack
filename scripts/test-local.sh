#!/bin/sh
set -eu

mode=local
backend_only=false
for option in "$@"; do
  case "$option" in
    local|--ci) mode=$option ;;
    --backend-only) backend_only=true ;;
    *) echo "Usage: $0 [--ci] [--backend-only]" >&2; exit 2 ;;
  esac
done

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
umask 077
verify_root=$(mktemp -d "${TMPDIR:-/tmp}/startrack-verify.XXXXXXXX")
env_file="$verify_root/.env"
developer_frontend_was_running=false
verification_completed=false
verify_project=
test_containers=
frontend_test_context="$verify_root/frontend"
backend_test_context="$verify_root/backend"

verify_compose() {
  docker compose --project-directory "$project_root" --env-file "$env_file" \
    -f "$project_root/compose.yaml" -p "$verify_project" "$@"
}

developer_compose() {
  # Only inspect/stop/start existing containers; never recreate them or touch their volume.
  # The private env satisfies Compose interpolation without reading developer credentials.
  docker compose --project-directory "$project_root" --env-file "$env_file" \
    -f "$project_root/compose.yaml" -p startrack "$@"
}

cleanup() {
  status=$?
  trap - EXIT HUP INT TERM

  if [ "$status" -ne 0 ] && [ -n "$verify_project" ] && [ -f "$env_file" ]; then
    echo "Verification failed; showing synthetic local service diagnostics." >&2
    verify_compose ps -a >&2 || true
    if [ "$backend_only" = true ]; then
      verify_compose logs --tail=120 db backend >&2 || true
    else
      verify_compose logs --tail=120 db backend frontend >&2 || true
    fi
  fi

  for container in $test_containers; do
    if docker container inspect "$container" >/dev/null 2>&1; then
      if ! docker container rm -f "$container" >/dev/null 2>&1; then
        echo "Could not remove a verification test container: $container" >&2
        status=1
      fi
    fi
  done

  if [ -n "$verify_project" ] && [ -f "$env_file" ]; then
    if ! verify_compose down -v --remove-orphans >/dev/null 2>&1; then
      echo "Could not remove the isolated verification stack and volume: $verify_project" >&2
      status=1
    fi
    if [ "$backend_only" = true ]; then
      docker image rm "$backend_test_image" "$STARTRACK_BACKEND_IMAGE" \
        "$STARTRACK_MIGRATION_IMAGE" >/dev/null 2>&1 || true
    else
      docker image rm "$backend_test_image" "$frontend_test_image" \
        "$STARTRACK_BACKEND_IMAGE" "$STARTRACK_FRONTEND_IMAGE" "$STARTRACK_MIGRATION_IMAGE" >/dev/null 2>&1 || true
    fi
  fi

  if [ "$developer_frontend_was_running" = true ]; then
    echo "Restoring the developer frontend..."
    if ! developer_compose start frontend >/dev/null 2>&1; then
      echo "Could not restore the previously running developer frontend." >&2
      status=1
    fi
  fi

  if ! rm -rf "$verify_root"; then
    echo "Could not remove the private verification directory: $verify_root" >&2
    status=1
  fi
  if [ "$status" -eq 0 ] && [ "$verification_completed" = true ]; then
    if [ "$backend_only" = true ]; then
      echo "Backend-only verification and cleanup passed; frontend checks were not run."
    else
      echo "Local verification and cleanup passed."
    fi
  fi

  exit "$status"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# Never accept a caller-supplied project name for a workflow that deletes volumes.
verify_tag=$(openssl rand -hex 8)
verify_project="startrack_verify_$verify_tag"
verify_port_slot=$(( $$ % 14000 ))
default_verify_db_port=$((20000 + verify_port_slot * 3))
default_verify_backend_port=$((default_verify_db_port + 1))
default_verify_frontend_port=$((default_verify_db_port + 2))

STARTRACK_DB_PASSWORD=$(openssl rand -hex 24)
STARTRACK_TOKEN_SECRET=$(openssl rand -hex 64)
STARTRACK_BOOTSTRAP_ADMIN_EMAIL="admin@startrack.test"
STARTRACK_BOOTSTRAP_ADMIN_PASSWORD=$(openssl rand -hex 18)
export STARTRACK_DB_PASSWORD STARTRACK_TOKEN_SECRET \
  STARTRACK_BOOTSTRAP_ADMIN_EMAIL STARTRACK_BOOTSTRAP_ADMIN_PASSWORD
export STARTRACK_DB_PORT=${STARTRACK_VERIFY_DB_PORT:-$default_verify_db_port}
export STARTRACK_BACKEND_PORT=${STARTRACK_VERIFY_BACKEND_PORT:-$default_verify_backend_port}
export STARTRACK_FRONTEND_PORT=${STARTRACK_VERIFY_FRONTEND_PORT:-$default_verify_frontend_port}
export STARTRACK_CORS_ALLOWED_ORIGINS="http://127.0.0.1:$STARTRACK_FRONTEND_PORT"
export STARTRACK_BACKEND_IMAGE="startrack-backend:verify-$verify_tag"
export STARTRACK_FRONTEND_IMAGE="startrack-frontend:verify-$verify_tag"
export STARTRACK_MIGRATION_IMAGE="startrack-migrations:verify-$verify_tag"
backend_test_image="startrack-backend-test:verify-$verify_tag"
frontend_test_image="startrack-frontend-test:verify-$verify_tag"
frontend_test_container="$verify_project-frontend-test"
frontend_build_container="$verify_project-frontend-build"
backend_test_container="$verify_project-backend-test"
test_containers="$frontend_test_container $frontend_build_container $backend_test_container"
if [ "$backend_only" = true ]; then
  test_containers="$backend_test_container"
fi

{
  printf 'STARTRACK_DB_PASSWORD=%s\n' "$STARTRACK_DB_PASSWORD"
  printf 'STARTRACK_TOKEN_SECRET=%s\n' "$STARTRACK_TOKEN_SECRET"
  printf 'STARTRACK_BOOTSTRAP_ADMIN_EMAIL=%s\n' "$STARTRACK_BOOTSTRAP_ADMIN_EMAIL"
  printf 'STARTRACK_BOOTSTRAP_ADMIN_PASSWORD=%s\n' "$STARTRACK_BOOTSTRAP_ADMIN_PASSWORD"
} > "$env_file"
mkdir -p "$backend_test_context"
if [ "$backend_only" = false ]; then
  mkdir -p "$frontend_test_context"
fi

wait_for_url() {
  label=$1
  url=$2
  attempts=0
  until curl -fsS --connect-timeout 1 --max-time 2 "$url" >/dev/null 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 90 ]; then
      echo "$label did not become ready: $url" >&2
      return 1
    fi
    sleep 2
  done
  echo "$label is ready"
}

echo "Validating scripts and Compose configuration..."
sh -n "$project_root/scripts/init-local-env.sh" \
  "$project_root/scripts/build-local-images.sh" \
  "$project_root/scripts/smoke-local.sh" \
  "$project_root/scripts/test-local.sh"
node --check "$project_root/scripts/smoke-local.mjs"
node --check "$project_root/scripts/security-smoke-local.mjs"
node --check "$project_root/scripts/test-database-local.mjs"
node --test "$project_root/scripts/test-database-schema.mjs"
node --test "$project_root/scripts/test-verification-gate.mjs"
verify_compose config --quiet

if [ "$mode" = "local" ] && [ "$backend_only" = false ]; then
  developer_services=$(developer_compose ps --status running --services)
  if printf '%s\n' "$developer_services" | grep -qx frontend; then
    developer_frontend_was_running=true
    echo "Pausing the developer frontend during resource-intensive verification..."
    developer_compose stop frontend >/dev/null
  fi
fi

if [ "$backend_only" = false ]; then
  echo "Building and running frontend tests in Node 18 with Chromium..."
  rsync -a --exclude node_modules --exclude dist --exclude .angular --exclude .git \
    "$project_root/frontend/" "$frontend_test_context/"
  docker build --progress=plain -t "$frontend_test_image" \
    -f "$frontend_test_context/Dockerfile.test" "$frontend_test_context"
  docker run --rm --network none --name "$frontend_test_container" "$frontend_test_image"
  docker run --rm --name "$frontend_build_container" "$frontend_test_image" npm run build
fi

echo "Building and running backend tests..."
rsync -a --exclude target --exclude .git \
  "$project_root/backend/" "$backend_test_context/"
docker build --progress=plain -t "$backend_test_image" \
  -f "$backend_test_context/Dockerfile.test" "$backend_test_context"
docker run --rm --name "$backend_test_container" "$backend_test_image"

echo "Building runtime images..."
if [ "$backend_only" = true ]; then
  "$project_root/scripts/build-local-images.sh" --backend-only
else
  "$project_root/scripts/build-local-images.sh"
fi

echo "Starting an isolated verification stack..."
if [ "$backend_only" = true ]; then
  echo "Verification ports: database=$STARTRACK_DB_PORT backend=$STARTRACK_BACKEND_PORT"
  verify_compose up -d --no-build backend
else
  echo "Verification ports: database=$STARTRACK_DB_PORT backend=$STARTRACK_BACKEND_PORT frontend=$STARTRACK_FRONTEND_PORT"
  verify_compose up -d --no-build
fi
wait_for_url "Backend" "http://127.0.0.1:$STARTRACK_BACKEND_PORT/api/all"
if [ "$backend_only" = false ]; then
  wait_for_url "Frontend" "http://127.0.0.1:$STARTRACK_FRONTEND_PORT/"
fi

echo "Running the synthetic API smoke test..."
STARTRACK_API_URL="http://127.0.0.1:$STARTRACK_BACKEND_PORT" \
  node "$project_root/scripts/smoke-local.mjs"
STARTRACK_API_URL="http://127.0.0.1:$STARTRACK_BACKEND_PORT" \
  node "$project_root/scripts/security-smoke-local.mjs"

echo "Characterizing PostgreSQL and rehearsing migrations and recovery..."
node "$project_root/scripts/test-postgres-baseline.mjs"
STARTRACK_API_URL="http://127.0.0.1:$STARTRACK_BACKEND_PORT" \
  node "$project_root/scripts/test-database-local.mjs" "$verify_project" "$env_file"

echo "Restarting the backend and proving persistence..."
verify_compose restart backend
wait_for_url "Restarted backend" "http://127.0.0.1:$STARTRACK_BACKEND_PORT/api/all"
STARTRACK_API_URL="http://127.0.0.1:$STARTRACK_BACKEND_PORT" \
  node "$project_root/scripts/smoke-local.mjs"

verification_completed=true
