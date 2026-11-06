#!/usr/bin/env bash
# Install FIU skills into the local OpenClaw skills directory.
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills"
DEST_DIR="${OPENCLAW_SKILLS_DIR:-$HOME/.openclaw/skills}"

echo "==> Installing FIU skills"
echo "    from: $SRC_DIR"
echo "    to:   $DEST_DIR"

if [ ! -d "$SRC_DIR" ]; then
  echo "!! skills/ not found. Run this script from the repository root." >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

for skill in "$SRC_DIR"/*/; do
  name="$(basename "$skill")"
  rm -rf "${DEST_DIR:?}/$name"
  cp -r "$skill" "$DEST_DIR/"
  echo "    installed: $name"
done

echo
echo "==> Done"
echo
echo "Next: export your API key so the helper scripts can authenticate."
echo
echo "    export FIU_MCP_GATEWAY_AUTHORIZATION=\"Bearer YOUR_API_KEY\""
echo
echo "Get a key at https://ai.szfiu.com"
echo "Then verify with: ./test.sh"
