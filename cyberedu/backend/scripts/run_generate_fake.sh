#!/usr/bin/env sh
# Запуск генерации course_progress с зависимостями из venv (решает ModuleNotFoundError: psycopg).
set -e
cd "$(dirname "$0")/.."
if [ ! -d .venv ]; then
  echo "Создаю .venv и ставлю requirements.txt …"
  python3 -m venv .venv
  .venv/bin/pip install -U pip
  .venv/bin/pip install -r requirements.txt
fi
exec .venv/bin/python scripts/generate_fake_course_progress.py "$@"
