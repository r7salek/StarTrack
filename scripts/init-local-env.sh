#!/bin/sh
set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
env_file="$project_root/.env"

if [ -e "$env_file" ]; then
  echo "Local environment already exists at $env_file"
  exit 0
fi

db_password=$(openssl rand -hex 24)
token_secret=$(openssl rand -hex 64)
admin_password=$(openssl rand -hex 18)

umask 077
{
  printf 'STARTRACK_DB_PASSWORD=%s\n' "$db_password"
  printf 'STARTRACK_TOKEN_SECRET=%s\n' "$token_secret"
  printf 'STARTRACK_BOOTSTRAP_ADMIN_EMAIL=%s\n' 'admin@startrack.test'
  printf 'STARTRACK_BOOTSTRAP_ADMIN_PASSWORD=%s\n' "$admin_password"
} > "$env_file"

echo "Created private local environment at $env_file"
