#!/usr/bin/env bash
# Ежедневный бэкап production: PostgreSQL (pg_dump) + uploads (/app/uploads).
#
# Использование (на VPS, из каталога cyberedu/):
#   ./scripts/backup-production.sh
#   BACKUP_DIR=/var/backups/cyberedu RETENTION_DAYS=14 ./scripts/backup-production.sh
#
# Cron (пример): deploy/cron/cyberedu-backup.cron.example
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/cyberedu}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DAY_STAMP="$(date -u +%F)"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "backup-production: нет $ENV_FILE (cp .env.prod.example .env.production)" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"
RUN_DIR="$BACKUP_DIR/run-$STAMP"
mkdir -p "$RUN_DIR"

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

echo "[backup] PostgreSQL → $RUN_DIR/postgres.sql.gz"
compose exec -T postgres \
  pg_dump -U "${POSTGRES_USER:?POSTGRES_USER required}" "${POSTGRES_DB:?POSTGRES_DB required}" \
  | gzip -9 >"$RUN_DIR/postgres.sql.gz"

echo "[backup] uploads → $RUN_DIR/uploads.tar.gz"
if compose ps --status running --services 2>/dev/null | grep -qx frontend; then
  compose exec -T frontend tar -czf - -C /app/uploads . >"$RUN_DIR/uploads.tar.gz"
else
  echo "[backup] frontend не запущен — бэкап volume через временный контейнер" >&2
  project="$(basename "$ROOT")"
  vol="${COMPOSE_PROJECT_NAME:-cyberedu-prod}_frontend_uploads"
  if ! docker volume inspect "$vol" >/dev/null 2>&1; then
    vol="${project}_frontend_uploads"
  fi
  docker run --rm \
    -v "${vol}:/data:ro" \
    -v "${RUN_DIR}:/out" \
    alpine:3.20 \
    sh -c 'tar -czf /out/uploads.tar.gz -C /data .'
fi

cat >"$RUN_DIR/manifest.txt" <<EOF
timestamp_utc=$STAMP
postgres_file=postgres.sql.gz
uploads_file=uploads.tar.gz
postgres_user=${POSTGRES_USER}
postgres_db=${POSTGRES_DB}
compose_project=${COMPOSE_PROJECT_NAME:-cyberedu-prod}
EOF

ln -sfn "run-$STAMP" "$BACKUP_DIR/latest"
cp -a "$RUN_DIR/postgres.sql.gz" "$BACKUP_DIR/cyberedu-db-$DAY_STAMP.sql.gz"
cp -a "$RUN_DIR/uploads.tar.gz" "$BACKUP_DIR/cyberedu-uploads-$DAY_STAMP.tar.gz"

echo "[backup] prune backups older than ${RETENTION_DAYS}d in $BACKUP_DIR"
find "$BACKUP_DIR" -maxdepth 1 -type d -name 'run-*' -mtime "+$RETENTION_DAYS" -exec rm -rf {} + 2>/dev/null || true
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'cyberedu-db-*.sql.gz' -o -name 'cyberedu-uploads-*.tar.gz' \) -mtime "+$RETENTION_DAYS" -delete 2>/dev/null || true

echo "[backup] OK → $RUN_DIR"
echo "[backup] latest symlink → $BACKUP_DIR/latest"
