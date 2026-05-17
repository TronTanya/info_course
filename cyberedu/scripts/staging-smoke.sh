#!/usr/bin/env bash
# Быстрая проверка staging/production после деплоя.
#
# Usage:
#   BASE_URL=https://learn.example.com ./scripts/staging-smoke.sh
#   BASE_URL=https://learn.example.com CHECK_REDIS=1 ./scripts/staging-smoke.sh
#   BASE_URL=http://127.0.0.1:3100 RUN_E2E=1 RUN_E2E_MODE=staging ./scripts/staging-smoke.sh
#   REDIS_URL=redis://127.0.0.1:6379 ENVIRONMENT=production RUN_E2E=1 RUN_E2E_MODE=staging ./scripts/staging-smoke.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
BASE_URL="${BASE_URL%/}"
RUN_E2E="${RUN_E2E:-0}"
RUN_E2E_MODE="${RUN_E2E_MODE:-dev}"
CHECK_NGINX="${CHECK_NGINX:-0}"
# Prod/staging: убедиться, что /api/health reports redis ok (rate limit backend)
CHECK_REDIS="${CHECK_REDIS:-0}"
if [[ "${ENVIRONMENT:-}" == "production" ]] || [[ "$RUN_E2E_MODE" == "staging" ]]; then
  CHECK_REDIS="${CHECK_REDIS:-1}"
fi
# Локально без Postgres: ALLOW_DEGRADED=1 — проверить публичные страницы, health только warn
ALLOW_DEGRADED="${ALLOW_DEGRADED:-0}"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }

fail() {
  red "FAIL: $*"
  exit 1
}

ok() {
  green "OK: $*"
}

http_code() {
  curl -s -o /dev/null -w "%{http_code}" "$1"
}

echo "=== CyberEdu staging smoke ==="
echo "BASE_URL=$BASE_URL"
echo "CHECK_REDIS=$CHECK_REDIS RUN_E2E=$RUN_E2E RUN_E2E_MODE=$RUN_E2E_MODE"
echo ""

if [[ "$CHECK_REDIS" == "1" ]] && [[ -n "${REDIS_URL:-}" ]]; then
  echo "[0] Redis PING (direct)"
  (
    cd "$ROOT/frontend"
    npm run redis:ping
  )
  ok "Redis PING ($REDIS_URL)"
  echo ""
fi

echo "[1/4] API health"
health_code="$(http_code "$BASE_URL/api/health")"
health_body="$(curl -s "$BASE_URL/api/health" || fail "GET /api/health unreachable")"
echo "$health_body (HTTP $health_code)"
if echo "$health_body" | grep -q '"status":"ok"' && echo "$health_body" | grep -q '"database":"ok"'; then
  if [[ "$CHECK_REDIS" == "1" ]]; then
    echo "$health_body" | grep -q '"redis":"ok"' || fail 'health redis != ok (set REDIS_URL in prod compose)'
    ok "/api/health (database + redis)"
  else
    ok "/api/health"
  fi
elif [[ "$ALLOW_DEGRADED" == "1" ]]; then
  red "WARN: health degraded (set up Postgres or Docker for strict check)"
else
  [[ "$health_code" == "200" ]] || fail "/api/health HTTP $health_code (expected 200 when ok)"
  echo "$health_body" | grep -q '"status":"ok"' || fail 'health status != ok'
  echo "$health_body" | grep -q '"database":"ok"' || fail 'database check != ok'
  ok "/api/health"
fi

if [[ "$CHECK_NGINX" == "1" ]]; then
  echo ""
  echo "[2/4] Nginx health (prod compose)"
  code="$(http_code "$BASE_URL/nginx-health")"
  [[ "$code" == "200" ]] || fail "/nginx-health -> $code"
  ok "/nginx-health"
else
  echo ""
  echo "[2/4] Nginx health — skip (set CHECK_NGINX=1 behind reverse proxy)"
fi

echo ""
echo "[3/4] Public pages"
for path in / /reviews /auth/login /auth/register; do
  code="$(http_code "$BASE_URL$path")"
  echo "  $path -> $code"
  case "$code" in
    200|307|308) ;;
    *) fail "$path returned $code" ;;
  esac
done
ok "public routes"

echo ""
if [[ "$RUN_E2E" == "1" ]]; then
  echo "[4/4] Playwright E2E"
  if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
    fail "Run: cd cyberedu/frontend && npm ci"
  fi
  (
    cd "$ROOT/frontend"
    export PLAYWRIGHT_BASE_URL="$BASE_URL"
    if [[ "$RUN_E2E_MODE" == "staging" ]]; then
      [[ -n "${REDIS_URL:-}" ]] || fail "RUN_E2E_MODE=staging requires REDIS_URL (real Redis, no mock)"
      export ENVIRONMENT="${ENVIRONMENT:-production}"
      export E2E_PRODUCTION_SMOKE=1
      npm run redis:ping
      npm run test:e2e:staging
    else
      export E2E_USE_SEED_CREDENTIALS="${E2E_USE_SEED_CREDENTIALS:-1}"
      export ENVIRONMENT="${ENVIRONMENT:-test}"
      npm run test:e2e
    fi
  )
  ok "Playwright smoke ($RUN_E2E_MODE)"
else
  echo "[4/4] Playwright E2E — skip (RUN_E2E=1; staging: RUN_E2E_MODE=staging + REDIS_URL)"
fi

echo ""
green "=== Staging smoke passed ==="
