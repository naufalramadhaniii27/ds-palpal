#!/bin/bash
# Siapkan alat build dan tes untuk sesi Claude Code cloud.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# typescript-language-server for the typescript-lsp plugin (code intelligence in src/)
if ! command -v typescript-language-server >/dev/null; then
  npm install -g --no-audit --no-fund typescript-language-server typescript
fi

# esbuild, eslint, typescript untuk build.py
hashes=tools/build/node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  npm install --prefix tools/build --no-audit --no-fund
  sha256sum .claude/hooks/session-start.sh tools/build/package.json tools/build/package-lock.json > "$hashes" || rm -f "$hashes"
fi

# Playwright Python (versi sama dengan CI) dan brotli. Chromium sudah terpasang di container.
pyhashes="$(python3 -I -c 'import sysconfig; print(sysconfig.get_path("purelib"))')/.session-start.sha256"
if ! sha256sum --check --status "$pyhashes" 2>/dev/null; then
  rm -f "$pyhashes"
  python3 -m pip install -q "playwright==1.63.0" brotli
  sha256sum .claude/hooks/session-start.sh > "$pyhashes" || rm -f "$pyhashes"
fi
