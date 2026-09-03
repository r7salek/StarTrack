#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
build_root=$(mktemp -d "${TMPDIR:-/tmp}/startrack-build.XXXXXX")
trap 'rm -rf "$build_root"' EXIT HUP INT TERM

mkdir -p "$build_root/backend" "$build_root/frontend"

echo "Staging backend build context..."
rsync -a --exclude target --exclude .git "$project_root/backend/" "$build_root/backend/"
docker build --progress=plain -t startrack-backend:local "$build_root/backend"

echo "Staging frontend build context..."
rsync -a --exclude node_modules --exclude dist --exclude .angular --exclude .git "$project_root/frontend/" "$build_root/frontend/"
docker build --progress=plain -t startrack-frontend:local -f Dockerfile.dev "$build_root/frontend"
