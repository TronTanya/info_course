#!/usr/bin/env bash
# Откат на предыдущий релиз (GHCR tags), записанный vps-deploy.sh в .deploy/last-release.env
#
#   ./scripts/rollback-production.sh
#   ./scripts/rollback-production.sh .deploy/previous-release.env
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"
STATE_FILE="${1:-.deploy/previous-release.env}"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "rollback-production: нет $STATE_FILE — сначала нужен успешный deploy с DEPLOY_FROM_GHCR=1" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$STATE_FILE"

: "${GHCR_OWNER:?GHCR_OWNER missing in state}"
: "${CYBEREDU_IMAGE_TAG:?CYBEREDU_IMAGE_TAG missing in state}"

export GHCR_OWNER CYBEREDU_IMAGE_TAG
export DEPLOY_FROM_GHCR=1

echo "[rollback] → ghcr.io/$GHCR_OWNER tag $CYBEREDU_IMAGE_TAG (from $STATE_FILE)"
exec "$ROOT/deploy/scripts/vps-deploy.sh"
