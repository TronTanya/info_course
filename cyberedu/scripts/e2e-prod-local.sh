#!/usr/bin/env bash
# Локальный production-like E2E (PostgreSQL + Redis + Next start).
#
# Prerequisites:
#   - Postgres на DATABASE_URL (по умолчанию :5432)
#   - Redis на REDIS_URL (по умолчанию redis://127.0.0.1:6379)
#
# Usage:
#   ./scripts/e2e-prod-local.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
cd "$FRONTEND"

export ENVIRONMENT="${ENVIRONMENT:-production}"
export E2E_PRODUCTION_SMOKE=1
# dev compose maps Postgres to host :15432 (see docker-compose.yml)
export DATABASE_URL="${DATABASE_URL:-postgresql://cyberedu:cyberedu_dev_password@127.0.0.1:15432/cyberedu?schema=public}"
export REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
export AUTH_SECRET="${AUTH_SECRET:-local-e2e-prod-auth-secret-minimum-32-chars}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$AUTH_SECRET}"
export AUTH_URL="${AUTH_URL:-http://127.0.0.1:3100}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-$AUTH_URL}"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://127.0.0.1:3100}"
export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-http://127.0.0.1:3100}"
export OPENAI_API_KEY="${OPENAI_API_KEY:-}"

echo "=== Redis PING ($REDIS_URL) ==="
npm run redis:ping

echo "=== migrate + seed (E2E_PRODUCTION_SMOKE) ==="
npx prisma migrate deploy
npm run db:seed

echo "=== build + start ==="
npm run build
npm run start &
APP_PID=$!
trap 'kill $APP_PID 2>/dev/null || true' EXIT

for i in $(seq 1 90); do
  if curl -sf "$PLAYWRIGHT_BASE_URL/api/health" | grep -q '"redis":"ok"'; then
    echo "App ready (redis ok)"
    break
  fi
  sleep 2
done

curl -sf "$PLAYWRIGHT_BASE_URL/api/health" | head -c 500
echo ""

npm run test:e2e:staging
