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

backend_context=${STARTRACK_BUILD_BACKEND_CONTEXT:-}
if [ -n "$backend_context" ]; then
  if [ ! -f "$backend_context/Dockerfile" ] || [ ! -f "$backend_context/pom.xml" ]; then
    echo "The supplied frozen backend context is incomplete." >&2
    exit 1
  fi
  echo "Reusing the tested backend build context..."
else
  backend_context="$build_root/backend"
  echo "Staging backend build context..."
  rsync -a --exclude target --exclude .git "$project_root/backend/" "$backend_context/"
fi
docker build --progress=plain -t "$backend_image" \
  -f "$backend_context/Dockerfile" "$backend_context"

if [ "$backend_only" = false ]; then
  frontend_context=${STARTRACK_BUILD_FRONTEND_CONTEXT:-}
  if [ -n "$frontend_context" ]; then
    if [ ! -f "$frontend_context/Dockerfile.dev" ] || [ ! -f "$frontend_context/package.json" ]; then
      echo "The supplied frozen frontend context is incomplete." >&2
      exit 1
    fi
    echo "Reusing the tested frontend build context..."
  else
    frontend_context="$build_root/frontend"
    mkdir -p "$frontend_context"
    echo "Staging frontend build context..."
    rsync -a --exclude node_modules --exclude dist --exclude .angular --exclude .git "$project_root/frontend/" "$frontend_context/"
  fi
  docker build --progress=plain -t "$frontend_image" \
    -f "$frontend_context/Dockerfile.dev" "$frontend_context"
fi
