#!/usr/bin/env bash
# Verify that the FIU Finance MCP endpoint is reachable and the API key works.
set -uo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills/fiu-finance-mcp"
URL="${FIU_MCP_URL:-https://ai.szfiu.com/api/mcp/v2}"

pass=0
fail=0

check() {
  if [ "$1" = "0" ]; then
    echo "  [PASS] $2"
    pass=$((pass + 1))
  else
    echo "  [FAIL] $2"
    fail=$((fail + 1))
  fi
}

echo "==> Environment"
command -v node >/dev/null 2>&1
check $? "node available"

[ -f "$SKILL_DIR/SKILL.md" ]
check $? "SKILL.md present"

[ -f "$SKILL_DIR/scripts/call.js" ]
check $? "scripts/call.js present"

if [ -n "${FIU_MCP_GATEWAY_AUTHORIZATION:-}" ]; then
  check 0 "FIU_MCP_GATEWAY_AUTHORIZATION set"
else
  check 1 "FIU_MCP_GATEWAY_AUTHORIZATION set  (export FIU_MCP_GATEWAY_AUTHORIZATION=\"Bearer YOUR_API_KEY\")"
fi

echo
echo "==> Connection  ($URL)"

out="$(node "$SKILL_DIR/scripts/call.js" list --url "$URL" 2>&1)"
rc=$?

if [ "$rc" = "0" ] && echo "$out" | grep -q "describe_tool"; then
  count="$(echo "$out" | grep -c '"name":')"
  check 0 "tools/list returned $count tools"
else
  check 1 "tools/list"
  echo "$out" | head -5 | sed 's/^/         /'
fi

echo
echo "==> Sample call"

out="$(node "$SKILL_DIR/scripts/call.js" call quote_spot \
  --endpoint get_quote --param market=HK --param assetType=stock --param symbols=00700.hk \
  --url "$URL" 2>&1)"
rc=$?

if [ "$rc" = "0" ]; then
  check 0 "quote_spot / get_quote"
else
  check 1 "quote_spot / get_quote"
  echo "$out" | head -5 | sed 's/^/         /'
fi

echo
echo "==> $pass passed, $fail failed"
[ "$fail" = "0" ]
