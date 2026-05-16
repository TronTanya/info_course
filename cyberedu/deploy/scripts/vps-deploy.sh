#!/usr/bin/env bash
# Быстрый деплой на VPS (из каталога cyberedu/)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="docker-compose.prod.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Создайте $ENV_FILE из .env.production.example" >&2
  exit 1
fi

echo "[deploy] pull / build..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --pull

echo "[deploy] migrate + up..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans

echo "[deploy] status:"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "Готово. Проверьте https://ваш-домен и /api/v1/health"
