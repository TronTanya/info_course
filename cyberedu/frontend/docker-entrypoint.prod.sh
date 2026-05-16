#!/bin/sh
# Production: миграции выполняет отдельный one-shot сервис `frontend-migrate`.
set -e
echo "[cyberedu] starting Next.js (production)..."
exec node server.js
