#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/gnn-interactive-deck/dist"
RELEASE_DIR="$ROOT_DIR/offline-release"
STAGING_DIR="$RELEASE_DIR/gnn-visual-lecture"
ARCHIVE="$RELEASE_DIR/gnn-visual-lecture.zip"

rm -rf "$STAGING_DIR" "$ARCHIVE"
mkdir -p "$STAGING_DIR"
cp -R "$DIST_DIR"/. "$STAGING_DIR"/
cp "$ROOT_DIR/scripts/offline/README_OFFLINE.txt" "$STAGING_DIR"/
cp "$ROOT_DIR/scripts/offline/start-local.sh" "$STAGING_DIR"/
cp "$ROOT_DIR/scripts/offline/start-windows.bat" "$STAGING_DIR"/
chmod +x "$STAGING_DIR/start-local.sh"

mkdir -p "$RELEASE_DIR"
(
  cd "$RELEASE_DIR"
  python3 -m zipfile -c "$(basename "$ARCHIVE")" "$(basename "$STAGING_DIR")"
)

echo "Created $ARCHIVE"
