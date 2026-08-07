#!/usr/bin/env bash
# Install this single skill into the local OpenClaw skills directory.
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="${OPENCLAW_SKILLS_DIR:-$HOME/.openclaw/skills}"
NAME="$(basename "$SRC_DIR")"

echo "==> Installing $NAME to $DEST_DIR"

mkdir -p "$DEST_DIR"
rm -rf "${DEST_DIR:?}/$NAME"
cp -r "$SRC_DIR" "$DEST_DIR/"

echo "==> Done"
echo
echo "    export FIU_MCP_GATEWAY_AUTHORIZATION=\"Bearer YOUR_API_KEY\""
echo
echo "Get a key at http://ai.szfiu.com"
