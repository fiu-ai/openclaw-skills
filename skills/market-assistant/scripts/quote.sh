#!/bin/bash
# FIU MCP - 市场快照查询
# 获取股票最新报价、涨跌幅、成交量等

set -e

SYMBOL="${1:-}"
MARKET="${2:-HK}"

if [ -z "$SYMBOL" ]; then
    echo "用法：quote.sh <股票代码> [市场 HK|US|CN]"
    echo "示例：quote.sh 00700.HK HK"
    exit 1
fi

# 根据市场选择端点
case "$MARKET" in
    HK)
        ENDPOINT="https://mcp.szfiu.com/stock_hk_sdk/"
        ;;
    US)
        ENDPOINT="https://mcp.szfiu.com/stock_us_sdk/"
        ;;
    CN)
        ENDPOINT="https://mcp.szfiu.com/stock_cn_sdk/"
        ;;
    *)
        echo "错误：市场参数必须是 HK、US 或 CN"
        exit 1
        ;;
esac

# 获取 Token
TOKEN="${FIU_MCP_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "错误：请设置 FIU_MCP_TOKEN 环境变量"
    exit 1
fi

# 调用 API
curl -s -X POST "$ENDPOINT" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"tool\": \"quote\",
        \"params\": {
            \"symbol\": \"$SYMBOL\"
        }
    }" | jq .
