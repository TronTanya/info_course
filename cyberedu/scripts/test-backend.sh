#!/usr/bin/env bash
# Backend pytest (Python 3.12+). DB contract tests need Postgres on DATABASE_URL.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

PY="${PYTHON:-python3.12}"
if ! command -v "$PY" >/dev/null 2>&1; then
  echo "Need Python 3.12+ (set PYTHON=...). CI uses 3.12." >&2
  exit 1
fi

if [[ ! -d .venv ]]; then
  "$PY" -m venv .venv
  .venv/bin/pip install -q -r requirements.txt
fi

export ENVIRONMENT="${ENVIRONMENT:-development}"
export SKIP_DB_LIFESPAN_CHECK="${SKIP_DB_LIFESPAN_CHECK:-1}"
export JWT_SECRET_KEY="${JWT_SECRET_KEY:-ci-jwt-secret-key-minimum-32-characters-long}"
# STRICT_DB_CONTRACT=1 + Postgres на :15432 — полный schema contract (чистая Prisma-only БД).
if [[ "${STRICT_DB_CONTRACT:-0}" == "1" ]]; then
  export DATABASE_URL="${DATABASE_URL:-postgresql+psycopg://cyberedu:cyberedu_password@127.0.0.1:15432/cyberedu}"
fi

ARGS=("$@")
if [[ ${#ARGS[@]} -eq 0 ]]; then
  ARGS=(-q)
fi

exec .venv/bin/pytest "${ARGS[@]}"
