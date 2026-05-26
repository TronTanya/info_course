#!/usr/bin/env bash
# Lighthouse для публичного лендинга (ожидает запущенный сервер на BASE_URL).
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3100}"
OUT="${LIGHTHOUSE_OUTPUT:-lighthouse-landing.json}"
LH_VERSION="${LIGHTHOUSE_VERSION:-12.6.0}"

echo "Lighthouse → ${BASE_URL} (report: ${OUT})"

npx --yes "lighthouse@${LH_VERSION}" "${BASE_URL}" \
  --only-categories=performance,accessibility \
  --preset=desktop \
  --quiet \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --output=json \
  --output-path="${OUT}"

node scripts/check-lighthouse-budget.mjs "${OUT}"
