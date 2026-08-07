#!/bin/bash
# FIU MCP 网关连通性测试
# 只用 skills/fiu-finance-mcp/scripts/call.js，无需 curl / jq

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$SCRIPT_DIR/skills/fiu-finance-mcp"

if [ -z "${FIU_MCP_GATEWAY_AUTHORIZATION:-}" ]; then
    echo "❌ 请设置 FIU_MCP_GATEWAY_AUTHORIZATION 环境变量"
    echo "请访问 http://ai.szfiu.com 申请 API Key"
    echo ""
    echo "使用示例："
    echo "  export FIU_MCP_GATEWAY_AUTHORIZATION=\"Bearer YOUR_API_KEY\""
    echo "  ./test.sh"
    exit 1
fi

if ! command -v node > /dev/null 2>&1; then
    echo "❌ 未找到 node，call.js 需要 Node.js 运行"
    exit 1
fi

echo "🧪 FIU MCP 连接测试"
echo "==================="
echo "端点：${FIU_MCP_URL:-http://ai.szfiu.com/api/mcp/v2}"
echo ""

cd "$SKILL_DIR"
FAILED=0

step() {
    local label="$1"; shift
    printf '%s ... ' "$label"
    if out=$(node scripts/call.js "$@" 2>&1); then
        printf '✅\n'
        printf '%s\n' "$out" | head -6 | sed 's/^/    /'
    else
        printf '❌\n'
        printf '%s\n' "$out" | head -6 | sed 's/^/    /'
        FAILED=1
    fi
    echo ""
}

step "1️⃣  tools/list（工具目录）" list
step "2️⃣  describe_tool（目录查询）" describe quote_spot
step "3️⃣  港股行情 00700.hk" call quote_spot -e get_quote -p market=HK -p assetType=stock -p symbols=00700.hk
step "4️⃣  美股行情 AAPL.us" call quote_spot -e get_quote -p market=US -p assetType=stock -p symbols=AAPL.us
step "5️⃣  A 股行情 600519.sh" call quote_spot -e get_quote -p market=CN -p assetType=stock -p symbols=600519.sh

if [ "$FAILED" -eq 0 ]; then
    echo "✅ 测试完成，全部通过"
else
    echo "⚠️  测试完成，有步骤失败 —— 401 请检查 API Key，参数错误见 error.details.issues"
    exit 1
fi
