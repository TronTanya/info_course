#!/usr/bin/env bash
# Запрет sync consumeRateLimit в runtime-коде (production → deny-all).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
cd "$FRONTEND"

fail() {
  echo "check-rate-limit-production: $*" >&2
  exit 1
}

search() {
  local pattern="$1"
  shift
  if command -v rg >/dev/null 2>&1; then
    rg -l "$pattern" "$@" 2>/dev/null || true
  else
    grep -Rsl "$pattern" "$@" 2>/dev/null || true
  fi
}

# Sync limiter — только в rate-limit-service.ts (deprecated internal helper).
SYNC_DEV="$(search 'consumeRateLimitSyncDevOnly_DEPRECATED_DO_NOT_USE_IN_SERVER_ACTIONS|consumeRateLimitSyncDevOnly[^_A-Z]' \
  app lib components middleware.ts \
  --glob '!lib/security/rate-limit-service.ts' \
  --glob '!tests/**' 2>/dev/null || true)"

if [[ -n "${SYNC_DEV// }" ]]; then
  echo "Forbidden sync rate limit helper in:"
  echo "$SYNC_DEV"
  fail "use enforceRateLimit / enforceServerActionRateLimit (Redis async)"
fi

if command -v rg >/dev/null 2>&1; then
  SYNC_HITS="$(rg 'consumeRateLimit\(' \
    --glob '*.ts' --glob '*.tsx' \
    --glob '!lib/security/rate-limit.ts' \
    --glob '!lib/rate-limit.ts' \
    --glob '!lib/security/rate-limit-service.ts' \
    --glob '!tests/**' \
    app lib components middleware.ts 2>/dev/null \
    | rg -v 'consumeRateLimitAsync|consumeRateLimitKey' || true)"
else
  SYNC_HITS="$(grep -Rsl 'consumeRateLimit(' app lib components middleware.ts 2>/dev/null \
    | grep -v rate-limit-service \
    | grep -v 'lib/security/rate-limit.ts' \
    | grep -v 'lib/rate-limit.ts' \
    | grep -v '/tests/' \
    | grep -v consumeRateLimitAsync \
    | grep -v consumeRateLimitKey || true)"
fi

if [[ -n "${SYNC_HITS// }" ]]; then
  echo "Forbidden sync consumeRateLimit in:"
  echo "$SYNC_HITS"
  fail "use enforceRateLimit / enforceServerActionRateLimit (Redis async)"
fi

for f in middleware.ts lib/actions/test.ts lib/actions/practice.ts; do
  [[ -f "$f" ]] || continue
  if grep -qE 'consumeRateLimit\(|consumeRateLimitSyncDevOnly' "$f" 2>/dev/null \
    || grep -q 'consumeRateLimitSyncDevOnly_DEPRECATED' "$f" 2>/dev/null; then
    fail "sync rate limit in $f"
  fi
done

echo "check-rate-limit-production: OK"
