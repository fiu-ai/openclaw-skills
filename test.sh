#!/bin/bash
# 测试 FIU MCP 连接
# 验证 Token 和 API 连接是否正常

set -e

TOKEN="${FIU_MCP_TOKEN:-}"

if [ -z "$TOKEN" ]; then
    echo "❌ 请设置 FIU_MCP_TOKEN 环境变量"
    echo "请访问 https://mcp.szfiu.com/auth/login 获取 Token"
    echo ""
    echo "使用示例："
    echo "  export FIU_MCP_TOKEN=\"your_jwt_token_here\""
    echo "  ./test.sh"
    exit 1
fi

echo "🧪 FIU MCP 连接测试"
echo "=================="
echo ""

# 测试 Toolkit（无需认证）- JSON-RPC 2.0 格式
echo "1️⃣  测试 Toolkit (证券代码检索)..."
RESPONSE=$(curl -s -X POST "https://mcp.szfiu.com/toolkit/" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d '{
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "search",
            "arguments": {
                "keyword": "腾讯"
            }
        }
    }')

if echo "$RESPONSE" | jq -e '.result' > /dev/null 2>&1; then
    echo "✅ Toolkit API 连接成功"
    echo "$RESPONSE" | jq '.result' | head -20
elif echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "⚠️  Toolkit API 返回错误"
    echo "$RESPONSE" | jq '.error' | head -10
else
    echo "✅ Toolkit API 响应正常"
    echo "$RESPONSE" | head -20
fi

echo ""

# 测试港股 SDK（需要认证）- JSON-RPC 2.0 格式
echo "2️⃣  测试港股 SDK (市场快照)..."
RESPONSE=$(curl -s -X POST "https://mcp.szfiu.com/stock_hk_sdk/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d '{
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "quote",
            "arguments": {
                "symbol": "00700.HK"
            }
        }
    }')

if echo "$RESPONSE" | jq -e '.result' > /dev/null 2>&1; then
    echo "✅ 港股 SDK API 连接成功"
    echo "腾讯控股行情数据已获取"
    echo "$RESPONSE" | jq '.result' | head -20
elif echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    echo "⚠️  港股 SDK API 返回错误"
    echo "$RESPONSE" | jq '.error' | head -10
else
    echo "✅ 港股 SDK API 响应正常"
    echo "$RESPONSE" | head -20
fi

echo ""
echo "✅ 测试完成！"
