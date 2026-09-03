#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
env_file="$project_root/.env"

if [ ! -f "$env_file" ]; then
  echo "Missing $env_file; run scripts/init-local-env.sh first" >&2
  exit 1
fi

set -a
. "$env_file"
set +a

node "$project_root/scripts/smoke-local.mjs"
