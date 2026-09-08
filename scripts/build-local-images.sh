#!/bin/sh
set -eu

backend_only=false
case "${1:-}" in
  '') ;;
  --backend-only) backend_only=true ;;
  *) echo "Usage: $0 [--backend-only]" >&2; exit 2 ;;
esac
if [ "$#" -gt 1 ]; then
  echo "Usage: $0 [--backend-only]" >&2
  exit 2
fi

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
build_root=$(mktemp -d "${TMPDIR:-/tmp}/startrack-build.XXXXXX")
backend_image=${STARTRACK_BACKEND_IMAGE:-startrack-backend:local}
frontend_image=${STARTRACK_FRONTEND_IMAGE:-startrack-frontend:local}
migration_image=${STARTRACK_MIGRATION_IMAGE:-startrack-migrations:local}
trap 'rm -rf "$build_root"' EXIT HUP INT TERM

mkdir -p "$build_root/backend" "$build_root/database"

echo "Staging versioned database migrations..."
rsync -a --exclude .git "$project_root/database/" "$build_root/database/"
docker build --progress=plain -t "$migration_image" "$build_root/database"

echo "Staging backend build context..."
rsync -a --exclude target --exclude .git "$project_root/backend/" "$build_root/backend/"
docker build --progress=plain -t "$backend_image" \
  -f "$build_root/backend/Dockerfile" "$build_root/backend"

if [ "$backend_only" = false ]; then
  mkdir -p "$build_root/frontend"
  echo "Staging frontend build context..."
  rsync -a --exclude node_modules --exclude dist --exclude .angular --exclude .git "$project_root/frontend/" "$build_root/frontend/"
  docker build --progress=plain -t "$frontend_image" \
    -f "$build_root/frontend/Dockerfile.dev" "$build_root/frontend"
fi
