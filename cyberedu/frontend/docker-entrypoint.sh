#!/bin/sh
set -e
cd /tools
echo "[cyberedu] prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy
echo "[cyberedu] prisma generate (sync client with schema)..."
./node_modules/.bin/prisma generate
mkdir -p /app/node_modules
cp -r node_modules/.prisma /app/node_modules/.prisma 2>/dev/null || true
cp -r node_modules/@prisma/client /app/node_modules/@prisma/client 2>/dev/null || true
cp -r node_modules/@prisma /app/node_modules/@prisma 2>/dev/null || true
cd /app

# Seed только при RUN_SEED=1. Production использует docker-entrypoint.prod.sh (без seed).
# ENVIRONMENT=production — дополнительная защита, если по ошибке вызван dev-entrypoint.
_run_seed() {
  case "${ENVIRONMENT:-development}" in
    production|prod|PRODUCTION|PROD)
      echo "[cyberedu] seed blocked: ENVIRONMENT=production (set RUN_SEED=0; use docker-entrypoint.prod.sh)" >&2
      return 1
      ;;
  esac
  echo "[cyberedu] seed (RUN_SEED=1)..."
  NODE_PATH=/tools/node_modules /tools/node_modules/.bin/tsx prisma/seed.ts
}

case "${RUN_SEED:-0}" in
  1)
    _run_seed
    ;;
  0|false|FALSE|no|NO|"")
    echo "[cyberedu] seed skipped (set RUN_SEED=1 for demo data; never in production)"
    ;;
  *)
    echo "[cyberedu] seed skipped: RUN_SEED='${RUN_SEED}' (only RUN_SEED=1 enables seed)" >&2
    ;;
esac

echo "[cyberedu] starting app..."
exec node server.js
