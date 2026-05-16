#!/usr/bin/env bash
# Миграции Alembic через venv проекта (избегает ModuleNotFoundError: psycopg у системного python).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PYTHONPATH="${ROOT}/src"

if [[ ! -x "${ROOT}/.venv/bin/alembic" ]]; then
  echo "Нет ${ROOT}/.venv/bin/alembic — создайте окружение:" >&2
  echo "  cd ${ROOT} && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
  exit 1
fi

if [[ -f "${ROOT}/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${ROOT}/.env"
  set +a
fi

exec "${ROOT}/.venv/bin/alembic" "$@"
