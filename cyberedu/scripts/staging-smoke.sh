#!/usr/bin/env bash
# Быстрая проверка staging/production после деплоя.
#
# Usage:
#   BASE_URL=https://learn.example.com ./scripts/staging-smoke.sh
#   BASE_URL=https://learn.example.com RUN_E2E=1 ./scripts/staging-smoke.sh
#   BASE_URL=https://learn.example.com CHECK_NGINX=1 ./scripts/staging-smoke.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
BASE_URL="${BASE_URL%/}"
RUN_E2E="${RUN_E2E:-0}"
CHECK_NGINX="${CHECK_NGINX:-0}"
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
echo ""

echo "[1/4] API health"
health_code="$(http_code "$BASE_URL/api/health")"
health_body="$(curl -s "$BASE_URL/api/health" || fail "GET /api/health unreachable")"
echo "$health_body (HTTP $health_code)"
if echo "$health_body" | grep -q '"status":"ok"' && echo "$health_body" | grep -q '"database":"ok"'; then
  ok "/api/health"
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
    export E2E_USE_SEED_CREDENTIALS="${E2E_USE_SEED_CREDENTIALS:-1}"
    npm run test:e2e
  )
  ok "Playwright smoke"
else
  echo "[4/4] Playwright E2E — skip (set RUN_E2E=1 to run login/course/submit flows)"
fi

echo ""
green "=== Staging smoke passed ==="
