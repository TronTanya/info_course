#!/bin/sh
# Production: миграции — сервис `frontend-migrate`; seed не выполняется (RUN_SEED=0).
set -e
if [ "${RUN_SEED:-0}" = "1" ]; then
  echo "[cyberedu] FATAL: RUN_SEED=1 запрещён в production" >&2
  exit 1
fi
echo "[cyberedu] starting Next.js (production)..."
exec node server.js
