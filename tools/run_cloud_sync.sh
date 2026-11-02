#!/bin/sh
# Runs tests/cloud_sync.py (or the test file given as the first argument, for example tests/err_report.py) against a local Pages server (wrangler pages dev with a local D1) and stops the server again.
# Usage: bash tools/run_cloud_sync.sh   Needs: node, npx (wrangler is fetched by npx), python3 with playwright.
set -e
cd "$(dirname "$0")/.."
sh tools/pages_dist.sh >/dev/null
PORT=${PORT:-8788}
LOG=${TMPDIR:-/tmp}/wrangler-cloud-sync.log
npx --yes wrangler@4 pages dev --port "$PORT" --binding DEV_USER=a@test.dev --binding ACCESS_TEAM= >"$LOG" 2>&1 &
WR=$!
trap 'kill $WR 2>/dev/null || true; pkill -P $WR 2>/dev/null || true' EXIT
i=0
until curl -fs "http://localhost:$PORT/api/ping" >/dev/null 2>&1 || curl -fs "http://localhost:$PORT/index.html" >/dev/null 2>&1; do
  i=$((i+1)); [ $i -gt 90 ] && { echo "wrangler did not start, see $LOG"; tail -20 "$LOG"; exit 2; }
  sleep 2
done
BASE="http://localhost:$PORT" python3 "${1:-tests/cloud_sync.py}"
