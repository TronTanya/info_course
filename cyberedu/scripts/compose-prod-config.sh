#!/usr/bin/env bash
# Локальная проверка docker-compose.prod.yml без warnings о пустых ${VAR}.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT/.env.prod.example}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.prod.yml}"
VALIDATE_GHCR="${VALIDATE_GHCR:-0}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "compose-prod-config: нет файла $ENV_FILE" >&2
  echo "  cp .env.prod.example .env.production  # для VPS" >&2
  exit 1
fi

args=(--env-file "$ENV_FILE" -f "$COMPOSE_FILE")
if [[ "$VALIDATE_GHCR" == "1" ]]; then
  args+=(-f "$ROOT/docker-compose.prod.ghcr.yml")
  export GHCR_OWNER="${GHCR_OWNER:-ci-org}"
  export CYBEREDU_IMAGE_TAG="${CYBEREDU_IMAGE_TAG:-v0.0.0-ci}"
fi

exec docker compose "${args[@]}" config "$@"
