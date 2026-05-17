#!/usr/bin/env bash
# Staging / production smoke (HTTP + optional Playwright).
#
# Modes (SMOKE_MODE):
#   full       — health, public routes, optional E2E (default)
#   prod-e2e   — только Redis PING + Playwright prod specs (app уже на BASE_URL)
#
# Local reproducible prod E2E (app running with ENVIRONMENT=production + REDIS_URL):
#   cd cyberedu
#   docker compose up -d redis postgres
#   # terminal 1 — frontend on host (Postgres :15432 in dev compose):
#   cd frontend && npm run build
#   ENVIRONMENT=production \
#     REDIS_URL=redis://127.0.0.1:6379 \
#     DATABASE_URL=postgresql://cyberedu:cyberedu_dev_password@127.0.0.1:15432/cyberedu?schema=public \
#     npm run start
#   # terminal 2:
#   CHECK_REDIS=1 BASE_URL=http://127.0.0.1:3100 REDIS_URL=redis://127.0.0.1:6379 \
#     ./scripts/staging-smoke.sh
#   # или только Playwright:
#   SMOKE_MODE=prod-e2e ./scripts/staging-smoke.sh
#
# Remote staging:
#   BASE_URL=https://learn.example.com CHECK_REDIS=1 ./scripts/staging-smoke.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SMOKE_MODE="${SMOKE_MODE:-full}"

BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
BASE_URL="${BASE_URL%/}"
RUN_E2E="${RUN_E2E:-0}"
RUN_E2E_MODE="${RUN_E2E_MODE:-dev}"
CHECK_NGINX="${CHECK_NGINX:-0}"
ALLOW_DEGRADED="${ALLOW_DEGRADED:-0}"

# Defaults for local prod/staging checks
if [[ "$SMOKE_MODE" == "prod-e2e" ]]; then
  CHECK_REDIS="${CHECK_REDIS:-1}"
  REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
  RUN_E2E="${RUN_E2E:-1}"
  RUN_E2E_MODE="${RUN_E2E_MODE:-staging}"
  ENVIRONMENT="${ENVIRONMENT:-production}"
elif [[ "${ENVIRONMENT:-}" == "production" ]] || [[ "$RUN_E2E_MODE" == "staging" ]]; then
  CHECK_REDIS="${CHECK_REDIS:-1}"
  REDIS_URL="${REDIS_URL:-redis://127.0.0.1:6379}"
else
  CHECK_REDIS="${CHECK_REDIS:-0}"
fi

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

redis_ping() {
  [[ -n "${REDIS_URL:-}" ]] || fail "CHECK_REDIS=1 requires REDIS_URL (e.g. redis://127.0.0.1:6379). Start: docker compose up -d redis"
  echo "[redis] PING $REDIS_URL"
  (
    cd "$ROOT/frontend"
    node scripts/redis-ping.mjs "$REDIS_URL"
  )
  ok "Redis PING"
}

run_prod_e2e() {
  [[ -n "${REDIS_URL:-}" ]] || fail "prod E2E requires REDIS_URL (real Redis, no in-memory bypass)"
  if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
    fail "Run: cd cyberedu/frontend && npm ci"
  fi
  redis_ping
  echo ""
  echo "[e2e] Playwright prod smoke (ENVIRONMENT=production)"
  (
    cd "$ROOT/frontend"
    export PLAYWRIGHT_BASE_URL="$BASE_URL"
    export REDIS_URL
    export ENVIRONMENT="${ENVIRONMENT:-production}"
    export E2E_PRODUCTION_SMOKE=1
    npm run test:e2e:prod
  )
  ok "Playwright prod smoke"
}

if [[ "$SMOKE_MODE" == "prod-e2e" ]]; then
  echo "=== CyberEdu prod E2E smoke (local) ==="
  echo "BASE_URL=$BASE_URL REDIS_URL=$REDIS_URL"
  echo ""
  run_prod_e2e
  echo ""
  green "=== Prod E2E smoke passed ==="
  exit 0
fi

echo "=== CyberEdu staging smoke ==="
echo "BASE_URL=$BASE_URL SMOKE_MODE=$SMOKE_MODE"
echo "CHECK_REDIS=$CHECK_REDIS RUN_E2E=$RUN_E2E RUN_E2E_MODE=$RUN_E2E_MODE"
echo ""

if [[ "$CHECK_REDIS" == "1" ]]; then
  echo "[0] Redis (direct)"
  redis_ping
  echo ""
fi

echo "[1/4] API health"
health_code="$(http_code "$BASE_URL/api/health")"
health_body="$(curl -s "$BASE_URL/api/health" || fail "GET /api/health unreachable")"
echo "$health_body (HTTP $health_code)"
if echo "$health_body" | grep -q '"status":"ok"' && echo "$health_body" | grep -q '"database":"ok"'; then
  if [[ "$CHECK_REDIS" == "1" ]]; then
    echo "$health_body" | grep -q '"redis":"ok"' || fail 'health redis != ok (start app with ENVIRONMENT=production and REDIS_URL=redis://127.0.0.1:6379)'
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
  if [[ "$RUN_E2E_MODE" == "staging" ]]; then
    run_prod_e2e
  else
    echo "[4/4] Playwright E2E (dev smoke)"
    if [[ ! -d "$ROOT/frontend/node_modules" ]]; then
      fail "Run: cd cyberedu/frontend && npm ci"
    fi
    (
      cd "$ROOT/frontend"
      export PLAYWRIGHT_BASE_URL="$BASE_URL"
      export E2E_USE_SEED_CREDENTIALS="${E2E_USE_SEED_CREDENTIALS:-1}"
      export ENVIRONMENT="${ENVIRONMENT:-test}"
      npm run test:e2e
    )
    ok "Playwright smoke (dev)"
  fi
else
  echo "[4/4] Playwright E2E — skip"
  echo "  prod:  SMOKE_MODE=prod-e2e  или  RUN_E2E=1 RUN_E2E_MODE=staging CHECK_REDIS=1 REDIS_URL=..."
  echo "  dev:   RUN_E2E=1 BASE_URL=$BASE_URL"
fi

echo ""
green "=== Staging smoke passed ==="
