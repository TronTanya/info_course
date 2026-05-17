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
  cd "$ROOT/.."
  docker compose -f cyberedu/docker-compose.yml config --quiet
  docker compose \
    -f cyberedu/docker-compose.prod.yml \
    --env-file cyberedu/.env.production.example \
    config --quiet
)
green "compose OK"

step "Frontend: rate limit production guard"
bash "$ROOT/scripts/check-rate-limit-production.sh"
green "rate-limit guard OK"

step "Frontend: prisma validate, lint, typecheck, unit tests, audit"
(
  cd "$ROOT/frontend"
  npm run db:validate
  npm run lint
  npm run typecheck
  npm run test
  npm audit --audit-level=high
)
green "frontend OK"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  step "Rate limit: Redis integration (optional)"
  if docker run --rm -d --name cyberedu-ci-redis -p 6379:6379 redis:7-alpine >/dev/null 2>&1; then
    trap 'docker rm -f cyberedu-ci-redis >/dev/null 2>&1 || true' EXIT
    sleep 2
    (
      cd "$ROOT/frontend"
      REDIS_URL=redis://127.0.0.1:6379 ENVIRONMENT=production \
        npx vitest run tests/rate-limit-redis.integration.test.ts
    )
    green "redis rate-limit OK"
  else
    red "SKIP: could not start redis container for integration tests"
  fi
else
  red "SKIP: docker not available for Redis integration tests"
fi

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
