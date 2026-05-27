#!/usr/bin/env bash
# Быстрый деплой на VPS (из каталога cyberedu/)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="docker-compose.prod.yml"
TLS_CONF="${TLS_CONF:-deploy/nginx/conf.d/cyberedu.ssl.conf}"
ALLOW_HTTP_BOOTSTRAP="${ALLOW_HTTP_BOOTSTRAP:-0}"
DEPLOY_FROM_GHCR="${DEPLOY_FROM_GHCR:-0}"
DEPLOY_STATE_DIR="${DEPLOY_STATE_DIR:-.deploy}"
RUN_SMOKE="${RUN_SMOKE:-1}"
BASE_URL_SMOKE="${BASE_URL_SMOKE:-}"

mkdir -p "$DEPLOY_STATE_DIR"

compose_args() {
  local args=(-f "$COMPOSE_FILE" --env-file "$ENV_FILE")
  if [[ "$DEPLOY_FROM_GHCR" == "1" ]]; then
    args+=(-f docker-compose.prod.ghcr.yml)
  fi
  printf '%s\n' "${args[@]}"
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Создайте $ENV_FILE из .env.prod.example" >&2
  exit 1
fi

echo "[deploy] validate production env…"
./scripts/validate-prod-env.sh "$ENV_FILE"

if [[ "$ALLOW_HTTP_BOOTSTRAP" != "1" ]]; then
  if [[ ! -f "$TLS_CONF" ]]; then
    echo "TLS config not found: $TLS_CONF" >&2
    echo "Скопируйте deploy/nginx/conf.d/cyberedu.ssl.conf.example -> $TLS_CONF и задайте домен/сертификаты." >&2
    echo "Для одноразового HTTP bootstrap установите ALLOW_HTTP_BOOTSTRAP=1." >&2
    exit 1
  fi
  if rg -n "YOUR_DOMAIN|ssl_certificate\\s+/etc/nginx/certs/live/YOUR_DOMAIN/" "$TLS_CONF" >/dev/null; then
    echo "TLS config содержит placeholder YOUR_DOMAIN: $TLS_CONF" >&2
    echo "Подставьте реальный домен и пути к сертификату до деплоя." >&2
    exit 1
  fi
fi

mapfile -t COMPOSE_FLAGS < <(compose_args)

if [[ -f "$DEPLOY_STATE_DIR/last-release.env" ]]; then
  cp -a "$DEPLOY_STATE_DIR/last-release.env" "$DEPLOY_STATE_DIR/previous-release.env"
fi

if [[ "$DEPLOY_FROM_GHCR" == "1" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
  if [[ -z "${GHCR_OWNER:-}" || -z "${CYBEREDU_IMAGE_TAG:-}" ]]; then
    echo "DEPLOY_FROM_GHCR=1 требует GHCR_OWNER и CYBEREDU_IMAGE_TAG в $ENV_FILE" >&2
    exit 1
  fi
  echo "[deploy] pull GHCR images (tag=$CYBEREDU_IMAGE_TAG)…"
  docker compose "${COMPOSE_FLAGS[@]}" pull
  echo "[deploy] migrate + up (no local build)…"
  docker compose "${COMPOSE_FLAGS[@]}" up -d --no-build --remove-orphans
else
  echo "[deploy] pull / build…"
  docker compose "${COMPOSE_FLAGS[@]}" build --pull
  echo "[deploy] migrate + up…"
  docker compose "${COMPOSE_FLAGS[@]}" up -d --remove-orphans
fi

echo "[deploy] recording release state → $DEPLOY_STATE_DIR/"
{
  echo "DEPLOYED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "DEPLOY_FROM_GHCR=$DEPLOY_FROM_GHCR"
  if [[ "$DEPLOY_FROM_GHCR" == "1" ]]; then
    echo "GHCR_OWNER=${GHCR_OWNER:-}"
    echo "CYBEREDU_IMAGE_TAG=${CYBEREDU_IMAGE_TAG:-}"
  fi
} >"$DEPLOY_STATE_DIR/last-release.env"
docker compose "${COMPOSE_FLAGS[@]}" images >"$DEPLOY_STATE_DIR/last-images.txt" 2>/dev/null || true

echo "[deploy] status:"
docker compose "${COMPOSE_FLAGS[@]}" ps

if [[ "$RUN_SMOKE" == "1" ]]; then
  smoke_url="${BASE_URL_SMOKE:-}"
  if [[ -z "$smoke_url" ]]; then
    smoke_url="$(grep -E '^AUTH_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")"
  fi
  if [[ -n "$smoke_url" ]]; then
    echo "[deploy] post-deploy health smoke → $smoke_url"
    BASE_URL="$smoke_url" CHECK_NGINX=1 ./scripts/monitor-health.sh
  else
    echo "[deploy] skip smoke (задайте BASE_URL_SMOKE или AUTH_URL в $ENV_FILE)"
  fi
fi

echo "Готово. Проверьте https://ваш-домен, /api/health и /api/v1/health"
echo ""
echo "Smoke после деплоя:"
echo "  BASE_URL=https://ваш-домен CHECK_NGINX=1 ./scripts/staging-smoke.sh"
echo "  BASE_URL=https://ваш-домен RUN_E2E=1 ./scripts/staging-smoke.sh  # при доступном seed"
echo ""
echo "Откат (GHCR): ./scripts/rollback-production.sh"
echo "Бэкап: ./scripts/backup-production.sh"
