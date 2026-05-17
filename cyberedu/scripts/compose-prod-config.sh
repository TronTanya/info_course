#!/usr/bin/env bash
# Локальная проверка docker-compose.prod.yml без warnings о пустых ${VAR}.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT/.env.prod.example}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.prod.yml}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "compose-prod-config: нет файла $ENV_FILE" >&2
  echo "  cp .env.prod.example .env.production  # для VPS" >&2
  exit 1
fi

exec docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config "$@"
