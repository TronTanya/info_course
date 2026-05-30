#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DUMP="$ROOT/deploy/db/docker-demo-data.sql"

cd "$ROOT"
docker compose up -d postgres

echo "Waiting for Postgres..."
until docker compose exec -T postgres pg_isready -U cyberedu -d cyberedu >/dev/null 2>&1; do
  sleep 1
done

cd frontend
npx prisma migrate deploy

echo "Loading demo data from $DUMP"
docker compose -f "$ROOT/docker-compose.yml" exec -T postgres \
  psql -U cyberedu -d cyberedu -v ON_ERROR_STOP=1 <"$DUMP"

echo "Done. Try student@cyberedu.local / Student12345!"
