#!/usr/bin/env bash
# Uptime / cron monitor: exit 0 только при status=ok (и redis ok в production).
#
#   BASE_URL=https://your-domain ./scripts/monitor-health.sh
#   CHECK_NGINX=1 BASE_URL=https://your-domain ./scripts/monitor-health.sh
#
# Cron + mail/alerting:
#   */5 * * * * cd /opt/cyberedu && BASE_URL=https://learn.example.com ./scripts/monitor-health.sh || logger -t cyberedu-health "degraded"
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
BASE_URL="${BASE_URL%/}"
CHECK_NGINX="${CHECK_NGINX:-0}"
TIMEOUT_SEC="${TIMEOUT_SEC:-15}"
ALLOW_DEGRADED="${ALLOW_DEGRADED:-0}"

fail() {
  echo "monitor-health: $*" >&2
  exit 1
}

health_body="$(curl -fsS --max-time "$TIMEOUT_SEC" "$BASE_URL/api/health")" || fail "GET /api/health unreachable"

if command -v jq >/dev/null 2>&1; then
  status="$(echo "$health_body" | jq -r '.status // empty')"
  db="$(echo "$health_body" | jq -r '.checks.database // empty')"
  redis="$(echo "$health_body" | jq -r '.checks.redis // empty')"
else
  status="$(echo "$health_body" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')"
  db="$(echo "$health_body" | sed -n 's/.*"database":"\([^"]*\)".*/\1/p')"
  redis="$(echo "$health_body" | sed -n 's/.*"redis":"\([^"]*\)".*/\1/p')"
fi

[[ "$status" == "ok" ]] || {
  if [[ "$ALLOW_DEGRADED" == "1" && "$status" == "degraded" ]]; then
    echo "WARN: health status=degraded (ALLOW_DEGRADED=1)"
  else
    fail "status=$status body=$health_body"
  fi
}

[[ "$db" == "ok" ]] || fail "database check=$db"

if [[ "$redis" == "error" ]]; then
  fail "redis check=error (production requires Redis)"
fi

if [[ "$CHECK_NGINX" == "1" ]]; then
  code="$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT_SEC" "$BASE_URL/nginx-health")"
  [[ "$code" == "200" ]] || fail "/nginx-health HTTP $code"
fi

echo "monitor-health: OK ($BASE_URL status=$status db=$db redis=${redis:-n/a})"
