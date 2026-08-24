#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if command -v python3 >/dev/null 2>&1; then
  (sleep 1; python3 -m webbrowser http://localhost:4180/ >/dev/null 2>&1 || true) &
  exec python3 -m http.server 4180
fi

echo "Python 3 is required to start the offline presentation."
exit 1
