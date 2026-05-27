#!/usr/bin/env bash
# Проверка .env.production перед деплоем: слабые секреты, seed, placeholders.
# Использование: ./scripts/validate-prod-env.sh [.env.production]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT/.env.production}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[validate-prod-env] FATAL: файл не найден: $ENV_FILE" >&2
  exit 1
fi

# Пример для compose config — не валидируем как production secrets.
case "$(basename "$ENV_FILE")" in
  .env.prod.example | .env.production.example | .env.example)
    echo "[validate-prod-env] skip example env: $ENV_FILE"
    exit 0
    ;;
esac

fail() {
  echo "[validate-prod-env] FATAL: $*" >&2
  exit 1
}

warn() {
  echo "[validate-prod-env] WARN: $*" >&2
}

# shellcheck disable=SC1090
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

if [[ "${RUN_SEED:-0}" == "1" ]]; then
  fail "RUN_SEED=1 запрещён в production"
fi

env_lower="$(echo "${ENVIRONMENT:-}" | tr '[:upper:]' '[:lower:]')"
if [[ -n "$env_lower" && "$env_lower" != "production" && "$env_lower" != "prod" ]]; then
  fail "ENVIRONMENT должен быть production (сейчас: ${ENVIRONMENT})"
fi

if [[ "${TRUSTED_PROXY:-0}" != "1" ]]; then
  warn "TRUSTED_PROXY не равен 1 — rate limit / audit IP могут быть неверны за reverse proxy"
fi

if [[ -z "${REDIS_PASSWORD:-}" ]]; then
  fail "REDIS_PASSWORD обязателен в production"
fi

auth_secret="$(echo "${AUTH_SECRET:-}" | tr -d '"' | tr -d "'")"
if [[ ${#auth_secret} -lt 32 ]]; then
  fail "AUTH_SECRET должен быть не короче 32 символов"
fi

# Placeholders из шаблона — не должны оставаться на VPS.
if grep -Ei 'CHANGE_ME|your-domain\.example' "$ENV_FILE" >/dev/null 2>&1; then
  fail "в $ENV_FILE остались placeholder (CHANGE_ME / your-domain.example) — замените перед деплоем"
fi

# Известные dev/demo значения из репозитория.
FORBIDDEN_RE='dev-secret-change-me|cyberedu-dev-internal-api-key-change-me|Admin12345!|Student12345!|@cyberedu\.local'
if grep -Ei "$FORBIDDEN_RE" "$ENV_FILE" >/dev/null 2>&1; then
  fail "обнаружены dev/demo секреты или учётки в $ENV_FILE"
fi

echo "[validate-prod-env] OK: $ENV_FILE"
