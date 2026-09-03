#!/bin/sh
set -eu

mode=${1:-local}
case "$mode" in
  local|--ci) ;;
  *)
    echo "Usage: $0 [--ci]" >&2
    exit 2
    ;;
esac

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
env_file="$project_root/.env"
created_env=false
developer_frontend_was_running=false
frontend_test_context=$(mktemp -d "${TMPDIR:-/tmp}/startrack-frontend-test.XXXXXX")
backend_test_context=$(mktemp -d "${TMPDIR:-/tmp}/startrack-backend-test.XXXXXX")
verify_tag=${GITHUB_RUN_ID:-$$}
verify_project=${STARTRACK_VERIFY_PROJECT:-startrack_phase2_verify_$verify_tag}
verify_port_slot=$((verify_tag % 14000))
default_verify_db_port=$((20000 + verify_port_slot * 3))
default_verify_backend_port=$((default_verify_db_port + 1))
default_verify_frontend_port=$((default_verify_db_port + 2))

if [ ! -f "$env_file" ]; then
  "$project_root/scripts/init-local-env.sh"
  created_env=true
fi

set -a
. "$env_file"
set +a

export STARTRACK_DB_PORT=${STARTRACK_VERIFY_DB_PORT:-$default_verify_db_port}
export STARTRACK_BACKEND_PORT=${STARTRACK_VERIFY_BACKEND_PORT:-$default_verify_backend_port}
export STARTRACK_FRONTEND_PORT=${STARTRACK_VERIFY_FRONTEND_PORT:-$default_verify_frontend_port}
export STARTRACK_CORS_ALLOWED_ORIGINS="http://127.0.0.1:$STARTRACK_FRONTEND_PORT"
export STARTRACK_BACKEND_IMAGE="startrack-backend:verify-$verify_tag"
export STARTRACK_FRONTEND_IMAGE="startrack-frontend:verify-$verify_tag"
backend_test_image="startrack-backend-test:verify-$verify_tag"
frontend_test_image="startrack-frontend-test:verify-$verify_tag"

verify_compose() {
  docker compose -p "$verify_project" "$@"
}

cleanup() {
  status=$?
  trap - EXIT HUP INT TERM

  if [ "$status" -ne 0 ]; then
    echo "Verification failed; showing synthetic local service diagnostics." >&2
    verify_compose ps -a >&2 || true
    verify_compose logs --tail=120 db backend frontend >&2 || true
  fi

  verify_compose down -v --remove-orphans >/dev/null 2>&1 || true
  docker image rm "$backend_test_image" "$frontend_test_image" \
    "$STARTRACK_BACKEND_IMAGE" "$STARTRACK_FRONTEND_IMAGE" >/dev/null 2>&1 || true
  rm -rf "$frontend_test_context" "$backend_test_context"

  if [ "$developer_frontend_was_running" = true ]; then
    echo "Restoring the developer frontend..."
    docker compose start frontend >/dev/null 2>&1 || true
  fi

  if [ "$mode" = "--ci" ] && [ "$created_env" = true ]; then
    rm -f "$env_file"
  fi

  exit "$status"
}
trap cleanup EXIT HUP INT TERM

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
verify_compose config --quiet

if [ "$mode" = "local" ] && docker compose ps --status running --services 2>/dev/null | grep -qx frontend; then
  developer_frontend_was_running=true
  echo "Pausing the developer frontend during resource-intensive verification..."
  docker compose stop frontend >/dev/null
fi

echo "Building and running frontend tests in Node 18 with Chromium..."
rsync -a --exclude node_modules --exclude dist --exclude .angular --exclude .git \
  "$project_root/frontend/" "$frontend_test_context/"
docker build --progress=plain -t "$frontend_test_image" \
  -f "$frontend_test_context/Dockerfile.test" "$frontend_test_context"
docker run --rm "$frontend_test_image"
docker run --rm "$frontend_test_image" npm run build

echo "Building and running backend tests..."
rsync -a --exclude target --exclude .git \
  "$project_root/backend/" "$backend_test_context/"
docker build --progress=plain -t "$backend_test_image" \
  -f "$backend_test_context/Dockerfile.test" "$backend_test_context"
docker run --rm "$backend_test_image"

echo "Building runtime images..."
"$project_root/scripts/build-local-images.sh"

echo "Starting an isolated verification stack..."
echo "Verification ports: database=$STARTRACK_DB_PORT backend=$STARTRACK_BACKEND_PORT frontend=$STARTRACK_FRONTEND_PORT"
verify_compose down -v --remove-orphans >/dev/null 2>&1 || true
verify_compose up -d --no-build
wait_for_url "Backend" "http://127.0.0.1:$STARTRACK_BACKEND_PORT/api/all"
wait_for_url "Frontend" "http://127.0.0.1:$STARTRACK_FRONTEND_PORT/"

echo "Running the synthetic API smoke test..."
STARTRACK_API_URL="http://127.0.0.1:$STARTRACK_BACKEND_PORT" \
  "$project_root/scripts/smoke-local.sh"
STARTRACK_API_URL="http://127.0.0.1:$STARTRACK_BACKEND_PORT" \
  node "$project_root/scripts/security-smoke-local.mjs"

echo "Restarting the backend and proving persistence..."
verify_compose restart backend
wait_for_url "Restarted backend" "http://127.0.0.1:$STARTRACK_BACKEND_PORT/api/all"
STARTRACK_API_URL="http://127.0.0.1:$STARTRACK_BACKEND_PORT" \
  "$project_root/scripts/smoke-local.sh"

echo "Phase 2 local verification passed."
