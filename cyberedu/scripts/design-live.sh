#!/usr/bin/env bash
# Живой дизайн и правки UI без пересборки Docker-образа frontend.
# Останавливает только сервис frontend в compose (освобождает порт 3100), поднимает `next dev` с hot reload.
# Требуется: уже запущены postgres (и при необходимости backend) — как при обычном `docker compose up`.
#
# Запуск из каталога cyberedu/:
#   bash scripts/design-live.sh
#   chmod +x scripts/design-live.sh && ./scripts/design-live.sh
#
# Выход: Ctrl+C. Вернуть production-frontend:
#   docker compose up -d frontend

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck source=/dev/null
  source ".env"
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://cyberedu:cyberedu_password@127.0.0.1:15432/cyberedu?schema=public}"
export AUTH_SECRET="${AUTH_SECRET:-dev-secret-change-me-in-production-min-32-chars}"
export AUTH_URL="${AUTH_URL:-http://localhost:3100}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-${AUTH_URL}}"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3100}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:18000}"

echo "==> Останавливаем контейнер frontend (освобождаем порт 3100 для next dev)…"
echo "    Примечание: образ Docker — снимок кода на момент последнего успешного build; без пересборки"
echo "    там может оставаться старая вёрстка (например боковое меню админки). Next dev — актуальный репозиторий."
docker compose stop frontend 2>/dev/null || echo "    (docker compose недоступен или сервис уже остановлен — продолжаем)"

cd "$ROOT/frontend"
if [[ ! -d node_modules ]]; then
  echo "==> Устанавливаем зависимости frontend (первый раз может занять несколько минут)…"
  npm install
fi

echo ""
echo "==> Next.js dev с hot reload: http://localhost:3100"
echo "    Остановка: Ctrl+C"
echo "    Вернуть Docker-frontend: cd \"$ROOT\" && docker compose up -d frontend"
echo ""

exec npm run dev -- --hostname 0.0.0.0 --port 3100
