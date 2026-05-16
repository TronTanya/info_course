#!/usr/bin/env bash
# Пересборка только frontend и перезапуск контейнера (актуальный UI в Docker).
# Пример: ./scripts/rebuild-frontend.sh
#         ./scripts/rebuild-frontend.sh --no-cache
set -euo pipefail
cd "$(dirname "$0")/.."
export DOCKER_BUILDKIT=1
echo "==> docker compose build frontend $@ (первый раз npm ci может идти 15–25+ мин)..."
docker compose build "$@" frontend
echo "==> docker compose up -d --force-recreate frontend"
docker compose up -d --force-recreate frontend
echo "==> Готово. Откройте http://localhost:3100"
echo "    Под логотипом и в подвале должна быть метка ISO-времени, не «local»."
docker compose ps frontend
