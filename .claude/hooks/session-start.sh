#!/bin/bash
set -euo pipefail

# Only run in remote (web) sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Start HTTP server in background if not already running
if ! lsof -i :8000 -sTCP:LISTEN -t &>/dev/null 2>&1; then
  cd "$CLAUDE_PROJECT_DIR"
  python3 -m http.server 8000 &>/dev/null &
  disown
  echo "Server avviato su http://localhost:8000"
else
  echo "Server già in ascolto su porta 8000"
fi
