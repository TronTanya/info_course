#!/usr/bin/env bash
# Квартальная проверка восстановления: pg_dump → временная БД → smoke SELECT → DROP.
#
#   BACKUP_SQL_GZ=/var/backups/cyberedu/cyberedu-db-2026-05-26.sql.gz ./scripts/restore-drill.sh
#   # или последний run:
#   BACKUP_SQL_GZ=/var/backups/cyberedu/latest/postgres.sql.gz ./scripts/restore-drill.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_SQL_GZ="${BACKUP_SQL_GZ:-}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "restore-drill: нет $ENV_FILE" >&2
  exit 1
fi

if [[ -z "$BACKUP_SQL_GZ" || ! -f "$BACKUP_SQL_GZ" ]]; then
  echo "restore-drill: задайте BACKUP_SQL_GZ=путь/к/postgres.sql.gz" >&2
  exit 1
fi

# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a

DRILL_DB="${DRILL_DB:-cyberedu_restore_drill}"

compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

echo "[restore-drill] using backup: $BACKUP_SQL_GZ"
echo "[restore-drill] temporary database: $DRILL_DB"

compose exec -T postgres psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 <<SQL
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$DRILL_DB' AND pid <> pg_backend_pid();
DROP DATABASE IF EXISTS "$DRILL_DB";
CREATE DATABASE "$DRILL_DB" OWNER "$POSTGRES_USER";
SQL

echo "[restore-drill] restoring…"
gunzip -c "$BACKUP_SQL_GZ" | compose exec -T postgres psql -U "$POSTGRES_USER" -d "$DRILL_DB" -v ON_ERROR_STOP=1 >/dev/null

echo "[restore-drill] smoke queries"
compose exec -T postgres psql -U "$POSTGRES_USER" -d "$DRILL_DB" -v ON_ERROR_STOP=1 <<'SQL'
SELECT COUNT(*)::int AS users FROM "User";
SELECT COUNT(*)::int AS modules FROM "Module";
SQL

compose exec -T postgres psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 <<SQL
DROP DATABASE IF EXISTS "$DRILL_DB";
SQL

echo "[restore-drill] OK — backup восстанавливается, drill DB удалена"
