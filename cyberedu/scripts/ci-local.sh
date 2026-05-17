#!/usr/bin/env bash
# Локальный прогон как GitHub Actions CI (без Docker build — долго; см. ci-local --docker).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DOCKER=0
if [[ "${1:-}" == "--docker" ]]; then
  RUN_DOCKER=1
  shift
fi

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }

step() {
  echo ""
  echo "=== $* ==="
}

step "Compose config (dev + prod)"
(
  cd "$ROOT"
  docker compose -f docker-compose.yml config --quiet
  cp -n .env.production.example .env.production 2>/dev/null || true
  docker compose -f docker-compose.prod.yml --env-file .env.production.example config --quiet
)
green "compose OK"

step "Frontend: lint, typecheck, unit tests"
(
  cd "$ROOT/frontend"
  npm run lint
  npm run typecheck
  npm run test
)
green "frontend OK"

step "Backend: pytest (Python 3.12)"
"$ROOT/scripts/test-backend.sh" "$@"
green "backend OK"

if [[ "$RUN_DOCKER" == "1" ]]; then
  step "Docker build (dev compose)"
  (
    cd "$ROOT"
    export AUTH_SECRET="${AUTH_SECRET:-ci-build-auth-secret-minimum-32-chars-x}"
    export JWT_SECRET_KEY="${JWT_SECRET_KEY:-ci-jwt-secret-key-minimum-32-characters-long}"
    docker compose -f docker-compose.yml build --parallel
    docker compose -f docker-compose.prod.yml --env-file .env.production.example build --parallel
  )
  green "docker OK"
fi

echo ""
green "=== ci-local passed ==="
echo "E2E (нужен running app): cd frontend && npm run smoke:local:e2e"
